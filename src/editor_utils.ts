import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

export enum MathBlockType {
    None,
    Inline, // $...$
    InlineDouble, // $$...$$
    Block, // $$\n...\n$$
}

export interface MathBlockInfo {
    type: MathBlockType;
    from: number;
    to: number;
}

/**
 * Determines if a position is inside a math block and returns information about the block
 */
export function getMathBlockAtPosition(
    state: EditorState,
    pos: number,
): MathBlockInfo {
    if (!state || pos < 0)
        return { type: MathBlockType.None, from: -1, to: -1 };
    const tree = syntaxTree(state);
    const node = tree.resolveInner(pos, -1);

    // Walk up the syntax tree to find math-related nodes
    let current: any | null = node;
    while (current) {
        // Check node type for math blocks
        // The exact node types will depend on the markdown parser being used
        // You might need to console.log(current) to see the actual node types
        const type = current.type.name;

        if (type.includes("math") || type.includes("Math")) {
            const text = state.doc.sliceString(current.from, current.to);
            const isBlock = text.startsWith("$$") && text.includes("\n");
            const isInlineDouble =
                text.startsWith("$$") && !text.includes("\n");

            return {
                type: isBlock
                    ? MathBlockType.Block
                    : isInlineDouble
                      ? MathBlockType.InlineDouble
                      : MathBlockType.Inline,
                from: current.from,
                to: current.to,
            };
        }

        current = current.parent;
    }

    return {
        type: MathBlockType.None,
        from: -1,
        to: -1,
    };
}

/**
 * Helper function to get math block info from an editor view
 */
export function getMathBlockFromView(view: EditorView): MathBlockInfo {
    return getMathBlockAtPosition(view.state, view.state.selection.main.head);
}

/**
 * Debug helper to print node information
 */
export function debugSyntaxTreeAtPosition(state: EditorState, pos: number) {
    const tree = syntaxTree(state);
    const node = tree.resolveInner(pos);

    console.log("Syntax tree at position", pos);
    let current: any = node;
    while (current) {
        console.log(current);
        current = current.parent;
    }
}
