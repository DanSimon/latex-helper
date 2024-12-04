import { 
    App, 
    Editor,
    MarkdownView, 
    Plugin,
    Point,
    EditorPosition,
    MarkdownRenderer
} from 'obsidian';

import { ConfigManager } from "./config"
import { SuggestionPopup } from "./suggestion_popup"


export default class WordPopupPlugin extends Plugin {
    configManager: ConfigManager;
    suggestionPopup: SuggestionPopup;
    popupEl: HTMLElement;
    contentEl: HTMLElement;

    async onload() {
        this.configManager = new ConfigManager(this);
        await this.configManager.loadConfig();
        this.suggestionPopup = new SuggestionPopup();
        console.log(`test2 ${this.suggestionPopup}`);
        
        // Create popup container
        this.popupEl = document.createElement('div');
        this.popupEl.addClass('word-popup');
        this.popupEl.style.position = 'absolute';
        this.popupEl.style.zIndex = '1000';
        this.popupEl.style.backgroundColor = 'var(--background-primary)';
        this.popupEl.style.padding = '8px';
        this.popupEl.style.borderRadius = '4px';
        this.popupEl.style.border = '1px solid var(--background-modifier-border)';
        this.popupEl.style.display = 'none';
        this.popupEl.style.maxWidth = '300px'; // Prevent very wide popups

        // Create content container for markdown rendering
        this.contentEl = document.createElement('div');
        this.contentEl.addClass('word-popup-content');
        this.popupEl.appendChild(this.contentEl);
        
        document.body.appendChild(this.popupEl);

        // Register editor change event
        this.registerEvent(
            this.app.workspace.on('editor-change', (editor: Editor, view: MarkdownView) => {
                this.handleEditorChange(editor, view);
            })
        );

        // Hide popup when clicking outside
        this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
            if (!this.popupEl.contains(evt.target as Node)) {
                this.hidePopup();
            }
        });
    }

    onunload() {
        if (this.popupEl) {
            this.popupEl.remove();
        }
    }

    async handleEditorChange(editor: Editor, view: MarkdownView) {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const wordUnderCursor = this.getWordUnderCursor(line, cursor.ch);

        const suggestions = this.configManager.matcher.getSuggestions(wordUnderCursor);

        if (suggestions.suggestions.length > 0) {
            const coords = editor.coordsAtPos(cursor);
            if (!coords) return;
            this.suggestionPopup.show(
                coords.left,
                coords.top,
                wordUnderCursor,
                suggestions.suggestions,
                null,
                suggestions.fastReplace,
                view,
            );

            //const content = suggestions.suggestions.map((s) => `$${s}$`).join(' ');
            //await this.showPopup(editor, cursor, content, view);
        } else {
            this.suggestionPopup.hide();
        }
    }

    hasUnclosedMathSection(str): boolean {
        let inMathMode = false;
        let isDoubleDollar = false;

        // Process string character by character
        for (let i = 0; i < str.length; i++) {
            // Handle escaped dollar signs
            if (str[i] === '\\' && i + 1 < str.length && str[i + 1] === '$') {
                i++; // Skip the escaped dollar sign
                continue;
            }

            // Check for double dollar signs
            if (str[i] === '$' && i + 1 < str.length && str[i + 1] === '$') {
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
            if (str[i] === '$') {
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
            return '';
        }
        let i = lineStr.length - 1;
        while (i >= 0) {
            if (lineStr[i] == '$' || lineStr[i] == ' ' ){
                i += 1;
                break;
            } else {
                i -= 1;
            }
        }
        if (i<=0) {
            return lineStr;
        }
        return lineStr.substr(i);
    }

    async showPopup(editor: Editor, position: EditorPosition, content: string, view: MarkdownView) {
        const coords = editor.coordsAtPos(position);
        if (!coords) return;

        // Clear previous content
        this.contentEl.empty();
        
        // Render the markdown content (including LaTeX)
        MarkdownRenderer.renderMarkdown(
            content,
            this.contentEl,
            view.file.path,
            view
        );

        this.popupEl.style.display = 'block';
        this.popupEl.style.left = `${coords.left}px`;
        this.popupEl.style.top = `${coords.top + 20}px`; // 20px below cursor

        // Ensure popup stays within viewport
        const rect = this.popupEl.getBoundingClientRect();
        const viewport = {
            right: window.innerWidth,
            bottom: window.innerHeight
        };

        if (rect.right > viewport.right) {
            this.popupEl.style.left = `${viewport.right - rect.width - 10}px`;
        }
        if (rect.bottom > viewport.bottom) {
            this.popupEl.style.top = `${coords.top - rect.height - 10}px`;
        }
    }

    hidePopup() {
        this.popupEl.style.display = 'none';
    }
}
