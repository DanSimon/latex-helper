declare module "fz-search" {
    export interface SearchResult<T = any> {
        item: T;
        score: number;
    }

    export interface FuzzySearchOptions<T = any> {
        // Scoring and inclusion thresholds
        minimum_match?: number; // Minimum score to consider two tokens are not unrelated (default: 1.0)
        thresh_include?: number; // To be a candidate, score of item must be at least this (default: 2.0)
        thresh_relative_to_best?: number; // Must be at least this fraction of the best score (default: 0.5)
        field_good_enough?: number; // If a field has this score, stop searching other fields (default: 20)

        // Scoring bonuses
        bonus_match_start?: number; // Additional value per character in common prefix (default: 0.5)
        bonus_token_order?: number; // Value of two tokens properly ordered (default: 2.0)
        bonus_position_decay?: number; // Exponential decay for position bonus (default: 0.7)

        // Token handling options
        score_per_token?: boolean; // Split query & field in tokens, allow different order matching (default: true)
        score_test_fused?: boolean; // Try matching ignoring token separation (default: false)
        score_acronym?: boolean; // Enable acronym matching (default: false)
        token_sep?: string; // Token separator characters (default: " .,-:")

        // Output configuration
        score_round?: number; // Round scores for alphabetical sorting of equal scores (default: 0.1)
        output_limit?: number; // Maximum number of results to return, 0 for unlimited (default: 0)
        sorter?: (a: SearchResult<T>, b: SearchResult<T>) => number; // Custom sort function
        normalize?: (s: string) => string; // String normalization function
        filter?: (item: T) => boolean; // Pre-search filter function
        output_map?: string | ((result: SearchResult<T>) => any); // Transform the output
        join_str?: string; // String used to join array fields (default: ", ")

        // Token length constraints
        token_query_min_length?: number; // Minimum query token length (default: 2)
        token_field_min_length?: number; // Minimum field token length (default: 3)
        token_query_max_length?: number; // Maximum query token length (default: 64)
        token_field_max_length?: number; // Maximum field token length (default: 64)
        token_fused_max_length?: number; // Maximum fused token length (default: 64)
        token_min_rel_size?: number; // Minimum relative token size ratio (default: 0.6)
        token_max_rel_size?: number; // Maximum relative token size ratio (default: 10)

        // Interactive search options
        interactive_debounce?: number; // Debounce time for interactive search (default: 150)
        interactive_mult?: number; // Overhead multiplier for timing (default: 1.2)
        interactive_burst?: number; // Allowed burst size (default: 3)

        // Data and indexing options
        source: T[]; // Source array to search
        keys?: (keyof T)[]; // Fields to search within source items
        lazy?: boolean; // Defer index updates until search (default: false)
        token_re?: RegExp; // Regular expression for token separation
        identify_item?: (item: T) => any; // Function to uniquely identify items
        use_index_store?: boolean; // Enable index store optimization (default: false)
        store_thresh?: number; // Store phase cutoff threshold (default: 0.7)
        store_max_results?: number; // Maximum results for store phase (default: 1500)
    }

    export default class FuzzySearch<T = any> {
        constructor(options: FuzzySearchOptions<T>);
        search(shortcut: string): T[];
    }
}
