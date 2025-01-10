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

export type ExecuteReplace = (removeChars: number, replacement: string) => void;

export class SuggestionPopup {
    private container: HTMLDivElement;
    private currentMatch: CursorWord | null = null;
    private currentReplacements: Suggestion[] | null = null;
    private view: MarkdownView | null = null;
    private visible: boolean = false;
    private configManager: ConfigManager;
    private executeReplace: ExecuteReplace | null;

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
        executeReplace: ExecuteReplace,
    ): void {
        this.currentMatch = match;
        this.currentReplacements = replacements;
        this.view = view;
        this.visible = true;
        this.executeReplace = executeReplace;
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

    private handleSelect = (index: number) => {
        if (
            !this.currentReplacements ||
            !this.view ||
            !this.currentMatch ||
            !this.executeReplace
        )
            return;

        const suggestion = this.currentReplacements[index];
        const replacement =
            this.currentMatch.mode == TextMode.Normal
                ? `$${suggestion.replacement}$`
                : suggestion.replacement;

        this.executeReplace(suggestion.matchedString.length, replacement);

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
