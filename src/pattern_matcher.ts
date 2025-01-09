import { MathConfig, Shortcut } from "./config";
import FuzzySearch from "fz-search";
import {
    LATEX_SYMBOLS,
    MathJaxSymbol,
    SuggestionConfig,
} from "./mathjax_symbols";
import { CursorWord, Suggestion, TextMode } from "./suggestion_popup";
import { UserSettings } from "./settings";
import { fillLatexBraces } from "./latex_utils";
import { getTrimmedWord } from "./string_utils";
import { debug } from "./debug_utils";

// Interface for lookup results
// TODO: this is no longer needed
interface SuggestionResult {
    suggestions: Suggestion[];
    fastReplace: boolean;
}

class TrieNode {
    children: { [key: string]: TrieNode };
    shortcuts: Shortcut[];

    constructor() {
        this.children = {};
        this.shortcuts = [];
    }
}

class Trie {
    private root: TrieNode;

    /**
     * Constructs an immutable Trie.
     * @param shortcuts - Array of shortcut objects.
     */
    constructor(shortcuts: Shortcut[]) {
        this.root = new TrieNode();
        for (const shortcut of shortcuts) {
            if (!shortcut.type || shortcut.type !== "regex") {
                this.insert(shortcut);
            }
        }
    }

    /**
     * Inserts a shortcut into the trie.
     * @param shortcut - The shortcut object to insert.
     */
    private insert(shortcut: Shortcut): void {
        let node = this.root;
        for (const char of shortcut.pattern) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.shortcuts.push(shortcut);
    }

    /**
     * Looks up a string in the trie, returning all matching shortcuts.
     * @param query - The string to look up.
     * @returns An array of matching shortcuts.
     */
    lookup(query: string): Shortcut[] {
        let node = this.root;
        for (const char of query) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }
        return node.shortcuts;
    }

    /**
     * Returns all shortcuts that start with the given query string.
     * @param query - The query string.
     * @returns An array of matching shortcuts.
     */
    typeAhead(query: string): Shortcut[] {
        let node = this.root;
        // First, traverse to the node representing the query prefix
        for (const char of query) {
            if (!node.children[char]) {
                return [];
            }
            node = node.children[char];
        }

        // Then collect all shortcuts in this subtree
        return this.collectShortcutsInSubtree(node);
    }

    private collectShortcutsInSubtree(startNode: TrieNode): Shortcut[] {
        const shortcuts: Shortcut[] = [];
        const queue = [startNode];
        const visited = new Set<TrieNode>();

        while (queue.length > 0) {
            const node = queue.shift()!;

            if (visited.has(node)) {
                continue;
            }
            visited.add(node);

            shortcuts.push(...node.shortcuts);

            for (const child of Object.values(node.children)) {
                queue.push(child);
            }
        }

        return shortcuts;
    }
}

class RegexMatcher {
    private shortcuts: { regex: RegExp; shortcut: Shortcut }[];

    constructor(shortcuts: Shortcut[]) {
        this.shortcuts = shortcuts
            .filter((p) => p.type === "regex")
            .map((p) => ({
                regex: new RegExp(p.pattern),
                shortcut: p,
            }));
    }

    getSuggestions(input: string): SuggestionResult {
        const suggestions: Suggestion[] = [];
        let fastReplace = false;

        for (const { regex, shortcut } of this.shortcuts) {
            const matches = input.match(regex);

            if (matches) {
                for (const replacement of shortcut.replacements) {
                    let result = replacement;
                    for (let i = 1; i < matches.length; i++) {
                        result = result.replace(`$${i}`, matches[i] || "");
                    }
                    suggestions.push({
                        replacement: result,
                        displayReplacement: result,
                        fastReplace: shortcut.fastReplace || false,
                        normalMode: shortcut.normalMode,
                        matchedString: matches[0],
                    });
                }
                // Update fastReplace if this shortcut enables it
                fastReplace =
                    fastReplace ||
                    (!!shortcut.fastReplace &&
                        shortcut.replacements.length === 1);
            }
        }

        return { suggestions, fastReplace };
    }
}

class FuzzyMatcher {
    private search: FuzzySearch;

    constructor(overrides: Record<string, SuggestionConfig>) {
        this.search = new FuzzySearch<MathJaxSymbol>({
            source: LATEX_SYMBOLS.filter((sym) =>
                overrides[sym.name] === undefined
                    ? sym.suggestionConfig.suggestionEnabled
                    : overrides[sym.name].suggestionEnabled,
            ),
            keys: ["searchName"],
            token_query_min_length: 1,
            token_field_min_length: 1,
        });
    }

    getSuggestions(input: string, fillerColor: string): SuggestionResult {
        return {
            suggestions: this.search.search(input).map((r: MathJaxSymbol) => {
                return {
                    fastReplace: false,
                    matchedString: input,
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
    private fuzzy: FuzzyMatcher;

    /**
     * Constructs a SuggestionMatcher.
     * @param shortcuts - Array of shortcut objects.
     */
    constructor(config: MathConfig) {
        this.trie = new Trie(config.shortcuts);
        this.regexes = new RegexMatcher(config.shortcuts);
        this.fuzzy = new FuzzyMatcher(config.symbolOverrides);
    }

    /**
     * Returns all matching shortcuts for a search string.
     * @param searchString - The string to look up.
     * @returns An array of matching shortcuts.
     */
    getMatchingShortcuts(searchString: string): Shortcut[] {
        return this.trie.lookup(searchString);
    }

    /**
     * Takes a search string as input and returns a combined array of all replacements
     * for all matches.
     * @param searchString - The search string.
     * @returns Object containing suggestions array and fastReplace flag.
     */
    getSuggestions(
        searchString: CursorWord,
        fillerColor: string,
        maxResults: number,
        settings: UserSettings,
    ): Suggestion[] {
        const trimmedSearch = getTrimmedWord(searchString.word);
        const suggestions: Suggestion[] = [];
        debug(
            `${searchString.mode} mode search: '${searchString.word}', trimmed '${trimmedSearch}'`,
        );

        const insertSuggestion = (nxt: Suggestion) => {
            if (
                (searchString.mode == TextMode.Math ||
                    (searchString.mode == TextMode.Normal &&
                        (nxt.normalMode || false))) &&
                !suggestions.find(
                    (elem: Suggestion) => elem.replacement == nxt.replacement,
                )
            ) {
                if (
                    nxt.fastReplace &&
                    settings.enableFastReplace &&
                    (suggestions.length == 0 || !suggestions[0].fastReplace)
                ) {
                    suggestions.splice(0, 0, nxt);
                } else {
                    suggestions.push(nxt);
                }
                return true;
            }
            return false;
        };

        const insertSuggestions = (getNext: () => Suggestion | null) => {
            while (suggestions.length < maxResults) {
                const nxt = getNext();
                if (!nxt) {
                    return;
                }
                insertSuggestion(nxt);
            }
        };

        // Handle regex matches
        if (suggestions.length < maxResults) {
            const regexResults = this.regexes.getSuggestions(searchString.word);
            insertSuggestions(() => regexResults.suggestions.shift() || null);
        }

        // Handle exact matches
        if (suggestions.length < maxResults) {
            const exactMatches = this.trie.lookup(trimmedSearch).slice();
            const queue: Suggestion[] = [];
            const nxt = () => {
                if (queue.length == 0) {
                    const shortcut = exactMatches.shift();
                    if (!shortcut) {
                        return null;
                    }
                    queue.push(
                        ...shortcut.replacements
                            .slice(0, maxResults)
                            .map((r: string) => {
                                return {
                                    replacement: r,
                                    matchedString: trimmedSearch,
                                    displayReplacement: fillLatexBraces(
                                        r,
                                        fillerColor,
                                    ),
                                    fastReplace: shortcut.fastReplace || false,
                                    normalMode: shortcut.normalMode,
                                };
                            }),
                    );
                }
                return queue.shift()!;
            };
            insertSuggestions(nxt);
        }

        const searchLongEnough = trimmedSearch
            .slice(0, 2)
            .match(/^[a-zA-Z]|^\\[a-zA-Z]/)
            ? trimmedSearch.length >= settings.minAlphaSuggestChars
            : trimmedSearch.length >= settings.minSymbolSuggestChars;
        if (
            suggestions.length < maxResults &&
            settings.includeFuzzySuggestions &&
            searchLongEnough
        ) {
            const fuzzyResults = this.fuzzy.getSuggestions(
                trimmedSearch,
                fillerColor,
            );
            insertSuggestions(() => fuzzyResults.suggestions.shift() || null);
        }

        return suggestions;
    }
}
