import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option", 
  className,
  disabled = false 
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div 
      ref={selectRef}
      className={cn("relative w-full", className)}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full h-12 px-4 rounded-xl bg-white border border-[#CBD5E1] shadow-sm",
          "flex items-center justify-between text-left text-sm font-medium transition-all duration-200",
          "hover:border-[#1E40AF] active:scale-[0.985]",
          "focus:outline-none focus:ring-4 focus:ring-[#1E40AF]/15 focus:border-[#1E40AF]",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <span className={cn(
          "truncate",
          selectedOption ? "text-[#0F172A]" : "text-[#64748B]"
        )}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-[#64748B] transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-[#CBD5E1] rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = highlightedIndex === index;
              
              return (
                <button
                  key={`${option.value}-${index}`}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm font-medium transition-all duration-100",
                    "flex items-center justify-between gap-2",
                    "active:scale-[0.99] active:opacity-90",
                    "focus:outline-none",
                    isSelected 
                      ? "bg-[#DBEAFE] text-[#1E40AF] font-semibold" 
                      : isHighlighted 
                        ? "bg-[#EFF6FF] text-[#0F172A]" 
                        : "text-[#0F172A] hover:bg-[#EFF6FF] hover:text-[#0F172A]"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#1E40AF] shrink-0 animate-in zoom-in-75 duration-150" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
