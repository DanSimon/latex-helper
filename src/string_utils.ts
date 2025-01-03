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
