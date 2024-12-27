//import { TemplateForm } from "./template_form";

import { MarkdownRenderer, MarkdownView } from "obsidian";

const TEMPLATE_PREFIX = "T:";

export class SuggestionPopup {
    private element: HTMLDivElement;
    private currentMatch: string | null;
    private currentReplacements: string[] | null;
    private fastReplace: boolean;
    private selectedIndex: number;
    private view: MarkdownView | null;

    constructor() {
        this.element = this.createElement();
        this.currentMatch = null;
        this.currentReplacements = null;
        this.fastReplace = false;
        this.selectedIndex = -1;
        this.view = null;

        // Bind methods that are used as event handlers
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);

        // Add global event listeners
        document.addEventListener("click", this.handleDocumentClick);
        document.addEventListener("keydown", this.handleKeyDown);
    }

    private createElement(): HTMLDivElement {
        const popup = document.createElement("div");
        popup.style.cssText = `
            position: absolute;
            background: var(--background-primary);
            border: 1px solid var(--background-modifier-border);
            padding: 2px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: none;
            white-space: nowrap;
            z-index: 10000;
        `;
        document.body.appendChild(popup);
        return popup;
    }

    show(
        x: number,
        y: number,
        match: string,
        replacements: string[],
        fastReplace = false,
        view: MarkdownView,
    ): void {
        this.currentMatch = match;
        this.currentReplacements = replacements;
        this.selectedIndex = -1;
        this.fastReplace = fastReplace && replacements.length === 1;
        this.element.style.left = `${x + 5}px`;
        this.element.style.bottom = `${window.innerHeight - y}px`;
        this.element.style.top = "auto";
        this.element.style.display = "block";
        this.view = view;

        this.updateContent();
    }

    hide(): void {
        this.element.style.display = "none";
        this.element.innerHTML = "";
        this.selectedIndex = -1;
        this.currentMatch = null;
        this.currentReplacements = null;
        this.view = null;
    }

    isVisible(): boolean {
        return this.element.style.display == "block";
    }

    private updateContent(): void {
        if (!this.currentMatch || !this.currentReplacements || !this.view)
            return;
        this.element.innerHTML = "";
        const styleElement = document.createElement("style");

        // Define the CSS rule
        const cssRule = `
          .rendered-math p {
            display: inline;
            margin: 0;
            padding: 0;
          }
        `;

        // Add the CSS rule to the style element
        styleElement.textContent = cssRule;

        // Insert the style element as the first child of the div
        this.element.appendChild(styleElement);

        this.currentReplacements.forEach((option, index) => {
            const appliedReplacement = option.startsWith(TEMPLATE_PREFIX)
                ? option.slice(TEMPLATE_PREFIX.length)
                : option;

            const span = document.createElement("span");
            span.id = `suggestion-${index}`;
            span.style.cssText = `
                cursor: pointer;
                padding: 5px;
                display: inline;
            `;

            span.addEventListener("mouseover", () => {
                if (index !== this.selectedIndex) {
                    span.style.background = "var(--background-secondary)";
                }
            });

            span.addEventListener("mouseout", () => {
                if (index !== this.selectedIndex) {
                    span.style.background = "var(--background-primary)";
                }
            });

            span.addEventListener("click", () => {
                this.selectSuggestion(index);
            });

            // Create indicator span
            const indicatorSpan = document.createElement("span");
            if (this.fastReplace && this.currentReplacements?.length === 1) {
                indicatorSpan.style.cssText = `
                    color: #22c55e;
                    margin-right: 2px;
                    font-size: 0.6em;
                `;
                indicatorSpan.textContent = "⚡";
            } else {
                indicatorSpan.style.cssText = `
                    font-size: 0.7em;
                    color: #888;
                    margin-right: 2px;
                `;
                indicatorSpan.textContent = `${index + 1}.`;
            }

            // Create math content span
            const mathSpan = document.createElement("span");
            mathSpan.classList.add("rendered-math");

            span.appendChild(indicatorSpan);
            span.appendChild(mathSpan);
            this.element.appendChild(span);
            if (this.view) {
                MarkdownRenderer.render(
                    this.view.app,
                    `$${appliedReplacement}$`,
                    mathSpan,
                    this.view.file?.path || "",
                    this.view,
                );
            }
        });

        // TypeScript doesn't know about MathJax by default, so we need to declare it
        //(window as any).MathJax.typesetPromise([this.element]);
    }

    private updateSelectedSuggestion(): void {
        const suggestions = this.element.querySelectorAll<HTMLSpanElement>(
            'span[id^="suggestion-"]',
        );
        suggestions.forEach((span) => {
            span.style.background = "var(--background-primary)";
        });

        if (this.selectedIndex >= 0) {
            const selectedSpan = this.element.querySelector<HTMLSpanElement>(
                `#suggestion-${this.selectedIndex}`,
            );
            if (selectedSpan) {
                selectedSpan.style.background = "var(--background-secondary)";
            }
        }
    }

    private findFirstBracePair(text: string): number | null {
        const matches = text.match(/\\[a-zA-Z]+(\{\})+/);
        if (!matches) return null;

        const command = matches[0];
        const bracketIndex = command.indexOf("{}");
        if (bracketIndex === -1) return null;

        return bracketIndex + matches.index! + 1;
    }

    private selectSuggestion(index: number): void {
        if (
            !this.currentReplacements ||
            !this.view ||
            this.currentMatch === null
        )
            return;

        if (index >= 0 && index < this.currentReplacements.length) {
            const replacement = this.currentReplacements[index];

            const start = this.view.editor.offsetToPos(
                this.view.editor.posToOffset(this.view.editor.getCursor()) -
                    this.currentMatch.length,
            );
            const end = this.view.editor.getCursor();

            //calling replaceRange triggers hiding the popup which sets the
            //fields to null
            const view = this.view;
            this.view.editor.replaceRange(replacement, start, end);

            // Find cursor position if there are braces
            const cursorOffset = this.findFirstBracePair(replacement);
            if (cursorOffset !== null) {
                const newCursorPos = view.editor.offsetToPos(
                    view.editor.posToOffset(start) + cursorOffset,
                );
                view.editor.setCursor(newCursorPos);
            }

            this.hide();
        }
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (!this.isVisible || !this.currentReplacements) return;

        // Handle fast replace for non-alphanumeric keys
        if (
            this.fastReplace &&
            !/^[a-zA-Z0-9]$/.test(e.key) &&
            !["Escape", "Tab", "Backspace"].includes(e.key)
        ) {
            this.selectSuggestion(0);
            return;
        }

        switch (e.key) {
            case "Escape":
                this.hide();
                e.preventDefault();
                break;

            case "Tab":
                e.preventDefault();
                if (this.selectedIndex < this.currentReplacements.length - 1) {
                    this.selectedIndex++;
                } else {
                    this.selectedIndex = 0;
                }
                this.updateSelectedSuggestion();
                break;

            case "Enter":
                if (this.selectedIndex >= 0) {
                    e.preventDefault();
                    this.selectSuggestion(this.selectedIndex);
                }
                break;

            default:
                if (e.key >= "1" && e.key <= "9") {
                    const index = parseInt(e.key) - 1;
                    if (index < this.currentReplacements.length) {
                        this.selectSuggestion(index);
                        e.preventDefault();
                    }
                }
        }
    }

    private handleDocumentClick(e: MouseEvent): void {
        if (this.isVisible() && !this.element.contains(e.target as Node)) {
            this.hide();
        }
    }

    destroy(): void {
        document.removeEventListener("click", this.handleDocumentClick);
        document.removeEventListener("keydown", this.handleKeyDown);
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}
