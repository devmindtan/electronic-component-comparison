import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

const SIZE = { sm: 'max-w-sm', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl', full: 'max-w-screen-xl' };

export function Dialog({
  open, onClose, children, className, size = 'lg',
}: {
  open: boolean; onClose: () => void; children: React.ReactNode; className?: string;
  size?: keyof typeof SIZE;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-2xl w-full max-h-[92vh] overflow-y-auto scrollbar-hide flex flex-col',
          SIZE[size], className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export const DialogHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10 shrink-0', className)} {...p} />;

export const DialogTitle = ({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) =>
  <h2 className={cn('text-lg font-bold text-gray-900', className)} {...p} />;

export const DialogBody = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('flex-1 px-6 py-6', className)} {...p} />;

export function DialogCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0" aria-label="Close">
      <X size={18} className="text-gray-500" />
    </button>
  );
}
