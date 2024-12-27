import { EditorView, KeyBinding, keymap } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { SuggestionPopup } from "./suggestion_popup";

function getLatexCommandAtCursor(
    view: EditorView,
): { text: string; from: number; to: number } | null {
    const doc = view.state.doc;
    const pos = view.state.selection.main.head;
    const line = doc.lineAt(pos);
    const lineText = line.text;

    // Find start of command (backslash preceded by space or $ or start of line)
    let startIdx = pos - line.from;
    while (startIdx > 0 && !/[\s$]/.test(lineText[startIdx - 1])) {
        startIdx--;
    }

    // Find end of command (space or $ or end of line)
    let endIdx = pos - line.from;
    while (endIdx < lineText.length && !/[\s$]/.test(lineText[endIdx])) {
        endIdx++;
    }

    const command = lineText.slice(startIdx, endIdx);
    if (command.match(/\\[a-zA-Z]+(\{[^}]*\})+/)) {
        return {
            text: command,
            from: line.from + startIdx,
            to: line.from + endIdx,
        };
    }

    return null;
}

function findNextBracePosition(
    command: string,
    currentOffset: number,
): number | null {
    // Use positive lookahead to avoid consuming the closing brace in the match
    const braceMatches = [
        ...command.matchAll(/\{(?:[^{}]*|(?:\{[^{}]*\})*)*\}/g),
    ];

    // Find which pair of braces we're currently in or just after
    let currentPairIndex = -1;
    for (let i = 0; i < braceMatches.length; i++) {
        const match = braceMatches[i];
        if (!match.index) continue;

        const braceStart = match.index;
        const braceEnd = braceStart + match[0].length;

        if (currentOffset >= braceStart && currentOffset <= braceEnd) {
            currentPairIndex = i;
            break;
        }
    }

    // If we found the current pair and there's a next pair, return its position
    if (currentPairIndex >= 0 && currentPairIndex < braceMatches.length - 1) {
        const nextMatch = braceMatches[currentPairIndex + 1];
        return nextMatch.index! + 1; // +1 to get inside the brace
    }

    // If we're in or after the last pair, return position after the command
    if (currentPairIndex >= 0) {
        return command.length;
    }

    // If we're not in any pair, return the first pair
    if (braceMatches.length > 0) {
        return braceMatches[0].index! + 1;
    }

    return null;
}

export function latexNavigation(popup: SuggestionPopup): Extension {
    const latexNavigationKeymap: KeyBinding[] = [
        {
            key: "Tab",
            run: (view: EditorView): boolean => {
                if (popup.isVisible()) {
                    return true;
                }
                const command = getLatexCommandAtCursor(view);
                if (command) {
                    const pos = view.state.selection.main.head;
                    const relativeOffset = pos - command.from;
                    const nextPosition = findNextBracePosition(
                        command.text,
                        relativeOffset,
                    );

                    if (nextPosition !== null) {
                        const newPos = command.from + nextPosition;
                        view.dispatch({
                            selection: { anchor: newPos, head: newPos },
                        });
                        return true; // Prevent other handlers
                    }
                }
                return false; // Let other handlers process the tab
            },
        },
        {
            key: "Enter",
            run: (_view: EditorView): boolean => {
                return popup.isVisible();
            },
        },
    ];
    return keymap.of(latexNavigationKeymap);
}
