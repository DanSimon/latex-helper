import { Plugin } from "obsidian";

import { SuggestionMatcher } from "./pattern_matcher";
import { EventEmitter } from "./events";
import { UserSettings, DEFAULT_SETTINGS } from "./settings";

export interface Pattern {
    type?: "regex";
    pattern: string;
    replacements: string[];
    fastReplace?: boolean;
    category?: string;
}

export interface MathConfig {
    renderMath: boolean;
    patterns: Pattern[];
    settings: UserSettings;
}

const DEFAULT_CONFIG: MathConfig = {
    renderMath: false,
    patterns: [
        // Logical operators
        { pattern: "or", replacements: ["\\lor"], fastReplace: true },
        { pattern: "and", replacements: ["\\land"], fastReplace: true },
        { pattern: "not", replacements: ["\\lnot"], fastReplace: true },
        { pattern: "=>", replacements: ["\\implies"], fastReplace: true },
        { pattern: "<=>", replacements: ["\\iff"], fastReplace: true },

        // Greek letters
        { pattern: "a", replacements: ["\\alpha", "\\aleph"] },
        { pattern: "b", replacements: ["\\beta", "\\beth"] },
        { pattern: "g", replacements: ["\\gamma", "\\gimel"] },
        { pattern: "d", replacements: ["\\delta", "\\daleth"] },
        { pattern: "e", replacements: ["\\epsilon", "\\varepsilon"] },
        { pattern: "z", replacements: ["\\zeta"] },
        { pattern: "h", replacements: ["\\eta"] },
        { pattern: "t", replacements: ["\\theta", "\\vartheta"] },
        { pattern: "i", replacements: ["\\iota"] },
        { pattern: "k", replacements: ["\\kappa"] },
        { pattern: "l", replacements: ["\\lambda"] },
        { pattern: "m", replacements: ["\\mu"] },
        { pattern: "n", replacements: ["\\nu"] },
        { pattern: "x", replacements: ["\\xi"] },
        { pattern: "o", replacements: ["\\omicron"] },
        { pattern: "p", replacements: ["\\pi", "\\varpi"] },
        { pattern: "r", replacements: ["\\rho", "\\varrho"] },
        { pattern: "s", replacements: ["\\sigma", "\\varsigma"] },
        { pattern: "u", replacements: ["\\upsilon"] },
        { pattern: "f", replacements: ["\\phi", "\\varphi"] },
        { pattern: "c", replacements: ["\\chi"] },
        { pattern: "y", replacements: ["\\psi"] },
        { pattern: "w", replacements: ["\\omega"] },

        // Uppercase Greek letters
        { pattern: "E", replacements: ["\\exists"] },
        { pattern: "G", replacements: ["\\Gamma"] },
        { pattern: "D", replacements: ["\\Delta"] },
        { pattern: "T", replacements: ["\\Theta"] },
        { pattern: "I", replacements: ["\\Iota"] },
        { pattern: "L", replacements: ["\\Lambda"] },
        { pattern: "X", replacements: ["\\Xi"] },
        { pattern: "P", replacements: ["\\Pi"] },
        { pattern: "S", replacements: ["\\Sigma"] },
        { pattern: "U", replacements: ["\\Upsilon"] },
        { pattern: "F", replacements: ["\\Phi", "\\forall"] },
        { pattern: "Y", replacements: ["\\Psi"] },
        { pattern: "W", replacements: ["\\Omega"] },

        // Parentheses and brackets
        {
            pattern: "(",
            replacements: ["\\big(", "\\Big(", "\\bigg(", "\\Bigg("],
        },
        {
            pattern: ")",
            replacements: ["\\big)", "\\Big)", "\\bigg)", "\\Bigg)"],
        },
        {
            pattern: "[",
            replacements: [
                "\\big[",
                "\\Big[",
                "\\bigg[",
                "\\Bigg[",
                "\\lceil",
                "\\lfloor",
                "\\ulcorner",
                "\\llcorner",
            ],
        },
        {
            pattern: "]",
            replacements: [
                "\\big]",
                "\\Big]",
                "\\bigg]",
                "\\Bigg]",
                "\\rceil",
                "\\rfloor",
                "\\urcorner",
                "\\lrcorner",
            ],
        },

        // Arrows
        { pattern: "->", replacements: ["\\rightarrow", "\\to"] },
        { pattern: "<-", replacements: ["\\leftarrow"] },
        { pattern: "<->", replacements: ["\\leftrightarrow"] },
        { pattern: "=>", replacements: ["\\implies"] },
        { pattern: "<=", replacements: ["\\leq"] },
        { pattern: ">=", replacements: ["\\geq"] },

        // Mathematical operators
        { pattern: "+", replacements: ["+"] },
        { pattern: "-", replacements: ["-"] },
        //{ pattern: '*', replacements: ['\\times', '\\ast'] },
        { pattern: "/", replacements: ["\\div"] },
        { pattern: "sum", replacements: ["\\sum"] },
        { pattern: "int", replacements: ["\\int"] },
        { pattern: "lim", replacements: ["\\lim"] },
        { pattern: "inf", replacements: ["\\infty"] },
        { pattern: "sqrt", replacements: ["\\sqrt"] },
        { pattern: "prod", replacements: ["\\prod"] },

        // Relational operators
        { pattern: "=", replacements: ["="] },
        { pattern: "!=", replacements: ["\\neq"] },
        { pattern: "~=", replacements: ["\\approx"] },
        { pattern: "~~", replacements: ["\\sim"] },
        { pattern: "<<", replacements: ["\\ll"] },
        { pattern: ">>", replacements: ["\\gg"] },

        // Set symbols
        { pattern: "in", replacements: ["\\in"], fastReplace: true },
        { pattern: "ni", replacements: ["\\ni"], fastReplace: true },
        { pattern: "subset", replacements: ["\\subset", "\\subseteq"] },
        { pattern: "supset", replacements: ["\\supset", "\\supseteq"] },
        { pattern: "empty", replacements: ["\\emptyset"], fastReplace: true },

        // Miscellaneous symbols
        { pattern: "...", replacements: ["\\ldots"] },
        { pattern: "°", replacements: ["\\degree"] },
        { pattern: "£", replacements: ["\\pounds"] },
        { pattern: "$", replacements: ["\\$"] },
        { pattern: "%", replacements: ["\\%"] },
        { pattern: "&", replacements: ["\\&"] },

        // Accents
        { pattern: "hat", replacements: ["\\hat{}"] },
        { pattern: "bar", replacements: ["\\bar{}"] },
        { pattern: "tilde", replacements: ["\\tilde{}"] },
        { pattern: "vec", replacements: ["\\vec{}"] },

        // Common functions
        { pattern: "sin", replacements: ["\\sin"], fastReplace: true },
        { pattern: "cos", replacements: ["\\cos"], fastReplace: true },
        { pattern: "tan", replacements: ["\\tan"], fastReplace: true },
        { pattern: "log", replacements: ["\\log"], fastReplace: true },
        { pattern: "ln", replacements: ["\\ln"], fastReplace: true },
        { pattern: "exp", replacements: ["\\exp"], fastReplace: true },

        // Fractions and binomials
        { pattern: "frac", replacements: ["T:\\frac{$1}{$2}"] },
        { pattern: "binom", replacements: ["\\binom{}{}"] },

        // Over and under symbols
        {
            type: "regex",
            pattern: "(.*)_over$",
            replacements: ["\\overline{$1}"],
        },
        { pattern: "underline", replacements: ["\\underline{}"] },
        { pattern: "overset", replacements: ["\\overset{}{}}"] },
        { pattern: "underset", replacements: ["\\underset{}{}}"] },

        // Logical quantifiers
        { pattern: "forall", replacements: ["\\forall"], fastReplace: true },
        { pattern: "exists", replacements: ["\\exists"], fastReplace: true },
        { pattern: "nexists", replacements: ["\\nexists"], fastReplace: true },

        // Miscellaneous
        { pattern: "aleph", replacements: ["\\aleph"] },
        { pattern: "hbar", replacements: ["\\hbar"] },
        { pattern: "ell", replacements: ["\\ell"] },
        { pattern: "Re", replacements: ["\\Re"] },
        { pattern: "Im", replacements: ["\\Im"] },
    ],
    settings: DEFAULT_SETTINGS,
};

export class ConfigManager {
    public onChange: EventEmitter;
    private plugin: Plugin;
    public matcher: SuggestionMatcher;
    public config: MathConfig;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.onChange = new EventEmitter();
    }

    private async saveConfig(config: MathConfig) {
        await this.plugin.saveData(config);
    }

    async loadConfig() {
        this.config = Object.assign(
            {},
            DEFAULT_CONFIG,
            await this.plugin.loadData(),
        );
        this.matcher = new SuggestionMatcher(this.config.patterns);
    }

    async updateConfig() {
        await this.saveConfig(this.config);
        this.matcher = new SuggestionMatcher(this.config.patterns);
        this.onChange.emit();
    }

    async resetConfig() {
        this.config = DEFAULT_CONFIG;
        await this.updateConfig();
    }
}
