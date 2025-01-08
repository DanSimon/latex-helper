import { Editor, MarkdownView, Modifier, Platform, Plugin } from "obsidian";

import { ConfigManager } from "./config";
import { CursorWord, SuggestionPopup, TextMode } from "./suggestion_popup";
import { MatchForm } from "./match_form";
import { Prec } from "@codemirror/state";
import { latexNavigation } from "./tab_extension";
import { WordPopupSettingTab } from "./settings";
import { hasUnclosedMathSection } from "./string_utils";
import { getMathBlockFromView, MathBlockType } from "./editor_utils";
import { RIBBON_VIEW_TYPE, RibbonView } from "./ribbon_view";

export default class WordPopupPlugin extends Plugin {
    configManager: ConfigManager;
    suggestionPopup: SuggestionPopup;
    matchForm: MatchForm;

    async onload() {
        this.configManager = new ConfigManager(this);
        await this.configManager.loadConfig();
        this.suggestionPopup = new SuggestionPopup(this.configManager);
        this.matchForm = new MatchForm(this.configManager);
        this.addChild(this.matchForm);

        // Register editor change event
        this.registerEvent(
            this.app.workspace.on(
                "editor-change",
                (editor: Editor, view: MarkdownView) => {
                    if (
                        this.configManager.config.settings.autoShowSuggestions
                    ) {
                        this.showSuggestions(editor, view);
                    }
                },
            ),
        );

        this.registerEditorExtension(
            Prec.highest(
                latexNavigation(
                    this.suggestionPopup,
                    this.configManager.config.settings,
                ),
            ),
        );

        this.registerView(
            RIBBON_VIEW_TYPE,
            (leaf) => new RibbonView(leaf, this.configManager, this.matchForm),
        );

        // Add a ribbon icon to activate the view
        this.addRibbonIcon("sigma", "LaTeX-Helper", async () => {
            const { workspace } = this.app;

            // If the view is already open, show it
            let leaf = workspace.getLeavesOfType(RIBBON_VIEW_TYPE)[0];

            if (!leaf) {
                // If it's not open, create a new leaf and show the view
                leaf = workspace.getRightLeaf(false)!;
                await leaf.setViewState({
                    type: RIBBON_VIEW_TYPE,
                    active: true,
                });
            }

            workspace.revealLeaf(leaf);
        });

        this.addSettingTab(new WordPopupSettingTab(this.app, this));

        this.configManager.onChange.subscribe(() => {
            this.registerHotkey();
        });

        this.registerHotkey();

        console.log("Plugin Loaded");
    }

    onunload() {
        this.suggestionPopup.destroy();
    }

    private parseHotkey(hotkeyStr: string): {
        modifiers: Modifier[];
        key: string;
    } {
        const parts = hotkeyStr.split("+"); //.map((p) => p.trim());
        const key = parts[parts.length - 1].toLowerCase();

        const modifiers: Modifier[] = parts.slice(0, -1).map((mod) => {
            const normalized = mod.toLowerCase();
            switch (normalized) {
                case "ctrl":
                case "control":
                    return Platform.isMacOS ? "Mod" : "Ctrl";
                case "cmd":
                case "command":
                case "meta":
                    return Platform.isMacOS ? "Mod" : "Meta";
                case "alt":
                case "option":
                    return "Alt";
                case "shift":
                    return "Shift";
                default:
                    return "Mod"; // fallback to Mod if unknown
            }
        });

        return { modifiers, key };
    }

    private registerHotkey() {
        const { modifiers, key } = this.parseHotkey(
            this.configManager.config.settings.triggerKey,
        );
        console.log(`register hotkey '${modifiers}' + '${key}'`);

        this.addCommand({
            id: "trigger-latex-suggestions",
            name: "Trigger LaTeX Suggestions",
            hotkeys: [
                {
                    modifiers: modifiers,
                    key: key,
                },
            ],
            editorCallback: (editor: Editor, view: MarkdownView) => {
                this.showSuggestions(editor, view);
            },
        });
    }

    async showSuggestions(editor: Editor, view: MarkdownView) {
        const wordUnderCursor = this.getWordUnderCursor(editor);
        if (!wordUnderCursor) {
            this.suggestionPopup.hide();
            return;
        }

        const fillerColor = getComputedStyle(view.containerEl)
            .getPropertyValue("--text-accent")
            .trim();

        const suggestions = this.configManager.matcher.getSuggestions(
            wordUnderCursor,
            fillerColor,
            9,
            this.configManager.config.settings,
        );

        if (suggestions.length > 0) {
            // https://forum.obsidian.md/t/is-there-a-way-to-get-the-pixel-position-from-the-cursor-position-in-the-editor/69506
            //@ts-ignore
            const coords = editor.coordsAtPos(editor.getCursor());
            if (!coords) return;
            this.suggestionPopup.show(
                coords.right,
                coords.top,
                wordUnderCursor,
                suggestions,
                view,
            );
        } else {
            this.suggestionPopup.hide();
        }
    }

    getWordUnderCursor(editor: Editor): CursorWord | null {
        const cursor = editor.getCursor();
        const cursorPos = cursor.ch;
        const lineStr = editor.getLine(cursor.line);
        //@ts-ignore - Using internal CM6 view
        const blockInfo = getMathBlockFromView(editor.cm);
        const mode =
            blockInfo.type != MathBlockType.None ||
            hasUnclosedMathSection(lineStr.slice(0, cursorPos))
                ? TextMode.Math
                : TextMode.Normal;
        if (
            !this.configManager.config.settings.enableNormalMode &&
            mode == TextMode.Normal
        ) {
            return null;
        }
        let i = cursorPos - 1;
        const delims = ["$", " "];
        while (i >= 0) {
            if (delims.contains(lineStr[i])) {
                i += 1;
                break;
            } else {
                i -= 1;
            }
        }
        if (i <= 0) {
            //return { mode: mode, word: lineStr };
            i = 0;
        }
        const res = lineStr.substr(i, cursorPos - i);
        return { mode: mode, word: res };
    }
}
