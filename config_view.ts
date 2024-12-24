import {
    ItemView,
    WorkspaceLeaf,
    Plugin,
    MarkdownRenderer
} from 'obsidian';

import { ConfigManager, Pattern } from './config';
import { MatchForm } from "./match_form";

export const CONFIG_VIEW_TYPE = 'config-reference-view';

export class ConfigView extends ItemView {
    private configManager: ConfigManager;
    private refreshView: () => void;
    private matchForm: MatchForm;

    constructor(leaf: WorkspaceLeaf, configManager: ConfigManager, matchForm: MatchForm) {
        super(leaf);
        this.configManager = configManager;
        this.matchForm = matchForm;
        this.refreshView = () => {
            this.onOpen();
        };
    }

    getViewType(): string {
        return CONFIG_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'LaTeX Shortcuts Reference';
    }

    async onload() {
        super.onload();
        // Subscribe to config changes
        this.configManager.onChange.subscribe(this.refreshView);
    }

    async onunload() {
        // Clean up subscription
        this.configManager.onChange.unsubscribe(this.refreshView);
        super.onunload();
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();

        // Create header with close button
        const headerContainer = container.createEl('div', { cls: 'config-view-header' });
        headerContainer.style.display = 'flex';
        headerContainer.style.justifyContent = 'space-between';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.marginBottom = '20px';

        headerContainer.createEl('h2', { text: 'LaTeX Shortcuts Reference' });


        const newPatternButton = headerContainer.createEl('button');
        newPatternButton.style.cssText = `
            border: 1px solid var(--background-modifier-success);
        `;
        newPatternButton.setText('New Pattern');
        newPatternButton.addEventListener('click', () => {
            this.matchForm.show();
        });

        const closeButton = headerContainer.createEl('button', { cls: 'config-view-close' });
        closeButton.style.cssText = `
            padding: 4px 8px;
            cursor: pointer;
            border-radius: 4px;
            border: 1px solid var(--background-modifier-border);
            background: var(--background-primary);
        `;
        closeButton.setText('✕');
        closeButton.addEventListener('click', () => {
            this.app.workspace.detachLeavesOfType(CONFIG_VIEW_TYPE);
        });

        // Create search input
        const searchContainer = container.createEl('div', { cls: 'search-container' });
        searchContainer.style.margin = '10px 0';
        const searchInput = searchContainer.createEl('input', {
            type: 'text',
            placeholder: 'Search patterns...'
        });
        searchInput.style.width = '100%';
        searchInput.style.padding = '5px';

        // Create patterns container
        const patternsContainer = container.createEl('div', { cls: 'patterns-container' });
        const styleElement = container.createEl('style');

        // Define the CSS rule
        const cssRule = `
          .rendered-math p {
            display: inline;
            margin: 0;
            padding: 0;
          }
        `;

        // Add the CSS rule to the style element
        styleElement.textContent = cssRule;

        // Group patterns by category
        const categories = this.groupPatternsByCategory(this.configManager.config.patterns);

        // Function to render patterns
        const renderPatterns = (searchTerm: string = '') => {
            patternsContainer.empty();

            for (const [category, patterns] of Object.entries(categories)) {
                // Filter patterns based on search term
                const filteredPatterns = patterns.filter(pattern =>
                    pattern.pattern.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    pattern.replacements.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
                );

                if (filteredPatterns.length === 0) continue;

                const categoryEl = patternsContainer.createEl('div', { cls: 'category' });
                categoryEl.style.marginBottom = '20px';

                categoryEl.createEl('h3', { text: category });

                const table = categoryEl.createEl('table');
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';

                // Create header
                const thead = table.createEl('thead');
                const headerRow = thead.createEl('tr');
                ['Pattern', 'Preview', 'LaTeX'].forEach(header => {
                    const th = headerRow.createEl('th');
                    th.style.textAlign = 'left';
                    th.style.padding = '8px';
                    th.style.borderBottom = '1px solid var(--background-modifier-border)';
                    th.setText(header);
                });

                // Create rows
                const tbody = table.createEl('tbody');
                filteredPatterns.forEach(pattern => {
                    pattern.replacements.forEach((replacement, idx) => {
                        const row = tbody.createEl('tr');

                        // Pattern cell (only for first replacement)
                        const patternCell = row.createEl('td');
                        //patternCell.style.padding = '8px';
                        patternCell.style.verticalAlign = 'middle';
                        if (idx === 0) {
                            if (pattern.fastReplace) {
                                const icon = patternCell.createEl('span');
                                icon.style.cssText = `
                                    color: #22c55e;
                                    margin-right: 2px;
                                    font-size: 0.8em;
                                `;
                                icon.setAttribute('title', 'Fast Replace Enabled');
                                icon.setText('⚡');
                            }
                            if (pattern.type && pattern.type == 'regex') {
                                const icon = patternCell.createEl('span');
                                icon.style.cssText = `
                                    color: #22c55e;
                                    margin-right: 2px;
                                    font-size: 0.8em;
                                `;
                                icon.setAttribute('title', 'Regex Pattern');
                                icon.setText('R');

                            }
                            patternCell.createEl('code', { text: pattern.pattern });
                            const editButton = patternCell.createEl('button');
                            editButton.style.cssText = `
                                visibility: hidden;
                                border: none;
                                background: none;
                                cursor: pointer;
                                padding: 2px 6px;
                                margin-left: 8px;
                                color: var(--text-muted);
                                transition: color 0.2s ease;
                            `;
                            editButton.innerHTML = '✏️';
                            editButton.title = 'Edit pattern';
                            row.addEventListener('mouseenter', () => {
                                editButton.style.visibility = 'visible';
                            });

                            row.addEventListener('mouseleave', () => {
                                editButton.style.visibility = 'hidden';
                            });

                            // Add click handler
                            editButton.addEventListener('click', (e: MouseEvent) => {
                                e.stopPropagation(); // Prevent event bubbling
                                // Assuming matchForm is passed to ConfigView constructor
                                this.matchForm.show(pattern);
                            });
                        }
                        patternCell.style.borderBottom = idx === pattern.replacements.length - 1 ?
                            '2px solid var(--background-modifier-border-focus)' :
                            '1px solid var(--background-modifier-border)';

                        // Preview cell
                        const previewCell = row.createEl('td', {cls : 'rendered-math'});
                        //previewCell.style.padding = '8px';
                        previewCell.style.verticalAlign = 'middle';
                        previewCell.style.borderBottom = patternCell.style.borderBottom;

                        // Remove template prefix if present
                        const cleanReplacement = replacement.startsWith('T:') ?
                            replacement.slice(2) : replacement;

                        // Render the LaTeX
                        MarkdownRenderer.renderMarkdown(
                            `$${cleanReplacement}$`,
                            previewCell,
                            this.leaf.view.file?.path || '',
                            this
                        );

                        // LaTeX code cell
                        const latexCell = row.createEl('td');
                        //latexCell.style.padding = '8px';
                        latexCell.style.verticalAlign = 'middle';
                        latexCell.style.borderBottom = patternCell.style.borderBottom;
                        latexCell.createEl('code', { text: replacement });
                    });
                });
            }
        };

        // Add search handler
        searchInput.addEventListener('input', (e) => {
            const searchTerm = (e.target as HTMLInputElement).value;
            renderPatterns(searchTerm);
        });

        // Initial render
        renderPatterns();
    }

    private groupPatternsByCategory(patterns: Pattern[]): Record<string, Pattern[]> {
        const categories: Record<string, Pattern[]> = {};

        // First group all patterns by their categories
        patterns.forEach(pattern => {
            const category = pattern.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(pattern);
        });

        // Sort categories alphabetically, but keep 'Uncategorized' at the end
        const sortedCategories: Record<string, Pattern[]> = {};
        Object.keys(categories)
        .sort((a, b) => {
            if (a === 'Uncategorized') return 1;
            if (b === 'Uncategorized') return -1;
            return a.localeCompare(b);
        })
        .forEach(category => {
            sortedCategories[category] = categories[category];
        });

        return sortedCategories;
    }
}
