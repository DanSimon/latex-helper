import * as React from "react";
import { useState } from "react";
import { ItemView } from "obsidian";
import ConfigViewComponent from "./ConfigViewComponent";
import SymbolReferenceView from "./SymbolReferenceView";
import { ConfigManager } from "../config";

interface UnifiedLatexViewProps {
    view: ItemView;
    configManager: ConfigManager;
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "column" as const,
        height: "100%",
    },
    tabHeader: {
        display: "flex",
        borderBottom: "1px solid var(--background-modifier-border)",
        backgroundColor: "var(--background-primary)",
        padding: "0 1rem",
    },
    tabButton: {
        padding: "0.5rem 1rem",
        backgroundColor: "transparent",
        border: "none",
        borderBottom: "2px solid transparent",
        color: "var(--text-muted)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontSize: "14px",
        fontWeight: "500",
    },
    activeTab: {
        borderBottom: "2px solid var(--text-accent)",
        color: "var(--text-normal)",
    },
    content: {
        flex: 1,
        overflow: "hidden",
    },
} as const;

const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        style={{
            ...styles.tabButton,
            ...(active ? styles.activeTab : {}),
        }}
        onMouseEnter={(e) => {
            if (!active) {
                e.currentTarget.style.borderBottom =
                    "2px solid var(--background-modifier-border)";
            }
        }}
        onMouseLeave={(e) => {
            if (!active) {
                e.currentTarget.style.borderBottom = "2px solid transparent";
            }
        }}
    >
        {children}
    </button>
);

const UnifiedLatexView: React.FC<UnifiedLatexViewProps> = ({
    view,
    configManager,
}) => {
    const [activeTab, setActiveTab] = useState<"shortcuts" | "reference">(
        "shortcuts",
    );

    return (
        <div style={styles.container}>
            <div style={styles.tabHeader}>
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

            <div style={styles.content}>
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

export default UnifiedLatexView;
