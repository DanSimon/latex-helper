import * as React from "react";
import { useState } from "react";
import { SuggestionConfig } from "../mathjax_symbols";
import { ConfigManager } from "../config";

interface SymbolConfigPanelProps {
    symbolName: string;
    defaultConfig: SuggestionConfig;
    configManager: ConfigManager;
}

const styles = {
    container: {
        position: "absolute",
        top: "1rem",
        right: "1rem",
    },
    toggleButton: {
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        color: "var(--text-muted)",
        fontSize: "0.8rem",
    },
    arrow: {
        transition: "transform 0.2s ease",
        display: "inline-block",
    },
    arrowExpanded: {
        transform: "rotate(90deg)",
    },
    content: {
        position: "absolute",
        right: 0,
        top: "100%",
        marginTop: "0.25rem",
        display: "flex",
        flexDirection: "column" as const,
        gap: "0.5rem",
        backgroundColor: "var(--background-primary)",
        border: "1px solid var(--background-modifier-border)",
        borderRadius: "4px",
        padding: "0.5rem",
        minWidth: "200px",
        zIndex: 10,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
    optionContainer: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    label: {
        fontSize: "0.9rem",
        color: "var(--text-normal)",
        cursor: "pointer",
    },
    checkbox: {
        cursor: "pointer",
    },
    resetButton: {
        marginTop: "0.5rem",
        padding: "0.25rem",
        fontSize: "0.8rem",
        color: "var(--text-error)",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
        alignSelf: "flex-start",
    },
} as const;

const NORMAL_ENABLED = false;
const FAST_ENABLED = false;

const SymbolConfigPanel = ({
    symbolName,
    defaultConfig,
    configManager,
}: SymbolConfigPanelProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const currentOverrides =
        configManager.config.symbolOverrides[symbolName] || {};
    const [currentConfig, setCurrentConfig] = useState({
        ...defaultConfig,
        ...currentOverrides,
    });

    const getEffectiveValue = (key: keyof SuggestionConfig): boolean => {
        console.log(`get override for ${key}`);
        return key in currentOverrides
            ? (currentOverrides[key] as boolean)
            : (defaultConfig[key] as boolean) || false;
    };

    const updateConfig = (key: keyof SuggestionConfig, value: boolean) => {
        const newOverrides = {
            ...currentOverrides,
            [key]: value,
        };

        // If the override matches the default, remove it
        if (value === defaultConfig[key]) {
            delete newOverrides[key];
            // If no more overrides for this symbol, remove the entire entry
        }

        if (Object.keys(newOverrides).length === 0) {
            delete configManager.config.symbolOverrides[symbolName];
        } else {
            configManager.config.symbolOverrides[symbolName] = newOverrides;
        }
        configManager.updateConfig();
        setCurrentConfig({ ...defaultConfig, ...newOverrides });
    };

    return (
        <div style={styles.container}>
            <span
                onClick={() => setIsExpanded(!isExpanded)}
                style={styles.toggleButton}
            >
                <span
                    style={{
                        ...styles.arrow,
                        ...(isExpanded ? styles.arrowExpanded : {}),
                    }}
                >
                    ⚙
                </span>
            </span>

            {isExpanded && (
                <div style={styles.content}>
                    <div style={styles.optionContainer}>
                        <input
                            type="checkbox"
                            id={`${symbolName}-suggestions`}
                            checked={currentConfig.suggestionEnabled}
                            onChange={(e) => {
                                updateConfig(
                                    "suggestionEnabled",
                                    e.target.checked,
                                );
                            }}
                            style={styles.checkbox}
                        />
                        <label
                            htmlFor={`${symbolName}-suggestions`}
                            style={styles.label}
                        >
                            Show in suggestions
                        </label>
                    </div>

                    {FAST_ENABLED && (
                        <div style={styles.optionContainer}>
                            <input
                                type="checkbox"
                                id={`${symbolName}-fastReplace`}
                                checked={currentConfig.fastReplace}
                                onChange={(e) =>
                                    updateConfig(
                                        "fastReplace",
                                        e.target.checked,
                                    )
                                }
                                style={styles.checkbox}
                            />
                            <label
                                htmlFor={`${symbolName}-fastReplace`}
                                style={styles.label}
                            >
                                Enable fast replace
                            </label>
                        </div>
                    )}
                    {NORMAL_ENABLED && (
                        <div style={styles.optionContainer}>
                            <input
                                type="checkbox"
                                id={`${symbolName}-normalMode`}
                                checked={currentConfig.normalMode}
                                onChange={(e) =>
                                    updateConfig("normalMode", e.target.checked)
                                }
                                style={styles.checkbox}
                            />
                            <label
                                htmlFor={`${symbolName}-normalMode`}
                                style={styles.label}
                            >
                                Allow in normal mode
                            </label>
                        </div>
                    )}

                    {Object.keys(currentOverrides).length > 0 && (
                        <button
                            onClick={() => {
                                const newOverrides = {
                                    ...configManager.config.symbolOverrides,
                                };
                                delete newOverrides[symbolName];
                                configManager.config.symbolOverrides =
                                    newOverrides;
                                configManager.updateConfig();
                            }}
                            style={styles.resetButton}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.textDecoration =
                                    "underline";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.textDecoration = "none";
                            }}
                        >
                            Reset to defaults
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SymbolConfigPanel;
