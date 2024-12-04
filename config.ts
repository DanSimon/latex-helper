import {
    Plugin,
} from 'obsidian';

import { SuggestionMatcher } from "./pattern_matcher"



export interface Pattern {
    type?: 'regex';
    pattern: string;
    replacements: string[];
}

interface MathConfig {
    renderMath: boolean;
    patterns: Pattern[];
}

const DEFAULT_CONFIG: MathConfig = {
    renderMath: false,
    patterns : [
        // Logical operators
        { pattern: 'or', replacements: ['\\lor'] },
        { pattern: 'and', replacements: ['\\land'] },
        { pattern: 'not', replacements: ['\\lnot'] },
        { pattern: '=>', replacements: ['\\implies'] },
        { pattern: '<=>', replacements: ['\\iff'] },

        // Greek letters
        { pattern: 'a', replacements: ['\\alpha', '\\aleph'] },
        { pattern: 'b', replacements: ['\\beta'] },
        { pattern: 'g', replacements: ['\\gamma'] },
        { pattern: 'd', replacements: ['\\delta'] },
        { pattern: 'e', replacements: ['\\epsilon', '\\varepsilon'] },
        { pattern: 'z', replacements: ['\\zeta'] },
        { pattern: 'h', replacements: ['\\eta'] },
        { pattern: 't', replacements: ['\\theta', '\\vartheta'] },
        { pattern: 'i', replacements: ['\\iota'] },
        { pattern: 'k', replacements: ['\\kappa'] },
        { pattern: 'l', replacements: ['\\lambda'] },
        { pattern: 'm', replacements: ['\\mu'] },
        { pattern: 'n', replacements: ['\\nu'] },
        { pattern: 'x', replacements: ['\\xi'] },
        { pattern: 'o', replacements: ['\\omicron'] },
        { pattern: 'p', replacements: ['\\pi', '\\varpi'] },
        { pattern: 'r', replacements: ['\\rho', '\\varrho'] },
        { pattern: 's', replacements: ['\\sigma', '\\varsigma'] },
        { pattern: 'u', replacements: ['\\upsilon'] },
        { pattern: 'f', replacements: ['\\phi', '\\varphi'] },
        { pattern: 'c', replacements: ['\\chi'] },
        { pattern: 'y', replacements: ['\\psi'] },
        { pattern: 'w', replacements: ['\\omega'] },

        // Uppercase Greek letters
        { pattern: 'A', replacements: ['\\Alpha'] },
        { pattern: 'B', replacements: ['\\Beta'] },
        { pattern: 'G', replacements: ['\\Gamma'] },
        { pattern: 'D', replacements: ['\\Delta'] },
        { pattern: 'E', replacements: ['\\Epsilon'] },
        { pattern: 'Z', replacements: ['\\Zeta'] },
        { pattern: 'H', replacements: ['\\Eta'] },
        { pattern: 'T', replacements: ['\\Theta'] },
        { pattern: 'I', replacements: ['\\Iota'] },
        { pattern: 'K', replacements: ['\\Kappa'] },
        { pattern: 'L', replacements: ['\\Lambda'] },
        { pattern: 'M', replacements: ['\\Mu'] },
        { pattern: 'N', replacements: ['\\Nu'] },
        { pattern: 'X', replacements: ['\\Xi'] },
        { pattern: 'O', replacements: ['\\Omicron'] },
        { pattern: 'P', replacements: ['\\Pi'] },
        { pattern: 'R', replacements: ['\\Rho'] },
        { pattern: 'S', replacements: ['\\Sigma'] },
        { pattern: 'U', replacements: ['\\Upsilon'] },
        { pattern: 'F', replacements: ['\\Phi'] },
        { pattern: 'C', replacements: ['\\Chi'] },
        { pattern: 'Y', replacements: ['\\Psi'] },
        { pattern: 'W', replacements: ['\\Omega'] },

        // Parentheses and brackets
        { pattern: '(', replacements: ['\\left(', '\\('] },
        { pattern: ')', replacements: ['\\right)', '\\)'] },
        { pattern: '[', replacements: ['\\left[', '\\lbrack'] },
        { pattern: ']', replacements: ['\\right]', '\\rbrack'] },
        { pattern: '{', replacements: ['\\left\\{', '\\lbrace'] },
        { pattern: '}', replacements: ['\\right\\}', '\\rbrace'] },
        { pattern: '|', replacements: ['\\left|', '\\right|'] },

        // Arrows
        { pattern: '->', replacements: ['\\rightarrow', '\\to'] },
        { pattern: '<-', replacements: ['\\leftarrow'] },
        { pattern: '<->', replacements: ['\\leftrightarrow'] },
        { pattern: '=>', replacements: ['\\implies'] },
        { pattern: '<=', replacements: ['\\leq'] },
        { pattern: '>=', replacements: ['\\geq'] },

        // Mathematical operators
        { pattern: '+', replacements: ['+'] },
        { pattern: '-', replacements: ['-'] },
        //{ pattern: '*', replacements: ['\\times', '\\ast'] },
        { pattern: '/', replacements: ['\\div'] },
        { pattern: 'sum', replacements: ['\\sum'] },
        { pattern: 'int', replacements: ['\\int'] },
        { pattern: 'lim', replacements: ['\\lim'] },
        { pattern: 'inf', replacements: ['\\infty'] },
        { pattern: 'sqrt', replacements: ['\\sqrt'] },
        { pattern: 'prod', replacements: ['\\prod'] },

        // Relational operators
        { pattern: '=', replacements: ['='] },
        { pattern: '!=', replacements: ['\\neq'] },
        { pattern: '~=', replacements: ['\\approx'] },
        { pattern: '~~', replacements: ['\\sim'] },
        { pattern: '<<', replacements: ['\\ll'] },
        { pattern: '>>', replacements: ['\\gg'] },

        // Set symbols
        { pattern: 'in', replacements: ['\\in'] },
        { pattern: 'ni', replacements: ['\\ni'] },
        { pattern: 'subset', replacements: ['\\subset'] },
        { pattern: 'supset', replacements: ['\\supset'] },
        { pattern: 'empty', replacements: ['\\emptyset'] },

        // Miscellaneous symbols
        { pattern: '...', replacements: ['\\ldots'] },
        { pattern: '°', replacements: ['\\degree'] },
        { pattern: '£', replacements: ['\\pounds'] },
        { pattern: '$', replacements: ['\\$'] },
        { pattern: '%', replacements: ['\\%'] },
        { pattern: '&', replacements: ['\\&'] },

        // Accents
        { pattern: 'hat', replacements: ['\\hat{}'] },
        { pattern: 'bar', replacements: ['\\bar{}'] },
        { pattern: 'tilde', replacements: ['\\tilde{}'] },
        { pattern: 'vec', replacements: ['\\vec{}'] },

        // Common functions
        { pattern: 'sin', replacements: ['\\sin'] },
        { pattern: 'cos', replacements: ['\\cos'] },
        { pattern: 'tan', replacements: ['\\tan'] },
        { pattern: 'log', replacements: ['\\log'] },
        { pattern: 'ln', replacements: ['\\ln'] },
        { pattern: 'exp', replacements: ['\\exp'] },

        // Fractions and binomials
        { pattern: 'frac', replacements: ['T:\\frac{$1}{$2}'] },
        { pattern: 'binom', replacements: ['\\binom{}{}'] },

        // Over and under symbols
        { type: 'regex', pattern: '(.*)_over$', replacements: ['\\overline{$1}'] },
        { pattern: 'underline', replacements: ['\\underline{}'] },
        { pattern: 'overset', replacements: ['\\overset{}{}}'] },
        { pattern: 'underset', replacements: ['\\underset{}{}}'] },

        // Logical quantifiers
        { pattern: 'forall', replacements: ['\\forall'] },
        { pattern: 'exists', replacements: ['\\exists'] },
        { pattern: 'nexists', replacements: ['\\nexists'] },

        // Miscellaneous
        { pattern: 'aleph', replacements: ['\\aleph'] },
        { pattern: 'hbar', replacements: ['\\hbar'] },
        { pattern: 'ell', replacements: ['\\ell'] },
        { pattern: 'Re', replacements: ['\\Re'] },
        { pattern: 'Im', replacements: ['\\Im'] },
    ]
};

export class ConfigManager {

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    private async saveConfig(config: Config) {
        await this.plugin.saveData(this.config);
    }

    async loadConfig() {
        this.config = Object.assign({}, DEFAULT_CONFIG, await this.plugin.loadData());
        this.matcher = new SuggestionMatcher(this.config.patterns);
    }

    async updateConfig(newConfig) {
        this.config = newConfig;
        await this.saveConfig(this.config);
        this.matcher = new SuggestionMatcher(this.config.patterns);
    }

    async resetConfig() {
        await this.updateConfig(DEFAULT_CONFIG);
    }


}
