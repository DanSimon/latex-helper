import { App, PluginSettingTab, Setting } from "obsidian";
import WordPopupPlugin from "./main";

export interface UserSettings {
    includeFuzzySuggestions: boolean;
    autoShowSuggestions: boolean;
    triggerKey: string;
}

export const DEFAULT_SETTINGS: UserSettings = {
    includeFuzzySuggestions: true,
    autoShowSuggestions: true,
    triggerKey: "Ctrl+Space",
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
