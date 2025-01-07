//originally from https://github.com/greasycat/BetterMathjax/blob/master/src/mathjax-symbols.ts
import * as symbols_json from "./mathjax-symbols.json";

export type MathJaxSymbol = {
    name: string;
    searchName: string;
    description: string;
    examples: string[];
    see_also: string[];
    snippet: string;
    suggestion_display?: string;
    suggestionConfig: SuggestionConfig;
};

export type SuggestionConfig = {
    //whether the symbols will appear as an autocomplete suggestion
    suggestionEnabled?: boolean;
    //whether the symbol will be a fast-replace suggestion
    fastReplace?: boolean;
    //whether the symbol will appear in autocomplete outside math blocks
    normalMode?: boolean;
};

const GLOBAL_SUGGEST_DEFAULTS: SuggestionConfig = {
    suggestionEnabled: true,
    fastReplace: false,
    normalMode: false,
};

(symbols_json.symbols as any[]).forEach((sym: any) => {
    sym.searchName = (sym.name as string).replace(/[{}\\]/g, "");
    sym.suggestionConfig = {
        ...GLOBAL_SUGGEST_DEFAULTS,
        ...sym.suggestionConfig,
    };
});
export const LATEX_SYMBOLS = symbols_json.symbols as MathJaxSymbol[];
