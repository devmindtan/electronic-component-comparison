import React, { useState } from 'react';
import { cn } from '../../lib/cn';

export function Tooltip({ content, children, className }: { content: string; children: React.ReactNode; className?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none',
          'bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg',
          className
        )}>
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
