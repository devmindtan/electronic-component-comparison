import React from 'react';
import { X, SlidersHorizontal, Thermometer, Zap, Package } from 'lucide-react';
import type { Category, Component } from '../lib/supabase';
import { categoryIcons } from '../lib/utils';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { cn } from '../lib/cn';

export interface FilterState {
  category: string;
  series: string;
  manufacturer: string;
  packageType: string;
  rohsOnly: boolean;
  tempRange: 'any' | 'commercial' | 'industrial' | 'military';
  voltageRange: 'any' | '1v8' | '3v3' | '5v';
}

export const DEFAULT_FILTERS: FilterState = {
  category: '', series: '', manufacturer: '', packageType: '',
  rohsOnly: false, tempRange: 'any', voltageRange: 'any',
};

interface SidebarProps {
  categories: Category[];
  components: Component[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClear: () => void;
  resultCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ categories, components, filters, onChange, onClear, resultCount, isOpen, onClose }: SidebarProps) {
  const allSeries = Array.from(new Set(components.map((c) => c.series).filter(Boolean))).sort();
  const allManufacturers = Array.from(new Set(components.map((c) => c.manufacturer).filter(Boolean))).sort();
  const allPackageTypes = Array.from(new Set(components.map((c) => c.package_type).filter(Boolean))).sort() as string[];

  const hasActive = Object.entries(filters).some(([k, v]) => {
    if (k === 'rohsOnly') return v === true;
    return v !== '' && v !== 'any';
  });

  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  const inner = (
    <SidebarInner
      categories={categories}
      allSeries={allSeries}
      allManufacturers={allManufacturers}
      allPackageTypes={allPackageTypes}
      filters={filters}
      set={set}
      hasActive={hasActive}
      onClear={onClear}
      resultCount={resultCount}
    />
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-65 shrink-0 border-r border-gray-200 bg-white sticky top-[101px] h-[calc(100vh-101px)] overflow-y-auto scrollbar-hide">
        {inner}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <span className="font-semibold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </span>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">{inner}</div>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarInner({
  categories, allSeries, allManufacturers, allPackageTypes,
  filters, set, hasActive, onClear, resultCount,
}: {
  categories: Category[];
  allSeries: string[];
  allManufacturers: string[];
  allPackageTypes: string[];
  filters: FilterState;
  set: (p: Partial<FilterState>) => void;
  hasActive: boolean;
  onClear: () => void;
  resultCount: number;
}) {
  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between h-7">
        <span className="text-sm text-gray-500">
          <span className="font-bold text-gray-900">{resultCount}</span> result{resultCount !== 1 ? 's' : ''}
        </span>
        {hasActive && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X size={11} /> Clear
          </button>
        )}
      </div>

      <FilterSection label="Category" icon={<Package size={12} />}>
        <button
          onClick={() => set({ category: '' })}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left',
            !filters.category ? 'bg-stone-50 text-stone-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
          )}
        >
          All Categories
        </button>
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.icon] ?? categoryIcons['cpu'];
          const active = filters.category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => set({ category: active ? '' : cat.id })}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left',
                active ? 'bg-stone-50 text-stone-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Icon size={13} className="shrink-0" /> {cat.name}
            </button>
          );
        })}
      </FilterSection>

      <FilterSection label="Manufacturer" icon={<Package size={12} />}>
        <Select value={filters.manufacturer} onChange={(e) => set({ manufacturer: e.target.value })}>
          <option value="">All manufacturers</option>
          {allManufacturers.map((m) => <option key={m} value={m}>{m}</option>)}
        </Select>
      </FilterSection>

      <FilterSection label="Series" icon={<Package size={12} />}>
        <Select value={filters.series} onChange={(e) => set({ series: e.target.value })}>
          <option value="">All series</option>
          {allSeries.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </FilterSection>

      {allPackageTypes.length > 0 && (
        <FilterSection label="Package Type" icon={<Package size={12} />}>
          <Select value={filters.packageType} onChange={(e) => set({ packageType: e.target.value })}>
            <option value="">All packages</option>
            {allPackageTypes.map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
        </FilterSection>
      )}

      <FilterSection label="Temp Range" icon={<Thermometer size={12} />}>
        {([
          { val: 'any', label: 'Any', sub: '' },
          { val: 'commercial', label: 'Commercial', sub: '0–70°C' },
          { val: 'industrial', label: 'Industrial', sub: '-40–85°C' },
          { val: 'military', label: 'Military', sub: '-55–125°C' },
        ] as const).map((opt) => (
          <button
            key={opt.val}
            onClick={() => set({ tempRange: opt.val })}
            className={cn(
              'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors',
              filters.tempRange === opt.val ? 'bg-stone-50 text-stone-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <span>{opt.label}</span>
            {opt.sub && <span className="text-[10px] text-gray-400">{opt.sub}</span>}
          </button>
        ))}
      </FilterSection>

      <FilterSection label="Supply Voltage" icon={<Zap size={12} />}>
        {([
          { val: 'any', label: 'Any' },
          { val: '1v8', label: '1.8V' },
          { val: '3v3', label: '3.3V' },
          { val: '5v', label: '5V' },
        ] as const).map((opt) => (
          <button
            key={opt.val}
            onClick={() => set({ voltageRange: opt.val })}
            className={cn(
              'w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors',
              filters.voltageRange === opt.val ? 'bg-stone-50 text-stone-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            {opt.label}
          </button>
        ))}
      </FilterSection>

      <FilterSection label="Compliance" icon={<Package size={12} />}>
        <ToggleRow label="RoHS Compliant" checked={filters.rohsOnly} onChange={(v) => set({ rohsOnly: v })} />
      </FilterSection>

      {hasActive && (
        <div className="pt-2 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClear} className="w-full text-red-500 border-red-200 hover:bg-red-50 text-xs">
            <X size={12} /> Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterSection({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        {icon} {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group px-1 py-1.5">
      <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative w-9 h-5 rounded-full transition-colors shrink-0', checked ? 'bg-stone-600' : 'bg-gray-200')}
      >
        <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', checked ? 'left-4' : 'left-0.5')} />
      </button>
    </label>
  );
}
