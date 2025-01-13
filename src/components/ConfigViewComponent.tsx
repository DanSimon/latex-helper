import * as React from "react";
import { useState } from "react";
import { ItemView, MarkdownRenderer } from "obsidian";
import { ConfigManager, Shortcut } from "../config";
import { fillLatexBraces } from "../latex_utils";
import MatchFormComponent from "./MatchFormComponent";

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
    const fillerColor = getComputedStyle(view.containerEl)
        .getPropertyValue("--text-accent")
        .trim();

    return (
        <tr>
            <td>
                {replacementIndex == 0 && (
                    <div className="config-view__shortcut">
                        {shortcut.fastReplace && (
                            <span
                                className="config-view__icon config-view__icon--fast-replace"
                                title="Fast Replace Enabled"
                            >
                                ⚡
                            </span>
                        )}
                        {shortcut.type === "regex" && (
                            <span
                                className="config-view__icon config-view__icon--regex"
                                title="Regex Shortcut"
                            >
                                R
                            </span>
                        )}
                        {shortcut.normalMode && (
                            <span
                                className="config-view__icon config-view__icon--normal-mode"
                                title="Normal Mode"
                            >
                                N
                            </span>
                        )}
                        <code className="config-view__shortcut-code">
                            {shortcut.pattern}
                        </code>
                        <button
                            onClick={onEdit}
                            className="config-view__edit-button"
                            title="Edit shortcut"
                        >
                            ✏️
                        </button>
                    </div>
                )}
            </td>
            <td>
                <div className="config-view__preview">
                    <div
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
                </div>
            </td>
            <td>
                <div>
                    <code className="config-view__shortcut-code">
                        {shortcut.replacements[replacementIndex]}
                    </code>
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
        <div className="config-view__category">
            <h3 className="config-view__category-title">{category}</h3>
            <table className="config-view__table">
                <thead>
                    <tr>
                        <th>Shortcut</th>
                        <th>Preview</th>
                        <th>LaTeX</th>
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

const ConfigViewComponent = ({
    shortcuts,
    view,
    configManager,
}: ConfigViewComponentProps) => {
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
        <div className="config-view">
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

            <div className="config-view__header">
                <h2 className="config-view__title">
                    LaTeX Shortcuts Reference
                </h2>
                <div className="config-view__button-group">
                    <button
                        className="config-view__button config-view__button--success"
                        onClick={() => showMatchForm(null)}
                    >
                        New Shortcut
                    </button>
                </div>
            </div>

            <div className="config-view__search">
                <input
                    type="text"
                    placeholder="Search shortcuts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="config-view__search-input"
                />
            </div>

            <div className="config-view__content">
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
