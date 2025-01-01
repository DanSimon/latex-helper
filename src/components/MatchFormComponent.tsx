import * as React from "react";
import { useState, useEffect } from "react";
import { Pattern } from "../config";
import CategorySelector from "./CategorySelector";

interface MatchFormProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (pattern: Pattern) => void;
    onDelete?: () => void;
    initialData?: Pattern;
    allCategories: string[];
}

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
        maxWidth: "800px",
        width: "100%",
        margin: "1rem",
        padding: "1.5rem",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
    },
    title: {
        fontSize: "1.25rem",
        fontWeight: 600,
        marginBottom: "1rem",
    },
    formGroup: {
        marginBottom: "1rem",
    },
    label: {
        display: "block",
        marginBottom: "0.5rem",
    },
    input: {
        width: "100%",
        padding: "0.5rem",
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
    replacementItem: {
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        padding: "0.5rem",
        border: "1px solid var(--background-modifier-border)",
        borderRadius: "4px",
        marginBottom: "0.5rem",
    },
    replacementInput: {
        flex: 1,
    },
    removeButton: {
        padding: "0.5rem",
        color: "var(--text-error)",
        backgroundColor: "transparent",
        border: "none",
        cursor: "pointer",
    },
    addButton: {
        width: "100%",
        padding: "0.5rem",
        backgroundColor: "var(--background-secondary)",
        border: "1px solid var(--background-modifier-border)",
        borderRadius: "4px",
        cursor: "pointer",
        marginBottom: "1rem",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
    },
    saveButton: {
        padding: "0.5rem 1rem",
        marginRight: "0.5rem",
        backgroundColor: "var(--interactive-success)",
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
} as const;

const MatchFormComponent = ({
    isVisible,
    onClose,
    onSave,
    onDelete,
    initialData,
    allCategories,
}: MatchFormProps) => {
    const [pattern, setPattern] = useState("");
    const [replacements, setReplacements] = useState<string[]>([""]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isRegex, setIsRegex] = useState(false);
    const [isFastReplace, setIsFastReplace] = useState(false);
    const [isNormalMode, setIsNormalMode] = useState(false);

    const resetForm = () => {
        setPattern("");
        setIsRegex(false);
        setIsFastReplace(false);
        setIsNormalMode(false);
        setSelectedCategory("");
        setReplacements([""]);
    };

    useEffect(() => {
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
    }, [initialData, isVisible]);

    const handleSave = () => {
        const newPattern: Pattern = {
            pattern,
            replacements: replacements,
            normalMode: isNormalMode,
            ...(isRegex && { type: "regex" }),
            ...(isFastReplace && { fastReplace: true }),
            ...(selectedCategory && { category: selectedCategory }),
        };
        onSave(newPattern);
        onClose();
    };

    const addReplacement = () => {
        setReplacements([...replacements, ""]);
        setIsFastReplace(false); // Disable fast replace when multiple replacements exist
    };

    const removeReplacement = (index: number) => {
        setReplacements(replacements.filter((_, i) => i !== index));
    };

    const updateReplacement = (index: number, value: string) => {
        setReplacements(replacements.map((r, i) => (i === index ? value : r)));
    };

    if (!isVisible) return null;

    return (
        <div style={styles.modal}>
            <div style={styles.content}>
                <h2 style={styles.title}>
                    {initialData ? "Edit Pattern" : "Create New Pattern"}
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

                <div style={styles.formGroup}>
                    <label style={styles.label}>Category:</label>
                    <CategorySelector
                        allCategories={allCategories} // This should be passed from parent
                        selectedCategory={selectedCategory}
                        onSelect={setSelectedCategory}
                    />
                </div>

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

                <div style={styles.formGroup}>
                    {replacements.map((replacement, index) => (
                        <div key={index} style={styles.replacementItem}>
                            <div style={styles.replacementInput}>
                                <input
                                    type="text"
                                    value={replacement}
                                    onChange={(e) =>
                                        updateReplacement(index, e.target.value)
                                    }
                                    style={styles.input}
                                    placeholder="Replacement"
                                />
                            </div>
                            {replacements.length > 1 && (
                                <button
                                    onClick={() => removeReplacement(index)}
                                    style={styles.removeButton}
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button onClick={addReplacement} style={styles.addButton}>
                        Add Replacement
                    </button>
                </div>

                <div style={styles.buttonGroup}>
                    <div>
                        <button onClick={handleSave} style={styles.saveButton}>
                            Save
                        </button>
                        <button onClick={onClose} style={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>
                    {onDelete && (
                        <button onClick={onDelete} style={styles.deleteButton}>
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchFormComponent;
