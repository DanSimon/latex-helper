import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { ConfigManager } from "./config";
import RibbonViewComponent from "./components/RibbonViewComponent";

export const RIBBON_VIEW_TYPE = "unified-latex-view";

export class RibbonView extends ItemView {
    private configManager: ConfigManager;
    private reactRoot: ReactDOM.Root | null = null;
    private containerElement: Element | null = null;

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

        // Cleanup React
        if (this.reactRoot) {
            this.reactRoot.unmount();
            this.reactRoot = null;
        }

        this.containerElement = null;

        super.onunload();
    }

    private renderComponent() {
        if (!this.containerElement || !this.reactRoot) return;

        this.reactRoot.render(
            React.createElement(RibbonViewComponent, {
                view: this,
                configManager: this.configManager,
            }),
        );
    }

    async onOpen() {
        this.containerElement = this.containerEl.children[1];
        if (this.containerElement) {
            this.reactRoot = ReactDOM.createRoot(this.containerElement);
            this.renderComponent();
        }
    }
}
