import * as React from "react";

// Component to display LaTeX commands with filled braces
const LaTeXDisplay = ({ command }: { command: string }) => {
    if (!command) return null;

    const FilledBrace = ({ letter }: { letter: string }) => (
        <span>
            <span className="latex-display__brace">{"{"}</span>
            <span className="latex-display__letter">{letter}</span>
            <span className="latex-display__brace">{"}"}</span>
        </span>
    );

    // Split the command into parts with empty braces
    const parts: any[] = [];
    let letterCode = "a".charCodeAt(0);
    let currentText = "";
    let i = 0;

    while (i < command.length) {
        if (
            i + 1 < command.length &&
            command[i] === "{" &&
            command[i + 1] === "}"
        ) {
            // Found empty braces
            if (currentText) {
                parts.push({ type: "text", content: currentText });
                currentText = "";
            }
            parts.push({
                type: "brace",
                letter: String.fromCharCode(letterCode++),
            });
            i += 2;
        } else {
            currentText += command[i];
            i++;
        }
    }

    if (currentText) {
        parts.push({ type: "text", content: currentText });
    }

    return (
        <span className="latex-display">
            {parts.map((part, index) =>
                part.type === "text" ? (
                    <span key={index}>{part.content}</span>
                ) : (
                    <FilledBrace key={index} letter={part.letter} />
                ),
            )}
        </span>
    );
};

export default LaTeXDisplay;
