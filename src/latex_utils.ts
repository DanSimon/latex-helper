export function fillLatexHtmlBraces(
    input: string,
    color: string = "blue",
): string {
    let letterCode = "a".charCodeAt(0);

    // Find all empty brace pairs
    const emptyBraceRegex = /\{(\s*)\}/g;

    return input.replace(emptyBraceRegex, () => {
        const letter = String.fromCharCode(letterCode++);
        return `{<span style="color:${color}">${letter}</span>}`;
    });
}

export function fillLatexBraces(input: string, color: string = "blue"): string {
    let letterCode = "a".charCodeAt(0);

    // Find all empty brace pairs
    const emptyBraceRegex = /\{(\s*)\}/g;

    return input.replace(emptyBraceRegex, () => {
        const letter = String.fromCharCode(letterCode++);
        return `{\\color{${color}}{${letter}}}`;
    });
}
