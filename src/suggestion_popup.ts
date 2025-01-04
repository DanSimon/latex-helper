import { MarkdownView } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import SuggestionPopupComponent from "./components/SuggestionPopupComponent";
import { ConfigManager } from "./config";

export interface Suggestion {
    replacement: string;
    displayReplacement: string;
    fastReplace: boolean;
    matchedString: string;
    normalMode?: boolean;
}

export enum TextMode {
    Normal,
    Math,
}

export interface CursorWord {
    word: string;
    mode: TextMode;
}

export class SuggestionPopup {
    private container: HTMLDivElement;
    private currentMatch: CursorWord | null = null;
    private currentReplacements: Suggestion[] | null = null;
    private view: MarkdownView | null = null;
    private visible: boolean = false;
    private configManager: ConfigManager;

    constructor(configManager: ConfigManager) {
        this.container = document.createElement("div");
        document.body.appendChild(this.container);
        this.configManager = configManager;
    }

    show(
        x: number,
        y: number,
        match: CursorWord,
        replacements: Suggestion[],
        view: MarkdownView,
    ): void {
        this.currentMatch = match;
        this.currentReplacements = replacements;
        if (
            this.configManager.config.settings.instantFastReplace &&
            replacements.length > 0 &&
            replacements[0].fastReplace
        ) {
            this.handleSelect(0);
            return;
        }
        this.view = view;
        this.visible = true;
        this.render(x, y);
    }

    hide(): void {
        if (this.visible) {
            this.visible = false;
            this.render(0, 0);
        }
    }

    isVisible(): boolean {
        return this.visible;
    }

    private findFirstBracePair(text: string): number | null {
        const matches = text.match(/\\[a-zA-Z]+(\{\})+/);
        if (!matches) return null;

        const command = matches[0];
        const bracketIndex = command.indexOf("{}");
        if (bracketIndex === -1) return null;

        return bracketIndex + matches.index! + 1;
    }

    private handleSelect = (index: number) => {
        if (!this.currentReplacements || !this.view || !this.currentMatch)
            return;

        const suggestion = this.currentReplacements[index];
        const replacement =
            this.currentMatch.mode == TextMode.Normal
                ? `$${suggestion.replacement}$`
                : suggestion.replacement;
        const start = this.view.editor.offsetToPos(
            this.view.editor.posToOffset(this.view.editor.getCursor()) -
                suggestion.matchedString.length,
        );
        const end = this.view.editor.getCursor();

        const view = this.view;
        view.editor.replaceRange(replacement, start, end);

        // Find cursor position if there are braces
        const cursorOffset = this.findFirstBracePair(replacement);
        if (cursorOffset !== null) {
            const newCursorPos = view.editor.offsetToPos(
                view.editor.posToOffset(start) + cursorOffset,
            );
            view.editor.setCursor(newCursorPos);
        }

        this.hide();
    };

    private render(x: number, y: number) {
        // Always render the component, letting it handle its own visibility
        ReactDOM.render(
            React.createElement(SuggestionPopupComponent, {
                x,
                y,
                match: this.currentMatch?.word || "",
                replacements: this.currentReplacements || [],
                view: this.view!,
                onSelect: this.handleSelect,
                onHide: () => this.hide(),
                visible:
                    this.visible &&
                    !!this.currentMatch &&
                    !!this.currentReplacements &&
                    !!this.view,
                settings: this.configManager.config.settings,
            }),
            this.container,
        );
    }

    destroy(): void {
        if (this.container && this.container.parentNode) {
            ReactDOM.unmountComponentAtNode(this.container);
            this.container.parentNode.removeChild(this.container);
        }
    }
}
