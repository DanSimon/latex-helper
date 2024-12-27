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
  console.log("RENDER");

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
      console.log("BOO");
    return <div style={{ display: 'none' }} />; // Return empty div instead of null
  }

  return (
    <div
      ref={popupRef}
      className="absolute bg-background-primary border border-background-modifier shadow-lg z-50"
      style={{
        position: 'absolute',
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
            className="cursor-pointer p-1 inline-block"
            style={{
              background: selectedIndex === index ? 'var(--background-secondary)' : 'var(--background-primary)'
            }}
            onMouseOver={() => selectedIndex !== index && setSelectedIndex(index)}
            onMouseOut={() => selectedIndex === index && setSelectedIndex(-1)}
            onClick={() => onSelect(index)}
          >
            {isFastReplace ? (
              <span className="text-green-500 mr-1 text-xs">⚡</span>
            ) : (
              <span className="text-gray-500 mr-1 text-xs">{index + 1}.</span>
            )}
            <span
              className="rendered-math"
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
