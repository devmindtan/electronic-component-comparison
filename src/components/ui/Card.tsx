import React from 'react';
import { cn } from '../../lib/cn';

export const Card = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('bg-white rounded-2xl border border-gray-200 shadow-sm', className)} {...p} />;

export const CardHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('px-5 pt-5 pb-3', className)} {...p} />;

export const CardContent = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('px-5 pb-4', className)} {...p} />;

export const CardFooter = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('px-5 pt-3 pb-4 border-t border-gray-100', className)} {...p} />;
