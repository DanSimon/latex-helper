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
    // Form field states
    const [pattern, setPattern] = useState("");
    const [replacements, setReplacements] = useState<string[]>([""]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isRegex, setIsRegex] = useState(false);
    const [isFastReplace, setIsFastReplace] = useState(false);
    const [isNormalMode, setIsNormalMode] = useState(false);
    const [testInput, setTestInput] = useState("");
    const [regexError, setRegexError] = useState<string | null>(null);
    const [matches, setMatches] = useState<RegExpMatchArray | null>(null);

    // Get all categories for the selector
    const allCategories = Array.from(
        new Set(
            configManager.config.shortcuts.flatMap((p) =>
                p.category ? [p.category] : [],
            ),
        ),
    ).sort();

    // Reset form when opened with new data
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

    // Reset form state
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

    // Test regex shortcuts
    useEffect(() => {
        if (isRegex && pattern && testInput) {
            try {
                const regex = new RegExp(pattern);
                const matches = testInput.match(regex);
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
            // Remove old shortcut if editing
            const oldShortcutIndex = configManager.config.shortcuts.findIndex(
                (p) => p.pattern === initialData.pattern,
            );
            if (oldShortcutIndex !== -1) {
                configManager.config.shortcuts.splice(oldShortcutIndex, 1);
            }
        }

        // Add new shortcut
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
        <div style={styles.modal}>
            <div style={styles.content}>
                <h2 style={styles.title}>
                    {initialData ? "Edit Shortcut" : "Create New Shortcut"}
                </h2>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Pattern:</label>
                    <input
                        type="text"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value)}
                        style={styles.input}
                    />
                </div>

                {/* Checkbox options */}
                <div style={styles.checkboxGroup}>
                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={isRegex}
                            onChange={(e) => setIsRegex(e.target.checked)}
                        />
                        <span>Regex Pattern</span>
                    </label>

                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={isNormalMode}
                            onChange={(e) => setIsNormalMode(e.target.checked)}
                        />
                        <span>Normal Mode</span>
                    </label>

                    <label style={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={isFastReplace}
                            onChange={(e) => setIsFastReplace(e.target.checked)}
                            disabled={replacements.length > 1}
                        />
                        <span>Fast Replace</span>
                        {isFastReplace && (
                            <span style={styles.fastReplaceIcon}>⚡</span>
                        )}
                    </label>
                </div>

                {/* Category selector */}
                <div style={styles.categoryContainer}>
                    <label style={styles.label}>Category:</label>
                    <CategorySelector
                        allCategories={allCategories}
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                    />
                </div>

                {/* Regex test section */}
                {isRegex && (
                    <div style={styles.testSection}>
                        <label style={styles.label}>
                            Test your regex shortcut:
                        </label>
                        <input
                            type="text"
                            value={testInput}
                            onChange={(e) => setTestInput(e.target.value)}
                            placeholder="Enter test text..."
                            style={styles.testInput}
                        />

                        {regexError && (
                            <div style={styles.errorText}>
                                Error: {regexError}
                            </div>
                        )}

                        {matches && matches.length > 0 && (
                            <div style={styles.matchResults}>
                                {matches.map((match, idx) => (
                                    <div key={idx} style={styles.matchGroup}>
                                        <span style={styles.matchLabel}>
                                            {idx === 0
                                                ? "Full match:"
                                                : `Group ${idx}:`}
                                        </span>
                                        <span style={styles.matchValue}>
                                            {match}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Replacements section */}
                <ReplacementsList
                    replacements={replacements}
                    onReplacementsChange={setReplacements}
                    isRegex={isRegex}
                    matches={matches}
                    onFastReplaceChange={(enabled) => setIsFastReplace(enabled)}
                    view={view}
                />

                {/* Action buttons */}
                <div style={styles.buttonGroup}>
                    <div>
                        <button onClick={handleSave} style={styles.saveButton}>
                            Save
                        </button>
                        <button onClick={onClose} style={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>
                    {initialData && (
                        <button
                            onClick={handleDelete}
                            style={styles.deleteButton}
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

// Styles remain the same...

// Styles object from original component...
const styles = {
    modal: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    content: {
        backgroundColor: "var(--background-primary)",
        border: "1px solid var(--background-modifier-border)",
        maxWidth: "800px",
        width: "100%",
        margin: "1rem",
        padding: "0.75rem",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    title: {
        fontSize: "1.25rem",
        fontWeight: 600,
        marginBottom: "0.75rem",
    },
    formGroup: {
        marginBottom: "0.75rem",
    },
    label: {
        display: "block",
        marginBottom: "0.25rem",
    },
    input: {
        width: "100%",
        padding: "0.25rem",
        border: "1px solid var(--background-modifier-border)",
        borderRadius: "4px",
        backgroundColor: "var(--background-primary)",
        color: "var(--text-normal)",
    },
    checkboxGroup: {
        display: "flex",
        gap: "1rem",
        marginBottom: "1rem",
    },
    checkboxLabel: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    categoryContainer: {
        display: "flex",
        marginBottom: "0.5rem",
        alignItems: "center",
        gap: "0.25rem",
    },
    categoryLabel: {
        display: "inline",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
    },
    saveButton: {
        padding: "0.5rem 1rem",
        marginRight: "0.5rem",
        backgroundColor: "var(--background-modifier-success)",
        color: "var(--text-on-accent)",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    cancelButton: {
        padding: "0.5rem 1rem",
        backgroundColor: "transparent",
        border: "1px solid var(--background-modifier-border)",
        borderRadius: "4px",
        cursor: "pointer",
    },
    deleteButton: {
        padding: "0.5rem 1rem",
        backgroundColor: "var(--text-error)",
        color: "var(--text-on-accent)",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    fastReplaceIcon: {
        color: "#22c55e",
        marginLeft: "4px",
    },
    testInput: {
        width: "100%",
        padding: "0.5rem",
        border: "1px solid var(--background-modifier-border)",
        borderRadius: "4px",
        backgroundColor: "var(--background-primary)",
        color: "var(--text-normal)",
        marginBottom: "1rem",
    },
    previewText: {
        color: "var(--text-accent)",
        fontSize: "0.9rem",
        marginLeft: "1rem",
    },
    noMatchText: {
        color: "var(--text-muted)",
        fontSize: "0.9rem",
        marginLeft: "1rem",
        fontStyle: "italic",
    },
    testSection: {
        marginBottom: "0.25rem",
        padding: "0.25rem",
        backgroundColor: "var(--background-secondary)",
        borderRadius: "4px",
    },
    matchResults: { display: "flex" },
    matchGroup: {
        display: "flex",
        gap: "0.5rem",
        padding: "0.5rem",
        backgroundColor: "var(--background-primary)",
        borderRadius: "4px",
    },
    matchLabel: {
        color: "var(--text-muted)",
        fontSize: "0.9rem",
        minWidth: "80px",
    },
    matchValue: {
        color: "var(--text-accent)",
        fontFamily: "monospace",
    },
    errorText: {
        color: "var(--text-error)",
        fontSize: "0.9rem",
        marginTop: "0.5rem",
    },
} as const;

export default MatchFormComponent;
