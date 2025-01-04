import { getTrimmedWord } from "../string_utils";

describe("getTrimmedWord", () => {
    // Basic word trimming
    test("returns full word when no delimiters present", () => {
        expect(getTrimmedWord("alpha")).toBe("alpha");
    });

    test("trims word starting with space", () => {
        expect(getTrimmedWord(" alpha")).toBe("alpha");
    });

    test("trims word starting with dollar sign", () => {
        expect(getTrimmedWord("$alpha")).toBe("alpha");
    });

    // Mixed character types
    test("trims alphanumeric combinations correctly", () => {
        expect(getTrimmedWord("\\alpha123")).toBe("\\alpha123");
    });

    test("handles backslash followed by word", () => {
        expect(getTrimmedWord("\\alpha")).toBe("\\alpha");
    });

    // LaTeX command patterns
    test("handles LaTeX commands with braces", () => {
        expect(getTrimmedWord("\\frac{1}{2}")).toBe("}");
    });

    test("preserves nested braces", () => {
        expect(getTrimmedWord("\\sqrt{\\frac{1}{2}}")).toBe("}");
    });

    // Symbol handling
    test("handles special boundary characters", () => {
        expect(getTrimmedWord("\\big)")).toBe(")");
        expect(getTrimmedWord("\\big(")).toBe("(");
        expect(getTrimmedWord("\\big[")).toBe("[");
        expect(getTrimmedWord("\\big]")).toBe("]");
    });

    test("handles pure symbol sequences", () => {
        expect(getTrimmedWord("===")).toBe("===");
        expect(getTrimmedWord("->>")).toBe("->>");
    });

    // Complex cases
    test("handles mixed alphanumeric and symbols", () => {
        expect(getTrimmedWord("\\alpha=beta")).toBe("beta");
        expect(getTrimmedWord("x+y=z")).toBe("z");
    });

    test("handles edge cases with spaces and symbols", () => {
        expect(getTrimmedWord(" \\alpha = \\beta")).toBe("\\beta");
        expect(getTrimmedWord("$\\alpha$ \\beta")).toBe("\\beta");
    });

    // Multiple delimiters
    test("handles multiple delimiters correctly", () => {
        expect(getTrimmedWord("$ \\alpha")).toBe("\\alpha");
        expect(getTrimmedWord("$ $ \\beta")).toBe("\\beta");
    });

    // Empty and invalid inputs
    test("handles empty string", () => {
        expect(getTrimmedWord("")).toBe("");
    });

    test("handles string with only delimiters", () => {
        expect(getTrimmedWord("$ ")).toBe("");
        expect(getTrimmedWord(" $")).toBe("");
    });
});
