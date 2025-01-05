import { EditorView, KeyBinding, keymap } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { SuggestionPopup } from "./suggestion_popup";

function nextTab(text: string, cursorPos: number): number | null {
    let depth = 0;
    let i = 0;
    let closePos = null;
    while (i < text.length) {
        if (text[i] == "{") {
            if (i >= cursorPos) {
                return i + 1;
            }
            depth += 1;
        } else if (text[i] == "}") {
            depth -= 1;
            if (i >= cursorPos) {
                closePos = i + 1;
            }
        } else if (text[i] == "\\" && depth == 0 && i >= cursorPos) {
            return closePos;
        }
        i += 1;
    }
    return closePos;
}

function prevTab(text: string, cursorPos: number): number | null {
    let depth = 0;
    let i = text.length - 1;
    let openPos = null;
    while (i >= 0) {
        if (text[i] == "}") {
            if (i < cursorPos) {
                return i;
            }
            depth -= 1;
        } else if (text[i] == "{") {
            depth += 1;
            if (i < cursorPos) {
                openPos = i;
            }
        } else if (text[i] == "\\" && depth == 0 && i < cursorPos) {
            return i;
        }
        i -= 1;
    }
    return openPos;
}

export function latexNavigation(popup: SuggestionPopup): Extension {
    const latexNavigationKeymap: KeyBinding[] = [
        {
            key: "Tab",
            run: (view: EditorView): boolean => {
                if (popup.isVisible()) {
                    return true;
                }
                const doc = view.state.doc;
                const pos = view.state.selection.main.head;
                const line = doc.lineAt(pos);
                const lineText = line.text;
                const movePos = nextTab(lineText, pos - line.from);
                if (movePos) {
                    const newPos = movePos + line.from;
                    view.dispatch({
                        selection: { anchor: newPos, head: newPos },
                    });
                    return true; // Prevent other handlers
                }

                return false; // Let other handlers process the tab
            },
        },
        {
            key: "Shift-Tab",
            run: (view: EditorView): boolean => {
                if (popup.isVisible()) {
                    return true;
                }
                const doc = view.state.doc;
                const pos = view.state.selection.main.head;
                const line = doc.lineAt(pos);
                const lineText = line.text;
                const movePos = prevTab(lineText, pos - line.from);
                if (movePos) {
                    const newPos = movePos + line.from;
                    view.dispatch({
                        selection: { anchor: newPos, head: newPos },
                    });
                    return true; // Prevent other handlers
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
