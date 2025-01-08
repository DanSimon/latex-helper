import { Plugin } from "obsidian";

import { SuggestionMatcher } from "./pattern_matcher";
import { EventEmitter } from "./events";
import { UserSettings, DEFAULT_SETTINGS } from "./settings";
import { SuggestionConfig } from "./mathjax_symbols";

export interface Pattern {
    type?: "regex";
    pattern: string;
    replacements: string[];
    fastReplace?: boolean;
    category?: string;
    normalMode?: boolean;
}

export interface MathConfig {
    patterns: Pattern[];
    settings: UserSettings;
    symbolOverrides: Record<string, SuggestionConfig>;
}

const DEFAULT_CONFIG: MathConfig = {
    symbolOverrides: {},
    patterns: [],
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
        this.matcher = new SuggestionMatcher(this.config);
    }

    async updateConfig() {
        await this.saveConfig(this.config);
        this.matcher = new SuggestionMatcher(this.config);
        this.onChange.emit();
    }

    async resetConfig() {
        this.config = DEFAULT_CONFIG;
        await this.updateConfig();
    }
}
