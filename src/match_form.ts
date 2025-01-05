import { Component } from "obsidian";
import { ConfigManager, Pattern } from "./config";
import * as React from "react";
import * as ReactDOM from "react-dom";
import MatchFormComponent from "./components/MatchFormComponent";

export class MatchForm extends Component {
    private configManager: ConfigManager;
    private matchData: Pattern | null = null;
    private element: HTMLDivElement;
    private isVisible: boolean = false;

    constructor(configManager: ConfigManager) {
        super();
        this.configManager = configManager;
    }

    onload() {
        this.element = document.createElement("div");
        document.body.appendChild(this.element);
        this.render();
    }

    onunload() {
        ReactDOM.unmountComponentAtNode(this.element);
        this.element.remove();
    }

    private handleSave = (pattern: Pattern) => {
        if (this.matchData) {
            // Remove old pattern if editing
            const oldPatternIndex =
                this.configManager.config.patterns.findIndex(
                    (p) => p.pattern === this.matchData?.pattern,
                );
            if (oldPatternIndex !== -1) {
                this.configManager.config.patterns.splice(oldPatternIndex, 1);
            }
        }

        // Add new pattern
        this.configManager.config.patterns.push(pattern);
        this.configManager.updateConfig();
        this.hide();
    };

    private handleDelete = () => {
        if (!this.matchData) return;

        const patternIndex = this.configManager.config.patterns.findIndex(
            (p) => p.pattern === this.matchData?.pattern,
        );

        if (patternIndex !== -1) {
            this.configManager.config.patterns.splice(patternIndex, 1);
            this.configManager.updateConfig();
        }
    };

    private render() {
        const allCategories: string[] = Array.from(
            new Set(
                this.configManager.config.patterns.flatMap((p) =>
                    p.category ? [p.category] : [],
                ),
            ),
        ).sort();

        ReactDOM.render(
            React.createElement(MatchFormComponent, {
                isVisible: this.isVisible,
                onClose: () => this.hide(),
                onSave: this.handleSave,
                onDelete: this.matchData ? this.handleDelete : undefined,
                initialData: this.matchData || undefined,
                allCategories: allCategories,
            }),
            this.element,
        );
    }

    public show(matchData: Pattern | null = null): void {
        this.matchData = matchData;
        this.isVisible = true;
        this.render();
    }

    public hide(): void {
        this.isVisible = false;
        this.render();
    }
}
