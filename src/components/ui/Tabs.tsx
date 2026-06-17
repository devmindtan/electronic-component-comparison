import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/cn';

const Ctx = createContext<{ val: string; set: (v: string) => void }>({ val: '', set: () => {} });

export function Tabs({
  defaultValue = '', value, onValueChange, className, children,
}: {
  defaultValue?: string; value?: string; onValueChange?: (v: string) => void;
  className?: string; children: React.ReactNode;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  return (
    <Ctx.Provider value={{ val: active, set: (v) => { setInternal(v); onValueChange?.(v); } }}>
      <div className={cn('w-full', className)}>{children}</div>
    </Ctx.Provider>
  );
}

export function TabsList({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="tablist"
      className={cn('inline-flex items-center gap-0.5 bg-gray-100 rounded-xl p-1', className)}
      {...p}
    />
  );
}

export function TabsTrigger({ value, className, children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { val, set } = useContext(Ctx);
  const active = val === value;
  return (
    <button role="tab" aria-selected={active} onClick={() => set(value)}
      className={cn(
        'inline-flex items-center px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap',
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
        className
      )}
      {...p}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className, children, ...p }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { val } = useContext(Ctx);
  if (val !== value) return null;
  return <div role="tabpanel" className={cn('mt-4', className)} {...p}>{children}</div>;
}
