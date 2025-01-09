import * as React from "react";
import { useState } from "react";
import { ItemView, MarkdownRenderer } from "obsidian";
import { ConfigManager, Shortcut } from "../config";
import { fillLatexBraces } from "../latex_utils";
import MatchFormComponent from "./MatchFormComponent";

const styles = {
    container: {
        display: "flex",
        flexDirection: "column" as const,
        height: "100%",
        width: "100%",
        overflow: "hidden",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        borderBottom: "1px solid var(--background-modifier-border)",
    },
    title: {
        margin: 0,
        fontSize: "1.5rem",
    },
    buttonGroup: {
        display: "flex",
        gap: "0.5rem",
    },
    button: {
        padding: "0.5rem 1rem",
        border: "1px solid var(--background-modifier-border)",
        borderRadius: "4px",
        backgroundColor: "var(--background-primary)",
        cursor: "pointer",
    },
    searchContainer: {
        padding: "1rem",
        borderBottom: "1px solid var(--background-modifier-border)",
    },
    searchInput: {
        width: "100%",
        padding: "0.5rem",
        border: "1px solid var(--background-modifier-border)",
        borderRadius: "4px",
        backgroundColor: "var(--background-primary)",
    },
    shortcutsContainer: {
        flex: 1,
        overflow: "auto",
        padding: "1rem",
    },
    categorySection: {
        marginBottom: "2rem",
    },
    categoryTitle: {
        margin: "0 0 1rem 0",
        fontSize: "1.2rem",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse" as const,
    },
    th: {
        textAlign: "left" as const,
        padding: "0.5rem",
        borderBottom: "1px solid var(--background-modifier-border)",
    },
    td: {
        padding: "0.5rem",
        verticalAlign: "middle" as const,
    },
    trFirst: {
        borderTop: "1px solid var(--background-modifier-border)",
    },
    editButton: {
        visibility: "hidden",
        border: "none",
        background: "none",
        cursor: "pointer",
        padding: "2px 6px",
        marginLeft: "8px",
        color: "var(--text-muted)",
    },
    fastReplaceIcon: {
        color: "#22c55e",
        marginRight: "2px",
        fontSize: "0.8em",
    },
    regexIcon: {
        color: "#22c55e",
        marginRight: "2px",
        fontSize: "0.8em",
    },
    normalModeIcon: {
        color: "#225ec5",
        marginRight: "2px",
        fontSize: "0.8em",
    },
};

function ShortcutRow({
    shortcut,
    replacementIndex,
    view,
    onEdit,
}: {
    shortcut: Shortcut;
    replacementIndex: number;
    view: ItemView;
    onEdit: () => void;
}) {
    const [isHovered, setIsHovered] = useState(false);
    const fillerColor = getComputedStyle(view.containerEl)
        .getPropertyValue("--text-accent")
        .trim();

    return (
        <tr
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={replacementIndex == 0 ? styles.trFirst : undefined}
        >
            <td style={styles.td}>
                {replacementIndex == 0 && (
                    <div>
                        {shortcut.fastReplace && (
                            <span
                                style={styles.fastReplaceIcon}
                                title="Fast Replace Enabled"
                            >
                                ⚡
                            </span>
                        )}
                        {shortcut.type === "regex" && (
                            <span
                                style={styles.regexIcon}
                                title="Regex Shortcut"
                            >
                                R
                            </span>
                        )}
                        {shortcut.normalMode && (
                            <span
                                style={styles.normalModeIcon}
                                title="Normal Mode"
                            >
                                N
                            </span>
                        )}
                        <code>{shortcut.pattern}</code>
                        <button
                            onClick={onEdit}
                            style={{
                                ...styles.editButton,
                                visibility: isHovered ? "visible" : "hidden",
                            }}
                            title="Edit shortcut"
                        >
                            ✏️
                        </button>
                    </div>
                )}
            </td>
            <td style={styles.td}>
                <div
                    key={replacementIndex}
                    className="rendered-math"
                    ref={(el) => {
                        if (el) {
                            el.empty();
                            MarkdownRenderer.render(
                                view.app,
                                `$${fillLatexBraces(shortcut.replacements[replacementIndex], fillerColor)}$`,
                                el,
                                "",
                                view,
                            );
                        }
                    }}
                />
            </td>
            <td style={styles.td}>
                <div key={replacementIndex}>
                    <code>{shortcut.replacements[replacementIndex]}</code>
                </div>
            </td>
        </tr>
    );
}

function CategorySection({
    category,
    shortcuts,
    view,
    showMatchForm,
}: {
    category: string;
    shortcuts: Shortcut[];
    view: ItemView;
    showMatchForm: (shortcut: Shortcut) => void;
}) {
    return (
        <div style={styles.categorySection}>
            <h3 style={styles.categoryTitle}>{category}</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Shortcut</th>
                        <th style={styles.th}>Preview</th>
                        <th style={styles.th}>LaTeX</th>
                    </tr>
                </thead>
                <tbody>
                    {shortcuts
                        .sort((a, b) => a.pattern.localeCompare(b.pattern))
                        .flatMap((shortcut) =>
                            Array.from(
                                Array(shortcut.replacements.length).keys(),
                            ).map((idx) => (
                                <ShortcutRow
                                    key={`${shortcut.pattern}-${idx}`}
                                    replacementIndex={idx}
                                    shortcut={shortcut}
                                    view={view}
                                    onEdit={() => showMatchForm(shortcut)}
                                />
                            )),
                        )}
                </tbody>
            </table>
        </div>
    );
}

interface ConfigViewComponentProps {
    shortcuts: Shortcut[];
    view: ItemView;
    configManager: ConfigManager;
}

const ConfigViewComponent: React.FC<ConfigViewComponentProps> = ({
    shortcuts,
    view,
    configManager,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [matchFormData, setMatchFormData] = useState<Shortcut | null>(null);
    const [matchFormVisible, setMatchFormVisible] = useState(false);

    const showMatchForm = (shortcut: Shortcut | null) => {
        setMatchFormData(shortcut);
        setMatchFormVisible(true);
    };

    const filteredCategories = (() => {
        const grouped = shortcuts.reduce(
            (acc: Record<string, Shortcut[]>, shortcut) => {
                const category = shortcut.category || "Uncategorized";
                if (!acc[category]) {
                    acc[category] = [];
                }
                if (
                    shortcut.pattern
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    shortcut.replacements.some((r) =>
                        r.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                ) {
                    acc[category].push(shortcut);
                }
                return acc;
            },
            {},
        );

        // Sort categories but keep Uncategorized at the end
        const sortedCategories: Record<string, Shortcut[]> = {};
        Object.keys(grouped)
            .sort((a, b) => {
                if (a === "Uncategorized") return 1;
                if (b === "Uncategorized") return -1;
                return a.localeCompare(b);
            })
            .forEach((category) => {
                if (grouped[category].length > 0) {
                    sortedCategories[category] = grouped[category];
                }
            });

        return sortedCategories;
    })();

    return (
        <div style={styles.container}>
            <style>{`
        .rendered-math p {
          display: inline;
          margin: 0;
          padding: 0;
        }
      `}</style>

            <MatchFormComponent
                configManager={configManager}
                isVisible={matchFormVisible}
                initialData={matchFormData}
                onClose={() => {
                    setMatchFormVisible(false);
                    setMatchFormData(null);
                }}
                view={view}
            />

            <div style={styles.header}>
                <h2 style={styles.title}>LaTeX Shortcuts Reference</h2>
                <div style={styles.buttonGroup}>
                    <button
                        style={{
                            ...styles.button,
                            border: "1px solid var(--background-modifier-success)",
                        }}
                        onClick={() => showMatchForm(null)}
                    >
                        New Shortcut
                    </button>
                </div>
            </div>

            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search shortcuts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            <div style={styles.shortcutsContainer}>
                {Object.entries(filteredCategories).map(
                    ([category, categoryShortcuts]) => (
                        <CategorySection
                            key={category}
                            category={category}
                            shortcuts={categoryShortcuts}
                            view={view}
                            showMatchForm={showMatchForm}
                        />
                    ),
                )}
            </div>
        </div>
    );
};

export default ConfigViewComponent;
