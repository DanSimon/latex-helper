import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { ItemView, MarkdownRenderer } from "obsidian";
import FuzzySearch from "fz-search";
import { LATEX_SYMBOLS, MathJaxSymbol } from "../mathjax_symbols";
import * as LatexUtils from "../latex_utils";
import { ConfigManager } from "../config";
import SymbolConfigPanel from "./SymbolConfigPanel";
import LaTeXDisplay from "./LatexDisplay";

// Group symbols by their first character
const groupSymbols = (symbols: MathJaxSymbol[]) => {
    return symbols.reduce((acc: { [key: string]: MathJaxSymbol[] }, symbol) => {
        const firstChar = symbol.name.replace(/[\\{}]/g, "")[0];
        if (!firstChar) {
            console.log(`no first char for ${symbol.name}`);
        }
        const section = /[a-zA-Z]/.test(firstChar)
            ? firstChar.toLowerCase()
            : "#";
        acc[section] = acc[section] || [];
        acc[section].push(symbol);
        return acc;
    }, {});
};

interface SymbolSectionProps {
    letter: string;
    rendered: boolean;
    symbols: MathJaxSymbol[];
    view: ItemView;
    configManager: ConfigManager;
}

const SymbolSection = React.memo(
    ({
        letter,
        rendered,
        symbols,
        view,
        configManager,
    }: SymbolSectionProps) => {
        return (
            <div id={`section-${letter}`} className="symbol-reference__section">
                <h2 className="symbol-reference__section-title">
                    {letter.toUpperCase()}
                </h2>
                <div>
                    {rendered &&
                        symbols.map((symbol) => (
                            <SymbolCard
                                key={symbol.name}
                                symbol={symbol}
                                view={view}
                                configManager={configManager}
                            />
                        ))}
                </div>
            </div>
        );
    },
);

interface SymbolCardProps {
    symbol: MathJaxSymbol;
    view: ItemView;
    configManager: ConfigManager;
}

const SymbolCard = ({ symbol, view, configManager }: SymbolCardProps) => {
    const fillerColor = getComputedStyle(view.containerEl)
        .getPropertyValue("--text-accent")
        .trim();

    return (
        <div className="symbol-reference__card">
            <div className="symbol-reference__card-header">
                <LaTeXDisplay command={symbol.name} />
                <span
                    className="symbol-reference__preview rendered-math"
                    ref={(el) => {
                        if (el) {
                            el.empty();
                            const renderText =
                                symbol.suggestion_display ?? symbol.name;
                            if (renderText) {
                                MarkdownRenderer.render(
                                    view.app,
                                    `$${LatexUtils.fillLatexBraces(renderText, fillerColor)}$`,
                                    el,
                                    "",
                                    view,
                                );
                            }
                        }
                    }}
                />
                <SymbolConfigPanel
                    symbolName={symbol.name}
                    defaultConfig={symbol.suggestionConfig}
                    configManager={configManager}
                />
            </div>
            <p className="symbol-reference__description">
                {symbol.description}
            </p>
            {symbol.examples.length > 0 && (
                <div className="symbol-reference__examples">
                    <h3>Examples</h3>
                    {symbol.examples.map((example) => (
                        <div
                            className="symbol-reference__example"
                            key={example}
                        >
                            <pre className="symbol-reference__example-code">
                                {example}
                            </pre>
                            <span
                                className="symbol-reference__example-preview rendered-math"
                                ref={(el) => {
                                    if (el) {
                                        el.empty();
                                        MarkdownRenderer.render(
                                            view.app,
                                            `$${example}$`,
                                            el,
                                            "",
                                            view,
                                        );
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const TableOfContents = ({ sections }: { sections: string[] }) => {
    return (
        <div className="symbol-reference__toc">
            {sections.map((section) => (
                <a
                    key={section}
                    href={`#section-${section}`}
                    className="symbol-reference__toc-link"
                >
                    {section === "#" ? "#" : section.toUpperCase()}
                </a>
            ))}
        </div>
    );
};

const Header = ({
    searchTerm,
    onSearchChange,
}: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}) => {
    return (
        <div className="symbol-reference__header">
            <div className="symbol-reference__title-container">
                <span className="symbol-reference__icon">📚</span>
                <h1 className="symbol-reference__title">
                    MathJax Symbol Reference
                </h1>
            </div>
            <div className="symbol-reference__search">
                <input
                    type="text"
                    placeholder="Search symbols..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="symbol-reference__search-input"
                />
            </div>
        </div>
    );
};

const SymbolReferenceView = ({
    configManager,
    view,
}: {
    configManager: ConfigManager;
    view: ItemView;
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [allSymbols] = useState<{ [key: string]: MathJaxSymbol[] }>(
        groupSymbols(LATEX_SYMBOLS),
    );
    const [unrenderedSections, setUnrenderedSections] = useState(
        Object.keys(allSymbols).sort(),
    );
    const fuzzySearch = useRef(
        new FuzzySearch({
            source: LATEX_SYMBOLS,
            keys: ["searchName"],
        }),
    );

    const searchResults = searchTerm
        ? fuzzySearch.current.search(searchTerm)
        : [];
    const sections = Object.keys(allSymbols).sort();

    const popSection = () => {
        if (unrenderedSections.length > 0) {
            setUnrenderedSections((u) => u.filter((v) => v != u[0]));
        }
    };

    useEffect(() => {
        if (searchTerm == "" && unrenderedSections.length > 0) {
            setTimeout(popSection, 50);
        }
    }, [unrenderedSections]);

    return (
        <div className="symbol-reference">
            <Header
                searchTerm={searchTerm}
                onSearchChange={(t) => {
                    setSearchTerm(t);
                    setUnrenderedSections(sections);
                }}
            />
            <div className="symbol-reference__content">
                {searchTerm == "" && <TableOfContents sections={sections} />}
                <div className="symbol-reference__main">
                    {searchTerm && (
                        <div className="symbol-reference__search-results">
                            <SymbolSection
                                rendered={true}
                                key="search-results"
                                letter={searchTerm}
                                symbols={searchResults}
                                view={view}
                                configManager={configManager}
                            />
                        </div>
                    )}
                    {!searchTerm &&
                        sections.map((section) => (
                            <SymbolSection
                                rendered={!unrenderedSections.contains(section)}
                                key={section}
                                letter={section}
                                symbols={allSymbols[section]}
                                view={view}
                                configManager={configManager}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

export default SymbolReferenceView;
