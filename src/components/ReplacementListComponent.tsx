import { ItemView, MarkdownRenderer } from "obsidian";
import * as React from "react";
import LatexDisplay from "./LatexDisplay";

interface ReplacementsListProps {
    replacements: string[];
    onReplacementsChange: (replacements: string[]) => void;
    isRegex: boolean;
    matches: RegExpMatchArray | null;
    onFastReplaceChange?: (enabled: boolean) => void;
    view: ItemView;
}

const DragHandle = () => (
    <div className="replacements-list__drag-handle">⋮⋮</div>
);

// Helper function to generate preview for a replacement shortcut
const generatePreview = (
    replacement: string,
    matchGroups: RegExpMatchArray,
): string => {
    return replacement.replace(
        /\$(\d+)/g,
        (_, index) => matchGroups[index] || "",
    );
};

const ReplacementsList = React.memo(
    ({
        replacements,
        onReplacementsChange,
        isRegex,
        matches,
        onFastReplaceChange,
        view,
    }: ReplacementsListProps) => {
        const addReplacement = () => {
            const newReplacements = [...replacements, ""];
            onReplacementsChange(newReplacements);
            if (onFastReplaceChange) {
                onFastReplaceChange(false);
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

        const handleDragStart = (e: React.DragEvent, index: number) => {
            e.dataTransfer.setData("text/plain", index.toString());
            e.currentTarget.classList.add("replacements-list__item--dragging");
        };

        const handleDragEnd = (e: React.DragEvent) => {
            e.currentTarget.classList.remove(
                "replacements-list__item--dragging",
            );
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
        };

        const handleDrop = (e: React.DragEvent, dropIndex: number) => {
            e.preventDefault();
            const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));

            if (dragIndex === dropIndex) return;

            const newReplacements = [...replacements];
            const [removed] = newReplacements.splice(dragIndex, 1);
            newReplacements.splice(dropIndex, 0, removed);
            onReplacementsChange(newReplacements);
        };

        return (
            <div className="replacements-list">
                {replacements.map((replacement, index) => (
                    <div
                        key={index}
                        className="replacements-list__item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnter={(e) =>
                            e.currentTarget.classList.add(
                                "replacements-list__item--drag-over",
                            )
                        }
                        onDragLeave={(e) =>
                            e.currentTarget.classList.remove(
                                "replacements-list__item--drag-over",
                            )
                        }
                    >
                        <DragHandle />
                        <div className="replacements-list__input-container">
                            <input
                                type="text"
                                value={replacement}
                                onChange={(e) =>
                                    updateReplacement(index, e.target.value)
                                }
                                className="replacements-list__input"
                                placeholder="Replacement"
                            />
                        </div>
                        <div className="replacements-list__preview">
                            {(() => {
                                const preview = (() => {
                                    if (
                                        isRegex &&
                                        matches &&
                                        matches.length > 0
                                    ) {
                                        return generatePreview(
                                            replacement,
                                            matches,
                                        );
                                    } else {
                                        return replacement;
                                    }
                                })();
                                if (!preview) {
                                    return <div />;
                                }
                                return (
                                    <div className="replacements-list__preview">
                                        Preview:
                                        <div
                                            className="rendered-math"
                                            ref={(el) => {
                                                if (el) {
                                                    el.empty();
                                                    MarkdownRenderer.render(
                                                        view.app,
                                                        `$${preview}$`,
                                                        el,
                                                        "",
                                                        view,
                                                    );
                                                }
                                            }}
                                        ></div>
                                        <div className="replacements-list__preview-text">
                                            <LatexDisplay command={preview} />
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        {replacements.length > 1 && (
                            <button
                                onClick={() => removeReplacement(index)}
                                className="replacements-list__remove"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    onClick={addReplacement}
                    className="replacements-list__add"
                >
                    Add Replacement
                </button>
            </div>
        );
    },
);

export default ReplacementsList;
