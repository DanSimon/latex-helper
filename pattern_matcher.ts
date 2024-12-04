import { Pattern } from "./config"

// Interface for trie term structure
interface TrieTerm {
    term: string;
    value: Pattern;
}

// Interface for lookup results
interface LookupResult {
    value: Pattern;
    match: string[];
}

// Interface for suggestion results
interface SuggestionResult {
    suggestions: string[];
    fastReplace: boolean;
}

class TrieNode {
    children: { [key: string]: TrieNode };
    value: Pattern | null;

    constructor() {
        this.children = {};
        this.value = null;
    }
}

class Trie {
    private root: TrieNode;

    /**
     * Constructs an immutable Trie.
     * @param terms - Array of terms with associated values.
     */
    constructor(terms: TrieTerm[]) {
        this.root = new TrieNode();
        for (const { term, value } of terms) {
            this.insert(term, value);
        }
    }

    /**
     * Inserts a term with its associated value into the trie.
     * @param term - The term to insert (may contain wildcards '*').
     * @param value - The value associated with the term.
     */
    private insert(term: string, value: Pattern): void {
        let node = this.root;
        for (const char of term) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.value = value;
    }

    /**
     * Looks up a string in the trie, matching terms that may contain wildcards '*'.
     * Collects all matching values and the characters matched by wildcards.
     * @param query - The string to look up.
     * @returns An array of matching results.
     */
    lookup(query: string): LookupResult[] {
        const results: LookupResult[] = [];
        const visited = new Set<TrieNode>();

        this._lookupHelper(this.root, query, 0, results, [], visited);

        return results;
    }

    private _lookupHelper(
        node: TrieNode,
        query: string,
        index: number,
        results: LookupResult[],
        wildcardMatches: string[],
        visited: Set<TrieNode>
    ): void {
        if (index === query.length) {
            if (node.value !== null && !visited.has(node)) {
                results.push({
                    value: node.value,
                    match: wildcardMatches.slice(),
                });
                visited.add(node);
            }
            return;
        }

        const char = query[index];

        // First, try exact character match
        if (node.children[char]) {
            this._lookupHelper(
                node.children[char],
                query,
                index + 1,
                results,
                wildcardMatches,
                visited
            );
        }

        // Then, try wildcard match
        if (char.match(/^[0-9a-z]+$/) && node.children['*']) {
            const newWildcardMatches = wildcardMatches.concat(char);
            this._lookupHelper(
                node.children['*'],
                query,
                index + 1,
                results,
                newWildcardMatches,
                visited
            );
        }
    }

    /**
     * Returns all values of terms that start with the given query string.
     * @param query - The query string.
     * @returns An array of values associated with matching terms.
     */
    typeAhead(query: string): Pattern[] {
        let nodes = [{ node: this.root, index: 0 }];
        const results: Pattern[] = [];
        const collectedNodes = new Set<TrieNode>();

        while (nodes.length > 0) {
            let nextNodes = [];
            for (const { node, index } of nodes) {
                if (index === query.length) {
                    this._collectValues(node, results, collectedNodes);
                } else {
                    const char = query[index];
                    if (node.children[char]) {
                        nextNodes.push({
                            node: node.children[char],
                            index: index + 1,
                        });
                    }
                    if (char.match(/^[0-9a-z]+$/) && node.children['*']) {
                        nextNodes.push({
                            node: node.children['*'],
                            index: index + 1,
                        });
                    }
                }
            }
            nodes = nextNodes;
        }

        return results;
    }

    private _collectValues(
        startNode: TrieNode,
        results: Pattern[],
        collectedNodes: Set<TrieNode>
    ): void {
        let queue = [startNode];
        const visitedNodes = new Set<TrieNode>();

        while (queue.length > 0) {
            const node = queue.shift()!;

            if (visitedNodes.has(node)) {
                continue;
            }
            visitedNodes.add(node);

            if (node.value !== null && !collectedNodes.has(node)) {
                results.push(node.value);
                collectedNodes.add(node);
            }

            for (const childNode of Object.values(node.children)) {
                queue.push(childNode);
            }
        }
    }
}

class RegexMatcher {
    private patterns: { regex: RegExp; replacements: string[] }[];

    constructor(patterns: Pattern[]) {
        this.patterns = patterns.map((p) => ({
            regex: new RegExp(p.pattern),
            replacements: p.replacements,
        }));
    }

    addPattern(pattern: Pattern): void {
        this.patterns.push({
            regex: new RegExp(pattern.pattern),
            replacements: pattern.replacements,
        });
    }

    getSuggestions(input: string): SuggestionResult {
        const suggestions: string[] = [];
        let fastReplace = false;

        for (const pattern of this.patterns) {
            const matches = input.match(pattern.regex);

            if (matches) {
                for (const replacement of pattern.replacements) {
                    let result = replacement;
                    for (let i = 1; i < matches.length; i++) {
                        result = result.replace(`$${i}`, matches[i] || '');
                    }
                    suggestions.push(result);
                }
            }
        }

        return { suggestions, fastReplace };
    }
}

export class SuggestionMatcher {
    private trie: Trie;
    private regexes: RegexMatcher;

    /**
     * Constructs a SuggestionMatcher.
     * @param patterns - Array of pattern objects.
     */
    constructor(patterns: Pattern[]) {
        const trieTerms = patterns.flatMap((conf) => {
            if (!conf.type) {
                return [{ term: conf.pattern, value: conf }];
            }
            return [];
        });

        this.trie = new Trie(trieTerms);

        const regexTerms = patterns.flatMap((conf) => {
            if (conf.type && conf.type === 'regex') {
                return [conf];
            }
            return [];
        });
        this.regexes = new RegexMatcher(regexTerms);
    }

    private replacePlaceholders(value: string, matches: string[]): string {
        return value.replace(/\$([1-9]\d*)/g, (match, indexStr) => {
            const index = parseInt(indexStr, 10) - 1;
            if (index < matches.length) {
                return matches[index];
            }
            return match;
        });
    }

    getMatchingPatterns(searchString: string): LookupResult[] {
        return this.trie.lookup(searchString);
    }

    /**
     * Takes a search string as input and returns a combined array of all replacements
     * for all matches, with the placeholders replaced.
     * @param searchString - The search string.
     * @returns Object containing suggestions array and fastReplace flag.
     */
    getSuggestions(searchString: string): SuggestionResult {
        const results = this.trie.lookup(searchString);
        const suggestions: string[] = [];
        let fastReplace = false;

        results.forEach(({ value: conf, match: wildcardMatches }) => {
            conf.replacements.forEach((replacement) => {
                const suggestion = this.replacePlaceholders(
                    replacement,
                    wildcardMatches
                );
                suggestions.push(suggestion);
            });
            fastReplace = fastReplace || !!conf.fastReplace;
        });

        const rs = this.regexes.getSuggestions(searchString);
        suggestions.push(...rs.suggestions);
        fastReplace = (fastReplace || rs.fastReplace) && suggestions.length === 1;

        return { suggestions, fastReplace };
    }
}
