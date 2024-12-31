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
};

(symbols_json.symbols as any[]).forEach((sym: any) => {
    sym.searchName = (sym.name as string).replace(/[{}\\]/g, "");
});
export const LATEX_SYMBOLS = symbols_json.symbols as MathJaxSymbol[];
