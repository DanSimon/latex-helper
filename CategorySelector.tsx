import React, { useState, useEffect, useRef } from 'react';

const styles = {
    wrapper: {
        position: 'relative',
        width: '100%'
    },
    input: {
        width: '100%',
        padding: '8px',
        border: '1px solid var(--background-modifier-border)',
        borderRadius: '4px',
        backgroundColor: 'var(--background-primary)',
        color: 'var(--text-normal)'
    },
    dropdown: {
        position: 'absolute',
        width: '100%',
        marginTop: '4px',
        border: '1px solid var(--background-modifier-border)',
        borderRadius: '4px',
        backgroundColor: 'var(--background-primary)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxHeight: '200px',
        overflowY: 'auto',
        zIndex: 50
    },
    option: {
        padding: '8px',
        cursor: 'pointer'
    },
    newOption: {
        padding: '8px',
        cursor: 'pointer',
        color: 'var(--text-accent)'
    }
};

const CategorySelector = ({ allCategories, selectedCategory, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(selectedCategory || '');
    const [filteredCategories, setFilteredCategories] = useState(allCategories);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const filtered = allCategories.filter(category => 
                                              category.toLowerCase().includes(inputValue.toLowerCase())
                                             );
                                             setFilteredCategories(filtered);
    }, [inputValue, allCategories]);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setIsOpen(true);
    };

    const handleSelect = (category) => {
        setInputValue(category);
        onSelect(category);
        setIsOpen(false);
    };

    return (
        <div style={styles.wrapper} ref={wrapperRef}>
        <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="Select or type a category"
        style={styles.input}
        />
        {isOpen && (
            <div style={styles.dropdown}>
            {filteredCategories.map((category, index) => (
                <div
                key={index}
                style={styles.option}
                onMouseEnter={e => e.target.style.backgroundColor = 'var(--background-secondary)'}
                onMouseLeave={e => e.target.style.backgroundColor = 'var(--background-primary)'}
                onClick={() => handleSelect(category)}
                >
                {category}
                </div>
            ))}
            {inputValue && !filteredCategories.includes(inputValue) && (
                <div
                style={styles.newOption}
                onMouseEnter={e => e.target.style.backgroundColor = 'var(--background-secondary)'}
                onMouseLeave={e => e.target.style.backgroundColor = 'var(--background-primary)'}
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
