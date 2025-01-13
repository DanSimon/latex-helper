import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { MarkdownRenderer, MarkdownView } from "obsidian";
import { Suggestion } from "../suggestion_popup";
import { fillLatexHtmlBraces } from "../latex_utils";
import { UserSettings } from "../settings";

interface SuggestionPopupProps {
    x: number;
    y: number;
    match: string;
    replacements: Suggestion[];
    fastReplace?: boolean;
    view: MarkdownView;
    onSelect: (index: number) => void;
    onHide: () => void;
    visible: boolean;
    settings: UserSettings;
}

const RenderMath = React.memo(
    ({ tex, view }: { tex: string; view: MarkdownView }) => {
        const spanRef = useRef<HTMLSpanElement>(null);

        useEffect(() => {
            const span = spanRef.current;
            if (span) {
                span.empty();
                MarkdownRenderer.render(
                    view.app,
                    `$${tex}$`,
                    span,
                    view.file?.path || "",
                    view,
                );
            }
        });

        return (
            <span
                ref={spanRef}
                className="rendered-math"
                style={{ display: "inline-block" }}
            />
        );
    },
);

const SuggestionPopupComponent = ({
    x,
    y,
    match,
    replacements,
    view,
    onSelect,
    onHide,
    visible,
    settings,
}: SuggestionPopupProps) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedIndex(0);
    }, [match, replacements]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node)
            ) {
                onHide();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!visible) return;
            if (e.key.startsWith("Arrow")) {
                onHide();
                return;
            }

            if (
                settings.enableFastReplace &&
                replacements[0].fastReplace &&
                ![
                    "Escape",
                    "Tab",
                    "Backspace",
                    "Shift",
                    "Alt",
                    "Control",
                    "Meta",
                ].includes(e.key)
            ) {
                onSelect(0);
                return;
            }

            switch (e.key) {
                case "Escape":
                    onHide();
                    e.preventDefault();
                    break;

                case "Tab":
                    e.preventDefault();
                    setSelectedIndex((prev) => {
                        if (e.shiftKey) {
                            return prev > 0
                                ? prev - 1
                                : replacements.length - 1;
                        } else {
                            return prev < replacements.length - 1
                                ? prev + 1
                                : 0;
                        }
                    });
                    break;

                case "Enter":
                    if (selectedIndex >= 0) {
                        e.preventDefault();
                        onSelect(selectedIndex);
                    }
                    break;

                default:
                    if (e.key >= "1" && e.key <= "9") {
                        const index = parseInt(e.key) - 1;
                        if (index < replacements.length) {
                            onSelect(index);
                            e.preventDefault();
                        }
                    }
            }
        };

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [visible, replacements.length, selectedIndex, onSelect, onHide]);

    if (!visible || !match || replacements.length === 0) {
        return <div style={{ display: "none" }} />;
    }

    return (
        <div
            ref={popupRef}
            className="suggestion-popup"
            style={{
                left: `${x + 5}px`,
                top: `${y}px`,
            }}
        >
            {replacements.map((option, index) => {
                const itemClasses = [
                    "suggestion-popup__item",
                    selectedIndex === index
                        ? "suggestion-popup__item--selected"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ");

                return (
                    <p
                        key={`${option}-${index}`}
                        id={`suggestion-${index}`}
                        className={itemClasses}
                        onClick={() => onSelect(index)}
                    >
                        {settings.enableFastReplace &&
                        option.fastReplace &&
                        index == 0 ? (
                            <span className="suggestion-popup__fast-replace">
                                ⚡
                            </span>
                        ) : (
                            ""
                        )}
                        {!(
                            settings.enableFastReplace &&
                            option.fastReplace &&
                            index == 0
                        ) && index < 9 ? (
                            <span className="suggestion-popup__index">
                                {index + 1}.
                            </span>
                        ) : (
                            ""
                        )}
                        {option.displayReplacement && (
                            <RenderMath
                                tex={option.displayReplacement}
                                view={view}
                            />
                        )}{" "}
                        <span className="suggestion-popup__code">
                            <code
                                dangerouslySetInnerHTML={{
                                    __html: fillLatexHtmlBraces(
                                        option.replacement,
                                        "var(--text-accent)",
                                    ),
                                }}
                            />
                        </span>
                    </p>
                );
            })}
        </div>
    );
};

export default SuggestionPopupComponent;
