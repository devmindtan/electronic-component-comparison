import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/cn';

interface SelectProps {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
}

export function Select({ value, onChange, children, className, placeholder }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse <option> children into { value, label } list
  const options: { value: string; label: string }[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === 'option') {
      const props = child.props as { value?: string; children?: React.ReactNode };
      options.push({
        value: props.value ?? '',
        label: String(props.children ?? ''),
      });
    }
  });

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? placeholder ?? options[0]?.label ?? '';

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'px-3 py-2 text-sm rounded-lg border transition-all',
          'focus:outline-none focus:ring-2 focus:ring-stone-500/20',
          open
            ? 'border-stone-400 bg-white ring-2 ring-stone-500/20'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
          !value ? 'text-gray-400' : 'text-gray-800'
        )}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown
          size={14}
          className={cn('shrink-0 text-gray-400 transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className={cn(
          'absolute z-50 mt-1 w-full min-w-[140px]',
          'bg-white border border-gray-200 rounded-lg shadow-lg',
          'py-1 overflow-auto scrollbar-hide max-h-60',
          'animate-in fade-in-0 zoom-in-95 duration-100'
        )}>
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange({ target: { value: opt.value } });
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors',
                  isSelected
                    ? 'bg-stone-50 text-stone-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check size={13} className="shrink-0 text-stone-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}