import * as React from "react";
import { useState, useEffect, useRef } from "react";

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
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                event.target instanceof Node &&
                !wrapperRef.current.contains(event.target)
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
        <div className="category-selector" ref={wrapperRef}>
            <input
                type="text"
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                    if (
                        dropdownRef.current &&
                        !dropdownRef.current.contains(event.relatedTarget)
                    ) {
                        setIsOpen(false);
                    }
                }}
                placeholder="Select or type a category"
                className="category-selector__input"
            />
            {inputValue && !allCategories.includes(inputValue) && (
                <span className="category-selector__new-indicator">
                    New Category
                </span>
            )}
            {isOpen && (
                <div ref={dropdownRef} className="category-selector__dropdown">
                    {allCategories.map((category, index) => (
                        <div
                            key={index}
                            className="category-selector__option"
                            onClick={() => handleSelect(category)}
                            tabIndex={-1}
                        >
                            {category}
                        </div>
                    ))}
                    {inputValue && !filteredCategories.includes(inputValue) && (
                        <div
                            className="category-selector__option category-selector__option--new"
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
