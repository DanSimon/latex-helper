const delims = ["$", " "];
const escapedDelims = ["{", "}", "$"];
//for the most part we assume a command is either entirely alpha or entirely symbols
//this way if the user types "\alpha=bet" we use "bet" as the search string and not the whole thing
//The main exceptions are with parens and brackets, aka commands like \big)
//const boundaries = ["(", "[", ")", "]"];

function isAlpha(char: string) {
    return (
        (char >= "a" && char <= "z") ||
        (char >= "A" && char <= "Z") ||
        (char >= "0" && char <= "9")
    );
}

export function getTrimmedWord(word: string): string {
    let i = word.length - 1;
    const isAlphaEnd = isAlpha(word[i]);
    if (isAlphaEnd) {
        i -= 1;
    }
    while (i >= 0) {
        const isAlphaCur = isAlpha(word[i]);
        if (
            delims.includes(word[i]) ||
            (word[i] != "\\" && isAlphaCur != isAlphaEnd)
        ) {
            i += 1;
            break;
        } else if (escapedDelims.includes(word[i])) {
            if (i >= 0 && word[i - 1] == "\\") {
                i -= 1;
            }
            break;
        } else {
            i -= 1;
        }
    }
    if (i <= 0) {
        return word;
    }
    const res = word.substr(i);
    return res;
}

export function hasUnclosedMathSection(str: string): boolean {
    let inMathMode = false;
    let isDoubleDollar = false;

    // Process string character by character
    for (let i = 0; i < str.length; i++) {
        // Handle escaped dollar signs
        if (str[i] === "\\" && i + 1 < str.length && str[i + 1] === "$") {
            i++; // Skip the escaped dollar sign
            continue;
        }

        // Check for double dollar signs
        if (str[i] === "$" && i + 1 < str.length && str[i + 1] === "$") {
            if (!inMathMode) {
                inMathMode = true;
                isDoubleDollar = true;
                i++; // Skip second dollar
            } else if (isDoubleDollar) {
                inMathMode = false;
                isDoubleDollar = false;
                i++; // Skip second dollar
            }
            continue;
        }

        // Handle single dollar signs
        if (str[i] === "$") {
            if (!inMathMode && (i == str.length - 1 || str[i + 1] != " ")) {
                inMathMode = true;
                isDoubleDollar = false;
            } else if (!isDoubleDollar && (i == 0 || str[i - 1] != " ")) {
                inMathMode = false;
            }
        }
    }
    return inMathMode;
}

export function findFirstBracePair(text: string): number | null {
    const matches = text.match(/\\[a-zA-Z]+(\{\})+/);
    if (!matches) return null;

    const command = matches[0];
    const bracketIndex = command.indexOf("{}");
    if (bracketIndex === -1) return null;

    return bracketIndex + matches.index! + 1;
}
