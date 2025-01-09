import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ConfigManager } from "./config";
import RibbonViewComponent from "./components/RibbonViewComponent";

export const RIBBON_VIEW_TYPE = "unified-latex-view";

export class RibbonView extends ItemView {
    private configManager: ConfigManager;
    private root: Element | null = null;

    constructor(leaf: WorkspaceLeaf, configManager: ConfigManager) {
        super(leaf);
        this.configManager = configManager;
    }

    getViewType(): string {
        return RIBBON_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "LaTeX Helper";
    }

    async onload() {
        super.onload();
        // Subscribe to config changes
        this.configManager.onChange.subscribe(() => {
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
            React.createElement(RibbonViewComponent, {
                view: this,
                configManager: this.configManager,
            }),
            this.root,
        );
    }

    async onOpen() {
        this.root = this.containerEl.children[1];
        this.renderComponent();
    }
}
