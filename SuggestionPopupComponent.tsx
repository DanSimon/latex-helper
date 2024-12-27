import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { MarkdownRenderer, MarkdownView } from 'obsidian';

const TEMPLATE_PREFIX = 'T:';

interface SuggestionPopupProps {
  x: number;
  y: number;
  match: string;
  replacements: string[];
  fastReplace?: boolean;
  view: MarkdownView;
  onSelect: (index: number) => void;
  onHide: () => void;
  visible: boolean;
}

const SuggestionPopupComponent = ({
  x,
  y,
  match,
  replacements,
  fastReplace = false,
  view,
  onSelect,
  onHide,
  visible
}: SuggestionPopupProps) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const popupRef = useRef<HTMLDivElement>(null);
  const isFastReplace = fastReplace && replacements.length === 1;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onHide();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;

      // Handle fast replace for non-alphanumeric keys
      if (isFastReplace &&
          !/^[a-zA-Z0-9]$/.test(e.key) &&
          !['Escape', 'Tab', 'Backspace'].includes(e.key)) {
        onSelect(0);
        return;
      }

      switch (e.key) {
        case 'Escape':
          onHide();
          e.preventDefault();
          break;

        case 'Tab':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < replacements.length - 1 ? prev + 1 : 0
          );
          break;

        case 'Enter':
          if (selectedIndex >= 0) {
            e.preventDefault();
            onSelect(selectedIndex);
          }
          break;

        default:
          if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            if (index < replacements.length) {
              onSelect(index);
              e.preventDefault();
            }
          }
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, replacements.length, selectedIndex, isFastReplace, onSelect, onHide]);

  if (!visible || !match || replacements.length === 0) {
    return <div style={{ display: 'none' }} />; // Return empty div instead of null
  }

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        background: 'var(--background-primary)',
        border: '1px solid var(--background-modifier-border)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 50,
        left: `${x + 5}px`,
        bottom: `${window.innerHeight - y}px`,
        display: 'block',
        whiteSpace: 'nowrap',
        padding: '2px'
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
      {replacements.map((option, index) => {
        const appliedReplacement = option.startsWith(TEMPLATE_PREFIX)
          ? option.slice(TEMPLATE_PREFIX.length)
          : option;

        return (
          <span
            key={index}
            id={`suggestion-${index}`}
            style={{
              cursor: 'pointer',
              padding: '4px',
              display: 'inline-block',
              background: selectedIndex === index ? 'var(--background-secondary)' : 'var(--background-primary)'
            }}
            onMouseOver={() => selectedIndex !== index && setSelectedIndex(index)}
            onMouseOut={() => selectedIndex === index && setSelectedIndex(-1)}
            onClick={() => onSelect(index)}
          >
            {isFastReplace ? (
              <span style={{ color: '#22c55e', marginRight: '4px', fontSize: '0.75rem' }}>⚡</span>
            ) : (
              <span style={{ color: '#666', marginRight: '4px', fontSize: '0.75rem' }}>{index + 1}.</span>
            )}
            <span
              className="rendered-math" style={{ display: 'inline-block' }}
              ref={el => {
                if (el) {
                  MarkdownRenderer.render(
                    view.app,
                    `$${appliedReplacement}$`,
                    el,
                    view.file?.path || '',
                    view
                  );
                }
              }}
            />
          </span>
        );
      })}
    </div>
  );
};

export default SuggestionPopupComponent;
