import React from 'react';
import { cn } from '../../lib/cn';

export function Input({ className, ...p }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-400 transition-all',
        className
      )}
      {...p}
    />
  );
}
