//originally from https://github.com/greasycat/BetterMathjax/blob/master/src/mathjax-symbols.ts
import * as symbols_json from "./mathjax-symbols.json";

export type MathJaxSymbol = {
    name: string;
    description: string | string[];
    examples: string | string[];
    see_also: string[];
    snippet: string;
};

export const LATEX_SYMBOLS = symbols_json.symbols as MathJaxSymbol[];
