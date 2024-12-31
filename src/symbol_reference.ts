import { ItemView, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import SymbolReferenceView from "./components/SymbolReferenceView";

export const SYMBOL_VIEW_TYPE = "mathjax-symbol-reference";

export class SymbolReference extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return SYMBOL_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "MathJax Symbol Reference";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();

        ReactDOM.render(
            React.createElement(SymbolReferenceView, {
                view: this,
            }),
            container,
        );
    }

    async onClose() {
        ReactDOM.unmountComponentAtNode(this.containerEl.children[1]);
    }
}
