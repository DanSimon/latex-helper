import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ConfigManager } from "./config";
import { MatchForm } from "./match_form";
import ConfigViewComponent from "./components/ConfigViewComponent";

export const CONFIG_VIEW_TYPE = "config-reference-view";

export class ConfigView extends ItemView {
    private configManager: ConfigManager;
    private matchForm: MatchForm;
    private root: Element | null = null;

    constructor(
        leaf: WorkspaceLeaf,
        configManager: ConfigManager,
        matchForm: MatchForm,
    ) {
        super(leaf);
        this.configManager = configManager;
        this.matchForm = matchForm;
    }

    getViewType(): string {
        return CONFIG_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "LaTeX Shortcuts Reference";
    }

    async onload() {
        super.onload();
        // Subscribe to config changes
        this.configManager.onChange.subscribe(() => {
            // Force a re-render when config changes
            this.renderComponent();
        });
    }

    async onunload() {
        // Clean up subscription
        this.configManager.onChange.unsubscribe(() => {
            this.renderComponent();
        });

        if (this.root) {
            ReactDOM.unmountComponentAtNode(this.root);
            this.root = null;
        }

        super.onunload();
    }

    private renderComponent() {
        if (!this.root) return;

        ReactDOM.render(
            React.createElement(ConfigViewComponent, {
                patterns: this.configManager.config.patterns,
                view: this,
                matchForm: this.matchForm,
            }),
            this.root,
        );
    }

    async onOpen() {
        // Store reference to the container
        this.root = this.containerEl.children[1];

        // Initial render
        this.renderComponent();
    }
}
