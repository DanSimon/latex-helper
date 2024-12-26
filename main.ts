import { Editor, MarkdownView, Plugin } from "obsidian";

import { ConfigManager } from "./config";
import { SuggestionPopup } from "./suggestion_popup";
import { ConfigDialog } from "./config_dialog";
import { SelectionButton } from "./selection_button";
import { MatchForm } from "./match_form";
import { CONFIG_VIEW_TYPE, ConfigView } from "./config_view";

export default class WordPopupPlugin extends Plugin {
    configManager: ConfigManager;
    suggestionPopup: SuggestionPopup;
    selectionButton: SelectionButton;
    configDialog: ConfigDialog;
    matchForm: MatchForm;
    popupEl: HTMLElement;
    contentEl: HTMLElement;

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

        console.log("Plugin Loaded");
    }

    onunload() {
        this.suggestionPopup.destroy();
    }

    async handleEditorChange(editor: Editor, view: MarkdownView) {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const wordUnderCursor = this.getWordUnderCursor(line, cursor.ch);

        const suggestions =
            this.configManager.matcher.getSuggestions(wordUnderCursor);

        if (suggestions.suggestions.length > 0) {
            // https://forum.obsidian.md/t/is-there-a-way-to-get-the-pixel-position-from-the-cursor-position-in-the-editor/69506
            //@ts-ignore
            const coords = editor.coordsAtPos(cursor);
            if (!coords) return;
            this.suggestionPopup.show(
                coords.left,
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
        let i = lineStr.length - 1;
        while (i >= 0) {
            if (lineStr[i] == "$" || lineStr[i] == " ") {
                i += 1;
                break;
            } else {
                i -= 1;
            }
        }
        if (i <= 0) {
            return lineStr;
        }
        return lineStr.substr(i);
    }
}
