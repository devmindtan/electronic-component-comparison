import React from 'react';
import { cn } from '../../lib/cn';

type Variant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'primary';

const variants: Record<Variant, string> = {
  default:     'bg-blue-600 text-white',
  secondary:   'bg-gray-100 text-gray-700',
  outline:     'border border-gray-300 text-gray-600 bg-transparent',
  success:     'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning:     'bg-amber-50 text-amber-700 border border-amber-200',
  destructive: 'bg-red-50 text-red-700 border border-red-200',
  primary:        'bg-blue-50 text-blue-700 border border-blue-200',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ variant = 'secondary', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
