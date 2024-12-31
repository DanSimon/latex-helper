import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { MarkdownRenderer, MarkdownView } from "obsidian";
import { Suggestion } from "../suggestion_popup";
import { fillLatexHtmlBraces } from "../latex_utils";

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

            // Handle fast replace for non-alphanumeric keys
            if (
                replacements[0].fastReplace &&
                !/^[a-zA-Z0-9]$/.test(e.key) &&
                !["Escape", "Tab", "Backspace"].includes(e.key)
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
            style={{
                position: "absolute",
                left: `${x + 5}px`,
                top: `${y}px`,
                background: "var(--background-primary)",
                border: "1px solid var(--background-modifier-border)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                zIndex: 50,
                display: "block",
                whiteSpace: "nowrap",
                padding: "2px",
            }}
        >
            <style>
                {`
          .rendered-math p {
            display: inline;
            margin: 0;
            padding: 0;
          }
        `}
            </style>
            {replacements.map((option, index) => {
                return (
                    <p
                        key={`${option}-${index}`}
                        id={`suggestion-${index}`}
                        style={{
                            cursor: "pointer",
                            padding: "4px",
                            margin: "0px",
                            display: "block",
                            background:
                                selectedIndex === index
                                    ? "var(--background-secondary)"
                                    : "var(--background-primary)",
                        }}
                        onMouseOver={() =>
                            selectedIndex !== index && setSelectedIndex(index)
                        }
                        onClick={() => onSelect(index)}
                    >
                        {option.fastReplace && index == 0 ? (
                            <span
                                style={{
                                    color: "#22c55e",
                                    marginRight: "4px",
                                    fontSize: "0.75rem",
                                }}
                            >
                                ⚡
                            </span>
                        ) : (
                            ""
                        )}
                        {!(option.fastReplace && index == 0) && index < 9 ? (
                            <span
                                style={{
                                    color: "#666",
                                    marginRight: "4px",
                                    fontSize: "0.75rem",
                                }}
                            >
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
                        <span style={{ color: "var(--text-faint)" }}>
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
