import * as React from "react";

interface ReplacementsListProps {
    replacements: string[];
    onReplacementsChange: (replacements: string[]) => void;
    isRegex: boolean;
    matches: RegExpMatchArray | null;
    onFastReplaceChange?: (enabled: boolean) => void;
}

const styles = {
    formGroup: {
        marginBottom: "1rem",
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
    input: {
        width: "100%",
        padding: "0.5rem",
        border: "1px solid var(--background-modifier-border)",
        borderRadius: "4px",
        backgroundColor: "var(--background-primary)",
        color: "var(--text-normal)",
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
    previewText: {
        color: "var(--text-accent)",
        fontSize: "0.9rem",
        marginLeft: "1rem",
        marginTop: "0.25rem",
    },
} as const;

// Helper function to generate preview for a replacement pattern
const generatePreview = (
    replacement: string,
    matchGroups: RegExpMatchArray,
): string => {
    return replacement.replace(
        /\$(\d+)/g,
        (_, index) => matchGroups[index] || "",
    );
};

const ReplacementsList: React.FC<ReplacementsListProps> = ({
    replacements,
    onReplacementsChange,
    isRegex,
    matches,
    onFastReplaceChange,
}) => {
    const addReplacement = () => {
        const newReplacements = [...replacements, ""];
        onReplacementsChange(newReplacements);
        if (onFastReplaceChange) {
            onFastReplaceChange(false); // Disable fast replace when multiple replacements exist
        }
    };

    const removeReplacement = (index: number) => {
        const newReplacements = replacements.filter((_, i) => i !== index);
        onReplacementsChange(newReplacements);
    };

    const updateReplacement = (index: number, value: string) => {
        const newReplacements = [...replacements];
        newReplacements[index] = value;
        onReplacementsChange(newReplacements);
    };

    return (
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
                        {isRegex && matches && matches.length > 0 && (
                            <div style={styles.previewText}>
                                Preview: {generatePreview(replacement, matches)}
                            </div>
                        )}
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
    );
};

export default ReplacementsList;
