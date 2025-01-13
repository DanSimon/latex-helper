import * as React from "react";
import { useState, useEffect } from "react";
import * as ReactDOM from "react-dom";
import { ConfigManager, Shortcut } from "../config";
import CategorySelector from "./CategorySelector";
import ReplacementsList from "./ReplacementListComponent";
import { ItemView } from "obsidian";

interface MatchFormProps {
    configManager: ConfigManager;
    isVisible: boolean;
    onClose: () => void;
    initialData: Shortcut | null;
    view: ItemView;
}

const MatchFormComponent = ({
    configManager,
    isVisible,
    onClose,
    initialData,
    view,
}: MatchFormProps) => {
    const [pattern, setPattern] = useState("");
    const [replacements, setReplacements] = useState<string[]>([""]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isRegex, setIsRegex] = useState(false);
    const [isFastReplace, setIsFastReplace] = useState(false);
    const [isNormalMode, setIsNormalMode] = useState(false);
    const [testInput, setTestInput] = useState("");
    const [regexError, setRegexError] = useState<string | null>(null);
    const [matches, setMatches] = useState<RegExpMatchArray | null>(null);

    const allCategories = Array.from(
        new Set(
            configManager.config.shortcuts.flatMap((p) =>
                p.category ? [p.category] : [],
            ),
        ),
    ).sort();

    useEffect(() => {
        if (isVisible) {
            if (initialData) {
                setPattern(initialData.pattern);
                setIsRegex(initialData.type === "regex");
                setIsFastReplace(initialData.fastReplace || false);
                setSelectedCategory(initialData.category || "");
                setReplacements(initialData.replacements);
                setIsNormalMode(initialData.normalMode || false);
            } else {
                resetForm();
            }
        }
    }, [isVisible, initialData]);

    const resetForm = () => {
        setPattern("");
        setIsRegex(false);
        setIsFastReplace(false);
        setIsNormalMode(false);
        setSelectedCategory("");
        setReplacements([""]);
        setTestInput("");
        setRegexError(null);
        setMatches(null);
    };

    useEffect(() => {
        if (isRegex && pattern && testInput) {
            try {
                const regex = new RegExp(pattern);
                const matches = testInput.match(regex);
                console.log("testing regex");
                setMatches(matches);
                setRegexError(null);
            } catch (error) {
                setRegexError(error.message);
                setMatches(null);
            }
        } else {
            setMatches(null);
            setRegexError(null);
        }
    }, [isRegex, pattern, testInput]);

    const handleSave = () => {
        if (initialData) {
            const oldShortcutIndex = configManager.config.shortcuts.findIndex(
                (p) => p.pattern === initialData.pattern,
            );
            if (oldShortcutIndex !== -1) {
                configManager.config.shortcuts.splice(oldShortcutIndex, 1);
            }
        }

        const newShortcut: Shortcut = {
            pattern,
            replacements,
            normalMode: isNormalMode,
            ...(isRegex && { type: "regex" }),
            ...(isFastReplace && { fastReplace: true }),
            ...(selectedCategory && { category: selectedCategory }),
        };

        configManager.config.shortcuts.push(newShortcut);
        configManager.updateConfig();
        onClose();
    };

    const handleDelete = () => {
        if (!initialData) return;

        if (confirm("Delete this Shortcut?")) {
            const shortcutIndex = configManager.config.shortcuts.findIndex(
                (p) => p.pattern === initialData.pattern,
            );

            if (shortcutIndex !== -1) {
                configManager.config.shortcuts.splice(shortcutIndex, 1);
                configManager.updateConfig();
            }
            onClose();
        }
    };

    if (!isVisible) return null;

    const html = (
        <div className="match-form-modal">
            <div className="match-form">
                <h2 className="match-form__title">
                    {initialData ? "Edit Shortcut" : "Create New Shortcut"}
                </h2>

                <div className="match-form__group">
                    <label className="match-form__label">Pattern:</label>
                    <input
                        type="text"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                        className="match-form__input"
                    />
                </div>

                <div className="match-form__checkbox-group">
                    <label className="match-form__checkbox-label">
                        <input
                            type="checkbox"
                            checked={isRegex}
                            onChange={(e) => setIsRegex(e.target.checked)}
                        />
                        <span>Regex Pattern</span>
                    </label>

                    <label className="match-form__checkbox-label">
                        <input
                            type="checkbox"
                            checked={isNormalMode}
                            onChange={(e) => setIsNormalMode(e.target.checked)}
                        />
                        <span>Normal Mode</span>
                    </label>

                    <label className="match-form__checkbox-label">
                        <input
                            type="checkbox"
                            checked={isFastReplace}
                            onChange={(e) => setIsFastReplace(e.target.checked)}
                            disabled={replacements.length > 1}
                        />
                        <span>Fast Replace</span>
                        {isFastReplace && (
                            <span className="match-form__fast-replace-icon">
                                ⚡
                            </span>
                        )}
                    </label>
                </div>

                <div className="match-form__category-container">
                    <label className="match-form__label">Category:</label>
                    <CategorySelector
                        allCategories={allCategories}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                    />
                </div>

                {isRegex && (
                    <div className="match-form__test-section">
                        <label className="match-form__label">
                            Test your regex shortcut:
                        </label>
                        <input
                            type="text"
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                            placeholder="Enter test text..."
                            className="match-form__test-input"
                        />

                        {regexError && (
                            <div className="match-form__error">
                                Error: {regexError}
                            </div>
                        )}

                        {matches && matches.length > 0 && (
                            <div className="match-form__match-results">
                                {matches.map((match, idx) => (
                                    <div
                                        key={idx}
                                        className="match-form__match-group"
                                    >
                                        <span className="match-form__match-label">
                                            {idx === 0
                                                ? "Full match:"
                                                : `Group ${idx}:`}
                                        </span>
                                        <span className="match-form__match-value">
                                            {match}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <ReplacementsList
                    replacements={replacements}
                    onReplacementsChange={setReplacements}
                    isRegex={isRegex}
                    matches={matches}
                    onFastReplaceChange={(enabled) => setIsFastReplace(enabled)}
                    view={view}
                />

                <div className="match-form__button-group">
                    <div>
                        <button
                            onClick={handleSave}
                            className="match-form__button match-form__button--save"
                        >
                            Save
                        </button>
                        <button
                            onClick={onClose}
                            className="match-form__button match-form__button--cancel"
                        >
                            Cancel
                        </button>
                    </div>
                    {initialData && (
                        <button
                            onClick={handleDelete}
                            className="match-form__button match-form__button--delete"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
    return ReactDOM.createPortal(html, document.body);
};

export default MatchFormComponent;
