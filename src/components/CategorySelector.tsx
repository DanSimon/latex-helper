import * as React from "react";
import { useState, useEffect, useRef } from "react";

const styles = {
    wrapper: {
        position: "relative",
        width: "100%",
    },
    input: {
        width: "100%",
        padding: "8px",
        border: "1px solid var(--background-modifier-border)",
        borderRadius: "4px",
        backgroundColor: "var(--background-primary)",
        color: "var(--text-normal)",
    },
    dropdown: {
        position: "absolute",
        width: "100%",
        marginTop: "4px",
        border: "1px solid var(--background-modifier-border)",
        borderRadius: "4px",
        backgroundColor: "var(--background-primary)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        maxHeight: "200px",
        overflowY: "auto",
        zIndex: 50,
    },
    option: {
        padding: "8px",
        cursor: "pointer",
    },
    newOption: {
        padding: "8px",
        cursor: "pointer",
        color: "var(--text-accent)",
    },
};

interface CategorySelectorProps {
    allCategories: string[];
    selectedCategory: string;
    onSelect: (category: string) => void;
}

const CategorySelector = ({
    allCategories,
    selectedCategory,
    onSelect,
}: CategorySelectorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(selectedCategory || "");
    const [filteredCategories, setFilteredCategories] = useState(allCategories);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                event.targetNode !== null &&
                !wrapperRef.current.contains(event.targetNode)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const filtered = allCategories.filter((category) =>
            category.toLowerCase().includes(inputValue.toLowerCase()),
        );
        setFilteredCategories(filtered);
    }, [inputValue, allCategories]);

    useEffect(() => {
        setInputValue(selectedCategory);
    }, [selectedCategory]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        onSelect(e.target.value);
        setIsOpen(true);
    };

    const handleSelect = (category: string) => {
        setInputValue(category);
        onSelect(category);
        setIsOpen(false);
    };

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
            }}
            ref={wrapperRef}
        >
            <input
                type="text"
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                onBlur={() => {
                    if (
                        inputRef.current &&
                        inputValue &&
                        !allCategories.contains(inputValue)
                    ) {
                        inputRef.current.value = inputValue + " [New Category]";
                    }
                }}
                placeholder="Select or type a category"
                style={styles.input}
            />
            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        width: "100%",
                        marginTop: "4px",
                        border: "1px solid var(--background-modifier-border)",
                        borderRadius: "4px",
                        backgroundColor: "var(--background-primary)",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 50,
                    }}
                >
                    {filteredCategories.map((category, index) => (
                        <div
                            key={index}
                            style={styles.option}
                            onMouseEnter={(
                                e: React.MouseEvent<HTMLDivElement>,
                            ) =>
                                (e.currentTarget.style.backgroundColor =
                                    "var(--background-secondary)")
                            }
                            onMouseLeave={(
                                e: React.MouseEvent<HTMLDivElement>,
                            ) =>
                                (e.currentTarget.style.backgroundColor =
                                    "var(--background-primary)")
                            }
                            onClick={() => handleSelect(category)}
                        >
                            {category}
                        </div>
                    ))}
                    {inputValue && !filteredCategories.includes(inputValue) && (
                        <div
                            style={styles.newOption}
                            onMouseEnter={(
                                e: React.MouseEvent<HTMLDivElement>,
                            ) =>
                                (e.currentTarget.style.backgroundColor =
                                    "var(--background-secondary)")
                            }
                            onMouseLeave={(
                                e: React.MouseEvent<HTMLDivElement>,
                            ) =>
                                (e.currentTarget.style.backgroundColor =
                                    "var(--background-primary)")
                            }
                            onClick={() => handleSelect(inputValue)}
                        >
                            Create new category: {inputValue}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategorySelector;
