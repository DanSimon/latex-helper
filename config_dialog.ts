import {ConfigManager, Pattern} from "./config"
import { MatchForm } from "./match_form"
import { Component } from 'obsidian'


export class ConfigDialog extends Component{
    private element: HTMLDivElement;
    private configManager: ConfigManager;
    private matchForm: MatchForm;
    private config: any;
    private isVisible: boolean;

    constructor(configManager: ConfigManager) {
        super();
        this.configManager = configManager;
        this.config = configManager.config;
        this.isVisible = false;
    }

    onload() {
        this.element = this.createElement();
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
        this.matchForm = new MatchForm(this.configManager);
    }

    private createElement(): HTMLDivElement {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--background-secondary);
            border: 1px solid var(--background-modifier-border-focus);
            border-radius: 4px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: none;
            z-index: 10002;
            max-width: 80%;
            max-height: 80%;
            width: auto;
            overflow-y: auto;
        `;
        document.body.appendChild(dialog);
        return dialog;
    }

    private createEditButton(conf: Pattern): HTMLButtonElement {
        const button = document.createElement('button');
        button.innerHTML = '✏️'; // Edit icon
        button.style.cssText = `
            margin-left: 8px;
            border: none;
            background: none;
            cursor: pointer;
            font-size: 16px;
            padding: 2px 6px;
            border-radius: 4px;
            vertical-align: middle;
        `;
        button.title = 'Edit pattern';

        this.registerDomEvent(button,'click', (e: MouseEvent) => {
            e.stopPropagation(); // Prevent dialog from closing
            this.matchForm.show(conf);
            this.hide();
        });

        return button;
    }

    public show(selectedText: string): void {
        this.element.innerHTML = '';
        const title = document.createElement('h2');
        title.innerHTML = `Matching Patterns for <code>${selectedText}</code>`;
        this.element.appendChild(title);

        const matches = this.configManager.matcher.getMatchingPatterns(selectedText);
        for (const { value, wildcardMatches } of matches) {
            const { pattern, replacements, fastReplace } = value;
            const patternDiv = document.createElement('div');

            // Create pattern header with edit button
            const patternHeader = document.createElement('h3');
            patternHeader.style.display = 'flex';
            patternHeader.style.alignItems = 'center';
            
            // Add fast replace indicator if enabled
            if (fastReplace && replacements.length === 1) {
                const fastReplaceIcon = document.createElement('span');
                fastReplaceIcon.style.cssText = `
                    color: #22c55e;
                    margin-right: 8px;
                `;
                fastReplaceIcon.title = 'Fast Replace Enabled';
                fastReplaceIcon.textContent = '⚡';
                patternHeader.appendChild(fastReplaceIcon);
            }

            const patternText = document.createElement('span');
            patternText.innerHTML = `Pattern: <code>${pattern}</code>`;
            patternHeader.appendChild(patternText);
            patternHeader.appendChild(this.createEditButton(value));

            patternDiv.appendChild(patternHeader);

            // Add replacements list
            const replacementsList = document.createElement('ul');
            replacementsList.innerHTML = replacements
                .map(r => {
                    const rendered = (() => {
                        if (r.startsWith("T:")) {
                            return r.slice(2);
                        } else {
                            return this.configManager.matcher.replacePlaceholders(r, wildcardMatches);
                        }
                    })();
                    return `<li>$${rendered}$ <code>[${r}]</code></li>`;
                })
                .join('');
            patternDiv.appendChild(replacementsList);
            this.element.appendChild(patternDiv);
            
            // Assuming MathJax is globally available
            (window as any).MathJax.typesetPromise([patternDiv]);
        }

        if (matches.length === 0) {
            const noMatch = document.createElement('p');
            noMatch.textContent = 'No matching patterns found.';
            this.element.appendChild(noMatch);
        }

        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.onclick = () => { this.hide(); };
        this.element.appendChild(closeButton);

        this.element.style.display = 'block';
        this.isVisible = true;
    }

    public hide(): void {
        this.element.style.display = 'none';
        this.isVisible = false;
    }

    public handleDocumentClick(e: MouseEvent): void {
        if (this.isVisible && !this.element.contains(e.target as Node)) {
            this.hide();
        }
    }
}
