import { Component } from 'obsidian'
import { MatchForm } from "./match_form"

export class SelectionButton extends Component{
    private configManager: ConfigManager;
    private element: HTMLButtonElement;
    private selectionTimeout: number | null;
    private configDialog: ConfigDialog;
    private hasMatch: boolean;

    constructor(configManager: ConfigManager, configDialog: ConfigDialog, matchForm: MatchForm) {
        super();
        this.configManager = configManager;
        this.selectionTimeout = null;
        this.configDialog = configDialog;
        this.hasMatch = false;
        this.matchForm = matchForm;
    }

    onload() {
        this.element = this.createElement();
        this.attachEventListeners();

    }

    private createElement(): HTMLButtonElement {
        const button = document.createElement('button');
        button.style.cssText = `
            position: absolute;
            display: none;
            border: 1px solid #ccc;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
            z-index: 10001;
            font-size: 16px;
            line-height: 24px;
            text-align: center;
            padding: 0;
        `;
        document.body.appendChild(button);
        return button;
    }

    private attachEventListeners(): void {
        this.registerDomEvent(this.element, 'click', () => {
            const selectedText = window.getSelection()?.toString().trim() ?? '';
            if (this.hasMatch) {
                this.configDialog.show(selectedText);
            } else {
                this.matchForm.show({pattern: selectedText, replacements:[]});
            }
            window.getSelection()?.empty();
            this.hide();
        });

        this.registerDomEvent(document, 'keyup', () => {
            this.hide();
        });

        this.registerDomEvent(document, 'mouseup', () => {
            this.handleSelection();
        });
    }

    public show(x: number, y: number): void {
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.style.display = 'block';
    }

    public hide(): void {
        this.element.style.display = 'none';
    }

    public handleSelection(): void {
        if (this.selectionTimeout) {
            clearTimeout(this.selectionTimeout);
        }

        this.selectionTimeout = window.setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection?.toString().trim() ?? '';

            if (selectedText.length > 0) {
                this.hasMatch = this.configManager.matcher.getMatchingPatterns(selectedText).length > 0;
                this.updateButtonAppearance();
                const range = selection?.getRangeAt(0);
                const rect = range?.getBoundingClientRect();
                if (rect) {
                    this.show(rect.right + window.pageXOffset, rect.top + window.pageYOffset);
                }
            } else {
                this.hide();
            }
        }, 70);
    }

    private updateButtonAppearance(): void {
        if (this.hasMatch) {
            this.element.textContent = '⚙️';
            this.element.title = 'View matching patterns';
        } else {
            this.element.textContent = '+';
            this.element.title = 'Add new pattern';
        }
    }
}
