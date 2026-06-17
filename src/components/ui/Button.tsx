import React from 'react';
import { cn } from '../../lib/cn';

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variantCls: Record<Variant, string> = {
  default:     'bg-stone-600 text-white hover:bg-stone-700 active:bg-stone-800',
  secondary:   'bg-gray-100 text-gray-800 hover:bg-gray-200',
  outline:     'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
  ghost:       'text-gray-600 hover:bg-gray-100',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeCls: Record<Size, string> = {
  sm:   'h-8 px-3 text-xs rounded-lg gap-1.5',
  md:   'h-9 px-4 text-sm rounded-xl gap-2',
  lg:   'h-11 px-6 text-sm rounded-xl font-semibold gap-2',
  icon: 'h-9 w-9 rounded-xl p-0',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export function Button({
  variant = 'default', size = 'md', isLoading, className, disabled, children, ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500/40',
        'disabled:pointer-events-none disabled:opacity-50',
        variantCls[variant], sizeCls[size], className
      )}
      {...props}
    >
      {isLoading && (
        <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}
