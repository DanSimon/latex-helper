import { Component } from "obsidian";
import { ConfigManager, MathConfig, Pattern } from "./config";
import React from "react";
import ReactDOM from "react-dom";
import CategorySelector from "./CategorySelector";

export class MatchForm extends Component {
    private configManager: ConfigManager;
    private config: MathConfig;
    private matchData: Pattern | null;
    private element: HTMLDivElement;
    private selectedCategory: string;

    constructor(configManager: ConfigManager) {
        super();
        this.configManager = configManager;
    }

    onload() {
        this.element = this.createElement();
    }

    private createElement(): HTMLDivElement {
        const form = document.createElement("div");
        form.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--background-primary);
            border: 1px solid var(--background-modifier-border);
            border-radius: 4px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10003;
            max-width: 80%;
            max-height: 80%;
            overflow-y: auto;
            display: none;
        `;

        document.body.appendChild(form);

        return form;
    }

    private updateContent() {
        const regexHtml = `
          <div class="regex-section" style="margin-top: 15px; margin-bottom: 15px;">
              <label style="display: flex; align-items: center; gap: 8px;">
                  <input type="checkbox" id="regexPattern" ${this.matchData?.type === "regex" ? "checked" : ""}>
                  <span>Regex Pattern</span>
              </label>
              <div style="font-size: 0.8em; color: #666; margin-top: 4px;">
                  Treat pattern as a regular expression
              </div>
          </div>
        `;
        // Create fast replace toggle section
        const fastReplaceHtml = `
            <div class="fast-replace-section" style="margin-top: 15px; margin-bottom: 15px;">
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="fastReplace" ${this.matchData?.fastReplace ? "checked" : ""}>
                    <span style="display: flex; align-items: center;">
                        Fast Replace
                        <span style="color: #22c55e; margin-left: 4px;">⚡</span>
                    </span>
                </label>
                <div style="font-size: 0.8em; color: #666; margin-top: 4px;">
                    Enables quick replacement with any non-alphanumeric character
                </div>
            </div>
        `;
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete this Pattern";
        deleteButton.id = "deletePattern";
        deleteButton.style.cssText = `
            border: solid 1px var(--background-modifier-error);
            color: var(--text-on-accent);
        `;
        const allCategories = Array.from(
            new Set(
                this.configManager.config.patterns
                    .map((p) => p.category)
                    .filter((c) => c), // Remove undefined/null
            ),
        ).sort();

        const categorySection = `
            <div class="category-section" style="margin-top: 15px; margin-bottom: 15px;">
                <label>Category:</label>
                <div id="category-selector"></div>
            </div>
        `;

        this.element.innerHTML = `
            <h2>${this.matchData ? "Edit Pattern" : "Create New Pattern"}</h2>
            <label for="pattern">Pattern (regex):</label>
            <input type="text" id="pattern" value="${this.matchData ? this.matchData.pattern : ""}"><br><br>
            ${categorySection}
            ${this.matchData ? deleteButton.outerHTML : ""}
            ${regexHtml}
            ${fastReplaceHtml}
            <div id="replacements"></div>
            <button id="addReplacement">Add Replacement</button><br><br>
            <button id="saveMatch">Save</button>
            <button id="cancelMatch">Cancel</button>
            `;

        const categorySelector = document.querySelector("#category-selector");
        if (categorySelector) {
            ReactDOM.render(
                React.createElement(CategorySelector, {
                    allCategories,
                    selectedCategory: this.matchData?.category || "",
                    onSelect: (category: string) => {
                        console.log(`selecting ${category}`);
                        this.selectedCategory = category;
                    },
                }),
                categorySelector,
            );
        }

        if (this.matchData) {
            this.matchData.replacements.forEach((replacement) => {
                // Check if the replacement is a template
                const isTemplate = replacement.startsWith("T:");
                const actualReplacement = isTemplate
                    ? replacement.slice(2)
                    : replacement;
                this.addReplacementField(actualReplacement, isTemplate);
            });
        } else {
            this.addReplacementField();
        }
        this.attachEventListeners();
    }

    private attachEventListeners(): void {
        const addReplacementButton =
            this.element.querySelector("#addReplacement");
        const saveMatchButton = this.element.querySelector("#saveMatch");
        const cancelMatchButton = this.element.querySelector("#cancelMatch");
        const deleteButton = this.element.querySelector("#deletePattern");

        if (addReplacementButton && saveMatchButton && cancelMatchButton) {
            addReplacementButton.addEventListener("click", () => {
                this.addReplacementField();
                this.updateFastReplaceState();
            });
            saveMatchButton.addEventListener("click", () => this.saveMatch());
            cancelMatchButton.addEventListener("click", () => this.hide());
        }
        if (deleteButton) {
            deleteButton.addEventListener("click", () => {
                if (confirm("Are you sure you want to delete this pattern?")) {
                    this.deleteCurrentPattern();
                    this.hide();
                }
            });
        }
    }

    private updateFastReplaceState(): void {
        const fastReplaceCheckbox = this.element.querySelector(
            "#fastReplace",
        ) as HTMLInputElement;
        const replacements = this.element.querySelectorAll(
            "#replacements fieldset",
        );

        if (fastReplaceCheckbox) {
            // Disable fast replace if there's more than one replacement
            if (replacements.length > 1) {
                fastReplaceCheckbox.checked = false;
                fastReplaceCheckbox.disabled = true;
                fastReplaceCheckbox.title =
                    "Fast replace is only available for patterns with a single replacement";
            } else {
                fastReplaceCheckbox.disabled = false;
                fastReplaceCheckbox.title = "";
            }
        }
    }

    private addReplacementField(
        replacement: string = "",
        isTemplate: boolean = false,
    ): void {
        const replacementsDiv = this.element.querySelector("#replacements");
        if (!replacementsDiv) return;

        const fieldSet = document.createElement("fieldset");
        fieldSet.style.cssText = `
            margin-bottom: 10px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        `;

        fieldSet.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="flex-grow: 1;">
                    <label for="replacement">Replacement:</label>
                    <input type="text" class="replacement" value="${replacement}" style="width: 100%;">
                </div>
                <div>
                    <label style="display: flex; align-items: center; gap: 4px;">
                        <input type="checkbox" class="template-checkbox" ${isTemplate ? "checked" : ""}>
                        Template
                    </label>
                </div>
                <button class="removeReplacement" style="margin-left: auto;">Remove</button>
            </div>
        `;

        const removeButton = fieldSet.querySelector(".removeReplacement");
        if (removeButton) {
            removeButton.addEventListener("click", () => {
                fieldSet.remove();
                this.updateFastReplaceState();
            });
        }
        replacementsDiv.appendChild(fieldSet);
    }

    private deleteCurrentPattern(): void {
        if (!this.matchData) return;

        const patternIndex = this.configManager.config.patterns.findIndex(
            (p) =>
                this.matchData ? p.pattern === this.matchData.pattern : false,
        );

        if (patternIndex !== -1) {
            this.configManager.config.patterns.splice(patternIndex, 1);
            this.configManager.updateConfig();
        }
    }

    private saveMatch(): void {
        const patternInput = this.element.querySelector(
            "#pattern",
        ) as HTMLInputElement;
        const fastReplaceCheckbox = this.element.querySelector(
            "#fastReplace",
        ) as HTMLInputElement;
        const regexCheckbox = this.element.querySelector(
            "#regexPattern",
        ) as HTMLInputElement;
        const replacementFieldsets = this.element.querySelectorAll(
            "#replacements fieldset",
        );

        if (!patternInput) return;

        const pattern = patternInput.value;
        const replacements = Array.from(replacementFieldsets).map(
            (fieldset) => {
                const replacementInput = fieldset.querySelector(
                    ".replacement",
                ) as HTMLInputElement;
                const templateCheckbox = fieldset.querySelector(
                    ".template-checkbox",
                ) as HTMLInputElement;
                const replacementValue = replacementInput?.value || "";
                const isTemplate = templateCheckbox?.checked || false;
                return isTemplate ? `T:${replacementValue}` : replacementValue;
            },
        );
        const fastReplace = fastReplaceCheckbox?.checked || false;
        const isRegex = regexCheckbox?.checked || false;

        if (this.matchData) {
            // Remove old pattern
            const oldPatternIndex =
                this.configManager.config.patterns.findIndex(
                    (p) => p.pattern === this.matchData.pattern,
                );
            if (oldPatternIndex !== -1) {
                this.configManager.config.patterns.splice(oldPatternIndex, 1);
            }
        }

        // Add new pattern
        this.configManager.config.patterns.push({
            pattern,
            replacements,
            fastReplace,
            ...(isRegex && { type: "regex" }),
            ...(this.selectedCategory && { category: this.selectedCategory }),
        });

        // Save config
        this.configManager.updateConfig();

        this.hide();
    }

    public show(matchData: Pattern | null = null): void {
        this.matchData = matchData;
        this.updateContent();
        this.element.style.display = "block";
    }

    public hide(): void {
        this.element.style.display = "none";
        this.element.innerHTML = "";
    }
}
