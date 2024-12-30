import { App, PluginSettingTab, Setting } from "obsidian";
import WordPopupPlugin from "./main";

export interface UserSettings {
    includeFuzzySuggestions: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
    includeFuzzySuggestions: true,
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
    }
}
