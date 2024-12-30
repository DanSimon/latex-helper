import { Pattern } from "./config";
import FuzzySearch from "fz-search";
import { LATEX_SYMBOLS, MathJaxSymbol } from "./mathjax_symbols";
import { Suggestion } from "./suggestion_popup";
import { UserSettings } from "./settings";

// Interface for lookup results
interface SuggestionResult {
    suggestions: Suggestion[];
    fastReplace: boolean;
}

class TrieNode {
    children: { [key: string]: TrieNode };
    patterns: Pattern[];

    constructor() {
        this.children = {};
        this.patterns = [];
    }
}

class Trie {
    private root: TrieNode;

    /**
     * Constructs an immutable Trie.
     * @param patterns - Array of pattern objects.
     */
    constructor(patterns: Pattern[]) {
        this.root = new TrieNode();
        for (const pattern of patterns) {
            if (!pattern.type || pattern.type !== "regex") {
                this.insert(pattern);
            }
        }
    }

    /**
     * Inserts a pattern into the trie.
     * @param pattern - The pattern object to insert.
     */
    private insert(pattern: Pattern): void {
        let node = this.root;
        for (const char of pattern.pattern) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.patterns.push(pattern);
    }

    /**
     * Looks up a string in the trie, returning all matching patterns.
     * @param query - The string to look up.
     * @returns An array of matching patterns.
     */
    lookup(query: string): Pattern[] {
        let node = this.root;
        for (const char of query) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }
        return node.patterns;
    }

    /**
     * Returns all patterns that start with the given query string.
     * @param query - The query string.
     * @returns An array of matching patterns.
     */
    typeAhead(query: string): Pattern[] {
        let node = this.root;
        // First, traverse to the node representing the query prefix
        for (const char of query) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }

        // Then collect all patterns in this subtree
        return this.collectPatternsInSubtree(node);
    }

    private collectPatternsInSubtree(startNode: TrieNode): Pattern[] {
        const patterns: Pattern[] = [];
        const queue = [startNode];
        const visited = new Set<TrieNode>();

        while (queue.length > 0) {
            const node = queue.shift()!;

            if (visited.has(node)) {
                continue;
            }
            visited.add(node);

            patterns.push(...node.patterns);

            for (const child of Object.values(node.children)) {
                queue.push(child);
            }
        }

        return patterns;
    }
}

class RegexMatcher {
    private patterns: { regex: RegExp; pattern: Pattern }[];

    constructor(patterns: Pattern[]) {
        this.patterns = patterns
            .filter((p) => p.type === "regex")
            .map((p) => ({
                regex: new RegExp(p.pattern),
                pattern: p,
            }));
    }

    getSuggestions(input: string): SuggestionResult {
        const suggestions: Suggestion[] = [];
        let fastReplace = false;

        for (const { regex, pattern } of this.patterns) {
            const matches = input.match(regex);

            if (matches) {
                for (const replacement of pattern.replacements) {
                    let result = replacement;
                    for (let i = 1; i < matches.length; i++) {
                        result = result.replace(`$${i}`, matches[i] || "");
                    }
                    suggestions.push({
                        replacement: result,
                        displayReplacement: result,
                    });
                }
                // Update fastReplace if this pattern enables it
                fastReplace =
                    fastReplace ||
                    (!!pattern.fastReplace &&
                        pattern.replacements.length === 1);
            }
        }

        return { suggestions, fastReplace };
    }
}
function fillLatexBraces(input: string, color: string = "blue"): string {
    let letterCode = "a".charCodeAt(0);

    // Find all empty brace pairs
    const emptyBraceRegex = /\{(\s*)\}/g;

    return input.replace(emptyBraceRegex, () => {
        const letter = String.fromCharCode(letterCode++);
        return `{\\color{${color}}{${letter}}}`;
    });
}

class FuzzyMatcher {
    private search: FuzzySearch = new FuzzySearch<MathJaxSymbol>({
        source: LATEX_SYMBOLS,
        keys: ["searchName"],
    });

    constructor() {}

    getSuggestions(input: string, fillerColor: string): SuggestionResult {
        return {
            suggestions: this.search.search(input).map((r: MathJaxSymbol) => {
                return {
                    replacement: r.name,
                    displayReplacement:
                        r.suggestion_display !== undefined &&
                        r.suggestion_display !== null
                            ? r.suggestion_display
                            : fillLatexBraces(r.name, fillerColor),
                };
            }),
            fastReplace: false,
        };
    }
}

export class SuggestionMatcher {
    private trie: Trie;
    private regexes: RegexMatcher;
    private fuzzy: FuzzyMatcher = new FuzzyMatcher();

    /**
     * Constructs a SuggestionMatcher.
     * @param patterns - Array of pattern objects.
     */
    constructor(patterns: Pattern[]) {
        this.trie = new Trie(patterns);
        this.regexes = new RegexMatcher(patterns);
    }

    /**
     * Returns all matching patterns for a search string.
     * @param searchString - The string to look up.
     * @returns An array of matching patterns.
     */
    getMatchingPatterns(searchString: string): Pattern[] {
        return this.trie.lookup(searchString);
    }

    /**
     * Takes a search string as input and returns a combined array of all replacements
     * for all matches.
     * @param searchString - The search string.
     * @returns Object containing suggestions array and fastReplace flag.
     */
    getSuggestions(
        searchString: string,
        fillerColor: string,
        maxResults: number,
        settings: UserSettings,
    ): SuggestionResult {
        const exactMatches = this.trie.lookup(searchString);
        const suggestions: Suggestion[] = [];
        let fastReplace = false;

        // Handle exact matches
        for (const pattern of exactMatches) {
            suggestions.push(
                ...pattern.replacements
                    .slice(0, maxResults)
                    .map((r: string) => {
                        return {
                            replacement: r,
                            displayReplacement: fillLatexBraces(r, fillerColor),
                        };
                    }),
            );
            // Enable fastReplace if any matching pattern enables it and has exactly one replacement
            fastReplace =
                fastReplace ||
                (!!pattern.fastReplace && pattern.replacements.length === 1);
        }
        if (suggestions.length < maxResults) {
            // Handle regex matches
            const regexResults = this.regexes.getSuggestions(searchString);
            while (
                suggestions.length < maxResults &&
                regexResults.suggestions.length > 0
            ) {
                const nxt = regexResults.suggestions.shift()!;
                if (
                    !suggestions.find(
                        (elem: Suggestion) =>
                            elem.replacement == nxt.replacement,
                    )
                ) {
                    suggestions.push(nxt);
                }
            }
            fastReplace = fastReplace || regexResults.fastReplace;
        }
        if (
            suggestions.length < maxResults &&
            settings.includeFuzzySuggestions
        ) {
            const fuzzyResults = this.fuzzy.getSuggestions(
                searchString,
                fillerColor,
            );
            while (
                suggestions.length < maxResults &&
                fuzzyResults.suggestions.length > 0
            ) {
                const nxt = fuzzyResults.suggestions.shift()!;
                if (
                    !suggestions.find(
                        (elem: Suggestion) =>
                            elem.replacement == nxt.replacement,
                    )
                ) {
                    suggestions.push(nxt);
                }
            }
        }

        fastReplace = fastReplace && suggestions.length === 1;

        return { suggestions, fastReplace };
    }
}
