import * as React from "react";
import { useState } from "react";
import { ItemView } from "obsidian";
import ConfigViewComponent from "./ConfigViewComponent";
import SymbolReferenceView from "./SymbolReferenceView";
import { ConfigManager } from "../config";

interface RibbonViewProps {
    view: ItemView;
    configManager: ConfigManager;
}

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

const TabButton = ({ active, onClick, children }: TabButtonProps) => (
    <button
        onClick={onClick}
        className={`ribbon-view__tab ${active ? "ribbon-view__tab--active" : ""}`}
    >
        {children}
    </button>
);

const RibbonViewComponent: React.FC<RibbonViewProps> = ({
    view,
    configManager,
}) => {
    const [activeTab, setActiveTab] = useState<"shortcuts" | "reference">(
        "shortcuts",
    );

    return (
        <div className="ribbon-view">
            <div className="ribbon-view__header">
                <TabButton
                    active={activeTab === "shortcuts"}
                    onClick={() => setActiveTab("shortcuts")}
                >
                    LaTeX Shortcuts
                </TabButton>
                <TabButton
                    active={activeTab === "reference"}
                    onClick={() => setActiveTab("reference")}
                >
                    Symbol Reference
                </TabButton>
            </div>

            <div className="ribbon-view__content">
                {activeTab === "shortcuts" ? (
                    <ConfigViewComponent
                        shortcuts={configManager.config.shortcuts}
                        view={view}
                        configManager={configManager}
                    />
                ) : (
                    <SymbolReferenceView
                        view={view}
                        configManager={configManager}
                    />
                )}
            </div>
        </div>
    );
};

export default RibbonViewComponent;
