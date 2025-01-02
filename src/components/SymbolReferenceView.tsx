import * as React from "react";
import { useState, useRef } from "react";
import { ItemView, MarkdownRenderer } from "obsidian";
import FuzzySearch from "fz-search";
import { LATEX_SYMBOLS, MathJaxSymbol } from "../mathjax_symbols";
import * as LatexUtils from "../latex_utils";

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

const SymbolSection: React.FC<{
    letter: string;
    symbols: MathJaxSymbol[];
    view: ItemView;
}> = React.memo(
    ({ letter, symbols, view }) => {
        return (
            <div id={`section-${letter}`} style={{ marginBottom: "2rem" }}>
                <h2
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        marginBottom: "1rem",
                    }}
                >
                    {letter.toUpperCase()}
                </h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "1rem",
                    }}
                >
                    {symbols.map((symbol) => (
                        <SymbolCard
                            key={symbol.name}
                            symbol={symbol}
                            view={view}
                        />
                    ))}
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        // Custom comparison for memo
        return prevProps.letter == nextProps.letter;
    },
);

const SymbolCard: React.FC<{
    symbol: MathJaxSymbol;
    view: ItemView;
}> = React.memo(({ symbol, view }) => {
    const fillerColor = getComputedStyle(view.containerEl)
        .getPropertyValue("--text-accent")
        .trim();
    return (
        <div
            key={symbol.name}
            style={{
                padding: "1rem",
                border: "1px solid var(--background-modifier-border)",
                borderRadius: "4px",
            }}
        >
            <div style={{ marginBottom: "0.5rem" }}>
                <span
                    style={{
                        marginLeft: "0.5rem",
                        fontSize: "1.175rem",
                        color: "var(--text-muted)",
                        fontFamily: "monospace",
                    }}
                    dangerouslySetInnerHTML={{
                        __html: LatexUtils.fillLatexHtmlBraces(
                            symbol.name,
                            "var(--text-accent)",
                        ),
                    }}
                />
                <span
                    style={{
                        fontSize: "1.1rem",
                        marginLeft: "0.5rem",
                        padding: "4px",
                        borderLeft: "solid 1px",
                    }}
                    className="rendered-math"
                    ref={(el) => {
                        if (el) {
                            el.empty();
                            MarkdownRenderer.render(
                                view.app,
                                `$${LatexUtils.fillLatexBraces(symbol.name, fillerColor)}$`,
                                el,
                                "",
                                view,
                            );
                        }
                    }}
                />
            </div>
            <p
                style={{
                    fontSize: "0.875rem",
                    color: "var(--text-normal)",
                }}
            >
                {symbol.description}
            </p>
            {symbol.examples.length > 0 && (
                <div>
                    <h3>Examples</h3>
                    {symbol.examples.map((example) => (
                        <div
                            style={{
                                marginLeft: "1.0rem",
                                borderLeft:
                                    "solid 1px var(--background-modifier-border)",
                            }}
                            key={example}
                        >
                            <pre
                                style={{
                                    marginTop: "1.0rem",
                                    marginBottom: "0.3rem",
                                }}
                            >
                                {example}
                            </pre>
                            <span
                                style={{ marginLeft: "0.5rem" }}
                                className="rendered-math"
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
});

const TableOfContents: React.FC<{ sections: string[] }> = ({ sections }) => {
    return (
        <div
            style={{
                position: "sticky",
                top: 0,
                padding: "1rem",
                borderRight: "1px solid var(--background-modifier-border)",
                backgroundColor: "var(--background-primary)",
                height: "100%",
                overflowY: "auto",
            }}
        >
            <nav>
                {sections.map((section) => (
                    <a
                        key={section}
                        href={`#section-${section}`}
                        style={{
                            display: "block",
                            padding: "0.25rem 0",
                            color: "var(--text-normal)",
                            textDecoration: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--text-accent)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-normal)";
                        }}
                    >
                        {section === "#" ? "#" : section.toUpperCase()}
                    </a>
                ))}
            </nav>
        </div>
    );
};

const Header: React.FC<{
    searchTerm: string;
    onSearchChange: (value: string) => void;
}> = ({ searchTerm, onSearchChange }) => {
    return (
        <div
            style={{
                borderBottom: "1px solid var(--background-modifier-border)",
                padding: "1rem",
                backgroundColor: "var(--background-primary)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                }}
            >
                <span style={{ fontSize: "1.2rem" }}>📚</span>
                <h1
                    style={{
                        margin: 0,
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        color: "var(--text-normal)",
                    }}
                >
                    MathJax Symbol Reference
                </h1>
            </div>
            <div style={{ flexGrow: 1 }}>
                <input
                    type="text"
                    placeholder="Search symbols..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "0.5rem",
                        border: "1px solid var(--background-modifier-border)",
                        borderRadius: "4px",
                        backgroundColor: "var(--background-primary)",
                        color: "var(--text-normal)",
                    }}
                />
            </div>
        </div>
    );
};

const SymbolReferenceView: React.FC<{ view: ItemView }> = ({ view }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [allSymbols, _] = useState<{ [key: string]: MathJaxSymbol[] }>(
        groupSymbols(LATEX_SYMBOLS),
    );
    const fuzzySearch = useRef(
        new FuzzySearch({
            source: LATEX_SYMBOLS,
            keys: ["searchName"],
        }),
    );

    const searchResults = (() => {
        if (searchTerm) {
            return fuzzySearch.current.search(searchTerm);
        } else {
            return [];
        }
    })();
    const sections = Object.keys(allSymbols).sort();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
            }}
        >
            <style>
                {`
          .rendered-math p {
            display: inline;
            margin: 0;
            padding: 0;
          }
        `}
            </style>
            <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <div
                style={{
                    display: "flex",
                    flexGrow: 1,
                    height: 0, // Required for proper flexbox scroll
                }}
            >
                {searchTerm == "" && (
                    <TableOfContents
                        sections={Object.keys(allSymbols).sort()}
                    />
                )}
                <div
                    style={{
                        flexGrow: 1,
                        padding: "1rem",
                        overflowY: "auto",
                        height: "100%",
                    }}
                >
                    <div
                        style={{
                            marginTop: "0.5rem",
                            display: searchTerm != "" ? "block" : "none",
                        }}
                    >
                        <SymbolSection
                            key="search-results"
                            letter={searchTerm}
                            symbols={searchResults}
                            view={view}
                        />
                    </div>

                    <div
                        style={{
                            marginTop: "0.5rem",
                            display: searchTerm == "" ? "block" : "none",
                        }}
                    >
                        {sections.map((section) => (
                            <SymbolSection
                                key={section}
                                letter={section}
                                symbols={allSymbols[section]}
                                view={view}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SymbolReferenceView;
