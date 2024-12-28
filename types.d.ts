declare module "fz-search" {
    export default class FuzzySearch<T = any> {
        constructor(options: {
            source: T[];
            keys?: (keyof T)[];
            caseSensitive?: boolean;
            sort?: boolean;
            thresh_include?: number;
        });
        search(pattern: string): T[];
    }
}
