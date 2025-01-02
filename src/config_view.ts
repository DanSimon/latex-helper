import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ConfigManager } from "./config";
import { MatchForm } from "./match_form";
import ConfigViewComponent from "./components/ConfigViewComponent";

export const CONFIG_VIEW_TYPE = "config-reference-view";

export class ConfigView extends ItemView {
    private configManager: ConfigManager;
    private refreshView: () => void;
    private matchForm: MatchForm;

    constructor(
        leaf: WorkspaceLeaf,
        configManager: ConfigManager,
        matchForm: MatchForm,
    ) {
        super(leaf);
        this.configManager = configManager;
        this.matchForm = matchForm;
        this.refreshView = () => {
            this.onOpen();
        };
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
        this.configManager.onChange.subscribe(this.refreshView);
    }

    async onunload() {
        // Clean up subscription
        this.configManager.onChange.unsubscribe(this.refreshView);
        ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
        super.onunload();
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();

        ReactDOM.render(
            React.createElement(ConfigViewComponent, {
                patterns: this.configManager.config.patterns,
                view: this,
                matchForm: this.matchForm,
            }),
            container,
        );
    }
}
