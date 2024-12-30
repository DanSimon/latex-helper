import { Editor, MarkdownView, Plugin } from "obsidian";

import { ConfigManager } from "./config";
import { SuggestionPopup } from "./suggestion_popup";
import { ConfigDialog } from "./config_dialog";
import { SelectionButton } from "./selection_button";
import { MatchForm } from "./match_form";
import { CONFIG_VIEW_TYPE, ConfigView } from "./config_view";
import { Prec } from "@codemirror/state";
import { latexNavigation } from "./tab_extension";
import { SYMBOL_VIEW_TYPE, SymbolReference } from "./symbol_reference";
import { WordPopupSettingTab } from "./settings";

export default class WordPopupPlugin extends Plugin {
    configManager: ConfigManager;
    suggestionPopup: SuggestionPopup;
    selectionButton: SelectionButton;
    configDialog: ConfigDialog;
    matchForm: MatchForm;

    async onload() {
        this.configManager = new ConfigManager(this);
        await this.configManager.loadConfig();
        this.suggestionPopup = new SuggestionPopup();
        this.matchForm = new MatchForm(this.configManager);
        this.configDialog = new ConfigDialog(
            this.configManager,
            this.matchForm,
        );
        this.selectionButton = new SelectionButton(
            this.configManager,
            this.configDialog,
            this.matchForm,
        );

        //this.addChild(this.selectionButton);
        this.addChild(this.configDialog);
        this.addChild(this.matchForm);

        // Register editor change event
        this.registerEvent(
            this.app.workspace.on(
                "editor-change",
                (editor: Editor, view: MarkdownView) => {
                    this.handleEditorChange(editor, view);
                },
            ),
        );

        this.registerEditorExtension(
            Prec.highest(latexNavigation(this.suggestionPopup)),
        );

        this.registerView(
            CONFIG_VIEW_TYPE,
            (leaf) => new ConfigView(leaf, this.configManager, this.matchForm),
        );

        // Add a ribbon icon to activate the view
        this.addRibbonIcon("sigma", "Open LaTeX Reference", async () => {
            const { workspace } = this.app;

            // If the view is already open, show it
            let leaf = workspace.getLeavesOfType(CONFIG_VIEW_TYPE)[0];

            if (!leaf) {
                // If it's not open, create a new leaf and show the view
                leaf = workspace.getRightLeaf(false)!;
                await leaf.setViewState({
                    type: CONFIG_VIEW_TYPE,
                    active: true,
                });
            }

            workspace.revealLeaf(leaf);
        });

        this.registerView(
            SYMBOL_VIEW_TYPE,
            (leaf) => new SymbolReference(leaf),
        );

        // Add a ribbon icon to activate the view
        this.addRibbonIcon("sigma", "Open LaTeX Symbol Reference", async () => {
            const { workspace } = this.app;

            // If the view is already open, show it
            let leaf = workspace.getLeavesOfType(SYMBOL_VIEW_TYPE)[0];

            if (!leaf) {
                // If it's not open, create a new leaf and show the view
                leaf = workspace.getRightLeaf(false)!;
                await leaf.setViewState({
                    type: SYMBOL_VIEW_TYPE,
                    active: true,
                });
            }

            workspace.revealLeaf(leaf);
        });
        this.addSettingTab(new WordPopupSettingTab(this.app, this));

        console.log("Plugin Loaded");
    }

    onunload() {
        this.suggestionPopup.destroy();
    }

    async handleEditorChange(editor: Editor, view: MarkdownView) {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const wordUnderCursor = this.getWordUnderCursor(line, cursor.ch);

        const fillerColor = getComputedStyle(view.containerEl)
            .getPropertyValue("--text-accent")
            .trim();

        const suggestions = this.configManager.matcher.getSuggestions(
            wordUnderCursor,
            fillerColor,
            9,
            this.configManager.config.settings,
        );

        if (suggestions.suggestions.length > 0) {
            // https://forum.obsidian.md/t/is-there-a-way-to-get-the-pixel-position-from-the-cursor-position-in-the-editor/69506
            //@ts-ignore
            const coords = editor.coordsAtPos(cursor);
            if (!coords) return;
            this.suggestionPopup.show(
                coords.right,
                coords.top,
                wordUnderCursor,
                suggestions.suggestions,
                suggestions.fastReplace,
                view,
            );
        } else {
            this.suggestionPopup.hide();
        }
    }

    hasUnclosedMathSection(str: string): boolean {
        let inMathMode = false;
        let isDoubleDollar = false;

        // Process string character by character
        for (let i = 0; i < str.length; i++) {
            // Handle escaped dollar signs
            if (str[i] === "\\" && i + 1 < str.length && str[i + 1] === "$") {
                i++; // Skip the escaped dollar sign
                continue;
            }

            // Check for double dollar signs
            if (str[i] === "$" && i + 1 < str.length && str[i + 1] === "$") {
                if (!inMathMode) {
                    inMathMode = true;
                    isDoubleDollar = true;
                    i++; // Skip second dollar
                } else if (isDoubleDollar) {
                    inMathMode = false;
                    isDoubleDollar = false;
                    i++; // Skip second dollar
                }
                continue;
            }

            // Handle single dollar signs
            if (str[i] === "$") {
                if (!inMathMode) {
                    inMathMode = true;
                    isDoubleDollar = false;
                } else if (!isDoubleDollar) {
                    inMathMode = false;
                }
            }
        }
        return inMathMode;
    }

    getWordUnderCursor(lineStr: string, cursorPos: number): string {
        if (!this.hasUnclosedMathSection(lineStr.slice(0, cursorPos))) {
            return "";
        }
        let i = cursorPos - 1;
        const delims = ["$", " "];
        //for the most part we assume a command is either entirely alpha or entirely symbols
        //this way if the user types "\alpha=bet" we use "bet" as the search string and not the whole thing
        //The main exceptions are with parens and brackets, aka commands like \big)
        const boundaries = ["{", "(", "[", "}", ")", "]"];
        const isAlphaEnd =
            (lineStr[i] >= "a" && lineStr[i] <= "z") ||
            (lineStr[i] >= "A" && lineStr[i] <= "Z") ||
            boundaries.contains(lineStr[i]);
        while (i >= 0) {
            const isAlpha =
                (lineStr[i] >= "a" && lineStr[i] <= "z") ||
                (lineStr[i] >= "A" && lineStr[i] <= "Z");
            if (
                delims.contains(lineStr[i]) ||
                (lineStr[i] != "\\" && isAlpha != isAlphaEnd)
            ) {
                i += 1;
                break;
            } else {
                i -= 1;
            }
        }
        if (i <= 0) {
            return lineStr;
        }
        const res = lineStr.substr(i, cursorPos - i);
        return res;
    }
}
