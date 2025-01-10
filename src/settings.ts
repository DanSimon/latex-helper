import { App, PluginSettingTab, Setting } from "obsidian";
import WordPopupPlugin from "./main";

export interface UserSettings {
    includeFuzzySuggestions: boolean;
    autoShowSuggestions: boolean;
    triggerKey: string;
    enableFastReplace: boolean;
    instantFastReplace: boolean;
    enableNormalMode: boolean;
    minAlphaSuggestChars: number;
    minSymbolSuggestChars: number;
    enableSmartTab: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
    includeFuzzySuggestions: true,
    autoShowSuggestions: true,
    triggerKey: "Ctrl+Space",
    enableFastReplace: true,
    instantFastReplace: true,
    enableNormalMode: false,
    minAlphaSuggestChars: 2,
    minSymbolSuggestChars: 1,
    enableSmartTab: true,
};

export class WordPopupSettingTab extends PluginSettingTab {
    plugin: WordPopupPlugin;

    constructor(app: App, plugin: WordPopupPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl("h2", { text: "LaTeX Word Popup Settings" });

        // Fast Replace Settings
        containerEl.createEl("h3", { text: "Fast Replace Settings" });
        new Setting(containerEl)
            .setName("Enable Fast Replace Shortcuts")
            .setDesc(
                "Shortcuts marked as Fast Replace are bumped to the top of suggestions and are auto-applied when any key besides Esc is typed.",
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(
                        this.plugin.configManager.config.settings
                            .enableFastReplace,
                    )
                    .onChange(async (value) => {
                        this.plugin.configManager.config.settings.enableFastReplace =
                            value;
                        await this.plugin.configManager.updateConfig();
                    }),
            );
        new Setting(containerEl)
            .setName("Instant Fast Replace")
            .setDesc(
                "Fast-replace shortcuts are immediately applied without showing the suggestion popup",
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(
                        this.plugin.configManager.config.settings
                            .instantFastReplace,
                    )
                    .onChange(async (value) => {
                        this.plugin.configManager.config.settings.instantFastReplace =
                            value;
                        await this.plugin.configManager.updateConfig();
                    }),
            );

        // Suggestion Behavior
        containerEl.createEl("h3", { text: "Suggestion Behavior" });
        new Setting(containerEl)
            .setName("Include Fuzzy Search Results")
            .setDesc(
                "Include fuzzy search suggestions when no exact matches are found",
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(
                        this.plugin.configManager.config.settings
                            .includeFuzzySuggestions,
                    )
                    .onChange(async (value) => {
                        this.plugin.configManager.config.settings.includeFuzzySuggestions =
                            value;
                        await this.plugin.configManager.updateConfig();
                    }),
            );

        new Setting(containerEl)
            .setName("Auto-show Suggestions")
            .setDesc(
                "Automatically show suggestions while typing. If disabled, suggestions will only appear when using the trigger key.",
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(
                        this.plugin.configManager.config.settings
                            .autoShowSuggestions,
                    )
                    .onChange(async (value) => {
                        this.plugin.configManager.config.settings.autoShowSuggestions =
                            value;
                        await this.plugin.configManager.updateConfig();
                    }),
            );

        new Setting(containerEl)
            .setName("Minimum characters for suggestions")
            .setDesc(
                "The minimum number of characters to type before showing auto-complete suggestions",
            )
            .addDropdown((dropdown) =>
                dropdown
                    .addOptions(
                        Object.fromEntries(
                            Array.from({ length: 10 }, (_, i) => [
                                i + 1,
                                (i + 1).toString(),
                            ]),
                        ),
                    )
                    .setValue(
                        this.plugin.configManager.config.settings.minAlphaSuggestChars.toString(),
                    )
                    .onChange(async (value) => {
                        this.plugin.configManager.config.settings.minAlphaSuggestChars =
                            parseInt(value);
                        await this.plugin.configManager.updateConfig();
                    }),
            );

        // Navigation and Input Mode
        containerEl.createEl("h3", { text: "Navigation and Input Mode" });
        new Setting(containerEl)
            .setName("Trigger Key")
            .setDesc(
                'Hotkey to trigger suggestions (e.g., "Ctrl+Space", "Cmd+E")',
            )
            .addText((text) =>
                text
                    .setPlaceholder("Ctrl+Space")
                    .setValue(
                        this.plugin.configManager.config.settings.triggerKey,
                    )
                    .onChange(async (value) => {
                        // Normalize the key format
                        const normalizedKey = this.normalizeKeyString(value);
                        this.plugin.configManager.config.settings.triggerKey =
                            normalizedKey;
                        text.setValue(normalizedKey);
                        await this.plugin.configManager.updateConfig();
                    }),
            );

        new Setting(containerEl)
            .setName("Enable Shortcuts in Normal Mode")
            .setDesc(
                "Enable shortcuts while typing in normal mode (not inside '$' or '$$' tags). Applied shortcuts will automatically be wrapped in '$' tags",
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(
                        this.plugin.configManager.config.settings
                            .enableNormalMode,
                    )
                    .onChange(async (value) => {
                        this.plugin.configManager.config.settings.enableNormalMode =
                            value;
                        await this.plugin.configManager.updateConfig();
                    }),
            );

        new Setting(containerEl)
            .setName("Enable Smart Tab")
            .setDesc(
                "Hitting [Tab] while in LaTeX command braces will jump to the next set of braces or the end of the command",
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(
                        this.plugin.configManager.config.settings
                            .enableSmartTab,
                    )
                    .onChange(async (value) => {
                        this.plugin.configManager.config.settings.enableSmartTab =
                            value;
                        await this.plugin.configManager.updateConfig();
                    }),
            );
    }

    private normalizeKeyString(key: string): string {
        // Split the key combination into parts
        const parts = key
            .toLowerCase()
            .split("+")
            .map((part) => part.trim());

        // Normalize modifier keys
        const modifiers = parts.slice(0, -1).map((mod) => {
            switch (mod) {
                case "ctrl":
                case "control":
                    return "Ctrl";
                case "cmd":
                case "command":
                    return "Cmd";
                case "alt":
                case "option":
                    return "Alt";
                case "shift":
                    return "Shift";
                default:
                    return mod;
            }
        });

        // Capitalize the actual key
        const mainKey = parts[parts.length - 1];
        const normalizedKey = (() => {
            if (mainKey.toUpperCase() == "SPACE") {
                return " ";
            }
            return mainKey.length === 1 ? mainKey.toUpperCase() : mainKey;
        })();

        // Combine all parts
        return [...modifiers, normalizedKey].join("+");
    }
}
