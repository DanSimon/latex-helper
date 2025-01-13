import * as React from "react";
import { useState } from "react";
import { SuggestionConfig } from "../mathjax_symbols";
import { ConfigManager } from "../config";

interface SymbolConfigPanelProps {
    symbolName: string;
    defaultConfig: SuggestionConfig;
    configManager: ConfigManager;
}

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
        <div className="symbol-config">
            <span
                onClick={() => setIsExpanded(!isExpanded)}
                className="symbol-config__toggle"
            >
                <span
                    className={`symbol-config__toggle-arrow ${
                        isExpanded
                            ? "symbol-config__toggle-arrow--expanded"
                            : ""
                    }`}
                >
                    ⚙
                </span>
            </span>

            {isExpanded && (
                <div className="symbol-config__content">
                    <div className="symbol-config__option">
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
                            className="symbol-config__checkbox"
                        />
                        <label
                            htmlFor={`${symbolName}-suggestions`}
                            className="symbol-config__label"
                        >
                            Show in suggestions
                        </label>
                    </div>

                    {FAST_ENABLED && (
                        <div className="symbol-config__option">
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
                                className="symbol-config__checkbox"
                            />
                            <label
                                htmlFor={`${symbolName}-fastReplace`}
                                className="symbol-config__label"
                            >
                                Enable fast replace
                            </label>
                        </div>
                    )}
                    {NORMAL_ENABLED && (
                        <div className="symbol-config__option">
                            <input
                                type="checkbox"
                                id={`${symbolName}-normalMode`}
                                checked={currentConfig.normalMode}
                                onChange={(e) =>
                                    updateConfig("normalMode", e.target.checked)
                                }
                                className="symbol-config__checkbox"
                            />
                            <label
                                htmlFor={`${symbolName}-normalMode`}
                                className="symbol-config__label"
                            >
                                Allow in normal mode
                            </label>
                        </div>
                    )}

                    {Object.keys(currentOverrides).length > 0 && (
                        <button
                            onClick={() => {
                                delete configManager.config.symbolOverrides[
                                    symbolName
                                ];
                                configManager.updateConfig();
                            }}
                            className="symbol-config__reset"
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
