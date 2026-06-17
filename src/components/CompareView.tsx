import React from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  Minus,
  ExternalLink,
  GitCompare,
  Thermometer,
  Zap,
  Package,
  Shield,
  Cpu,
} from 'lucide-react';
import type { Component } from '../lib/supabase';
import { formatSpecKey, formatSpecValue, getSpecDiff, getAllSpecKeys } from '../lib/utils';
import { getComponentImage } from '../lib/images';
import { cn } from '../lib/cn';

interface CompareDrawerProps {
  components: Component[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenTable: () => void;
}

export function CompareDrawer({ components, onRemove, onClear, onOpenTable }: CompareDrawerProps) {
  if (components.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
      <div className="w-full mx-auto px-6 py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          <span className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap shrink-0">
            <GitCompare size={13} className="text-stone-500" />
            <span className="text-stone-600 font-medium">{components.length}</span>
            <span>/4</span>
          </span>

          {components.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 bg-stone-50 text-stone-700 border border-stone-200 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap shrink-0"
            >
              {c.name}
              <button
                onClick={() => onRemove(c.id)}
                className="text-stone-400 hover:text-red-500 transition-colors ml-0.5"
                aria-label={`Remove ${c.name}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}

          {components.length < 2 && (
            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
              Select {2 - components.length} more to compare
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-md hover:bg-gray-100"
          >
            Clear
          </button>
          {components.length >= 2 && (
            <button
              onClick={onOpenTable}
              className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <GitCompare size={12} />
              Compare ({components.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface CompareTableProps {
  components: Component[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export function CompareTable({ components, onRemove, onClose }: CompareTableProps) {
  if (components.length === 0) return null;

  const allKeys = getAllSpecKeys(components.map((c) => c.specs));
  const allSpecs = components.map((c) => c.specs);

  const LABEL_WIDTH = '200px';

  const physicalRows: {
    label: string;
    icon?: React.ReactNode;
    get: (c: Component) => unknown;
  }[] = [
    { label: 'Package type', icon: <Package size={12} />, get: (c) => c.package_type },
    { label: 'Dimensions', icon: null, get: (c) => c.dimensions_mm },
    {
      label: 'Operating temp',
      icon: <Thermometer size={12} />,
      get: (c) =>
        c.operating_temp_min != null && c.operating_temp_max != null
          ? `${c.operating_temp_min}°C to ${c.operating_temp_max}°C`
          : null,
    },
    {
      label: 'Supply voltage',
      icon: <Zap size={12} />,
      get: (c) =>
        c.voltage_min != null && c.voltage_max != null
          ? `${c.voltage_min}V – ${c.voltage_max}V`
          : null,
    },
    { label: 'RoHS compliant', icon: <Shield size={12} />, get: (c) => c.rohs_compliant },
  ];

  return (
    /* THAY ĐỔI TẠI ĐÂY: Sử dụng bg-white đặc hoàn toàn, loại bỏ lớp mờ, ép chiếm trọn 100% viewport */
    <div className="fixed inset-0 z-50 overflow-auto scrollbar-hide bg-white flex flex-col w-full h-full">
      {/* Sticky top bar - Trải rộng toàn màn hình */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare size={16} className="text-stone-500" />
            <h2 className="text-sm font-semibold text-gray-900">Compare Components</h2>
            <span className="inline-flex items-center bg-stone-50 text-stone-600 border border-stone-200 text-xs font-medium rounded-full px-2.5 py-0.5">
              {components.length} item{components.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 bg-white shadow-sm rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors font-medium"
          >
            <X size={12} /> Close Table
          </button>
        </div>
      </div>

      {/* Main Table Container - Đổi nền sang gray-50 nhẹ để làm nổi bật khối table trắng bên trong */}
      <div className="w-full mx-auto px-6 py-6 space-y-4 flex-1 bg-gray-50/60">
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead className="bg-white border-b border-gray-200/60">
                <tr>
                  <th style={{ width: LABEL_WIDTH }} className="px-5 py-4 text-left align-middle bg-gray-50/30">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Parameters</span>
                  </th>
                  
                  {components.map((c) => (
                    <th key={c.id} className="p-4 text-left font-normal align-top border-l border-gray-100">
                      <div className="relative bg-gray-50/40 border border-gray-100/70 rounded-xl p-4 transition-all duration-200 hover:bg-white hover:shadow-md group">
                        <button
                          onClick={() => onRemove(c.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors z-10"
                          aria-label={`Remove ${c.name}`}
                        >
                          <X size={12} />
                        </button>

                        <div className="w-full max-w-[350px] mx-auto h-50 rounded-lg mb-3 overflow-hidden bg-white flex items-center justify-center p-2 shadow-inner">
                          {getComponentImage(c) ? (
                            <img
                              src={getComponentImage(c)}
                              alt={c.name}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Cpu size={32} className="text-gray-300" />
                          )}
                        </div>

                        <div className="max-w-xs mx-auto text-center md:text-left">
                          <p className="text-xs font-bold text-gray-900 leading-snug truncate pr-4">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 truncate">{c.manufacturer}</p>
                          {c.rohs_compliant && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-semibold rounded-full px-2 py-0.5">
                                <Shield size={8} /> RoHS
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {/* 1. General Information */}
                <SectionHeaderTitle title="General information" />
                {[
                  { label: 'Manufacturer', get: (c: Component) => c.manufacturer || '—' },
                  { label: 'Series', get: (c: Component) => c.series || '—' },
                  { label: 'Category', get: (c: Component) => c.categories?.name || '—' },
                  { label: 'Part number', get: (c: Component) => c.part_number || c.name },
                  { label: 'Description', get: (c: Component) => c.description || '—' },
                ].map((row) => {
                  const vals = components.map(row.get);
                  const isDiff = vals.length > 1 && vals.some((v) => v !== vals[0]);
                  return (
                    <Row key={row.label} label={row.label} isDiff={isDiff} labelWidth={LABEL_WIDTH}>
                      {components.map((c) => (
                        <Cell key={c.id} isDiff={isDiff}>
                          <span className="block max-w-3xl mx-auto line-clamp-3 leading-relaxed text-left md:text-center px-4">{row.get(c)}</span>
                        </Cell>
                      ))}
                    </Row>
                  );
                })}

                {/* 2. Physical & Environmental */}
                <SectionHeaderTitle title="Physical & environmental" />
                {physicalRows.map((row) => {
                  const vals = components.map((c) => row.get(c));
                  const defined = vals.filter((v) => v !== null && v !== undefined);
                  const isDiff = defined.length > 1 && !defined.every((v) => String(v) === String(defined[0]));
                  return (
                    <Row key={row.label} label={row.label} isDiff={isDiff} icon={row.icon} labelWidth={LABEL_WIDTH}>
                      {components.map((c) => {
                        const v = row.get(c);
                        if (v === null || v === undefined) {
                          return (
                            <td key={c.id} className="px-4 py-3 text-center border-l border-gray-100">
                              <Minus size={13} className="mx-auto text-gray-300" />
                            </td>
                          );
                        }
                        if (typeof v === 'boolean') {
                          return (
                            <td key={c.id} className="px-4 py-3 text-center border-l border-gray-100">
                              {v ? (
                                <CheckCircle size={15} className="mx-auto text-emerald-500 fill-emerald-50" />
                              ) : (
                                <XCircle size={15} className="mx-auto text-red-400 fill-red-50" />
                              )}
                            </td>
                          );
                        }
                        return (
                          <Cell key={c.id} isDiff={isDiff}>
                            {String(v)}
                          </Cell>
                        );
                      })}
                    </Row>
                  );
                })}

                {/* 3. Technical Specifications */}
                {allKeys.length > 0 && (
                  <>
                    <SectionHeaderTitle title="Technical specifications" />
                    {allKeys.map((key) => {
                      const isDiff = getSpecDiff(allSpecs, key) === 'diff';
                      return (
                        <Row key={key} label={formatSpecKey(key)} isDiff={isDiff} labelWidth={LABEL_WIDTH}>
                          {components.map((c) => {
                            const val = c.specs[key];
                            if (val === undefined || val === null) {
                              return (
                                <td key={c.id} className="px-4 py-3 text-center border-l border-gray-100">
                                  <Minus size={13} className="mx-auto text-gray-300" />
                                </td>
                              );
                            }
                            if (typeof val === 'boolean') {
                              return (
                                <td key={c.id} className="px-4 py-3 text-center border-l border-gray-100">
                                  {val ? (
                                    <CheckCircle size={15} className="mx-auto text-emerald-500 fill-emerald-50" />
                                  ) : (
                                    <XCircle size={15} className="mx-auto text-red-400 fill-red-50" />
                                  )}
                                </td>
                              );
                            }
                            return (
                              <Cell key={c.id} isDiff={isDiff}>
                                {formatSpecValue(val)}
                              </Cell>
                            );
                          })}
                        </Row>
                      );
                    })}
                  </>
                )}

                {/* 4. Resources & Tags */}
                <SectionHeaderTitle title="Resources & tags" />
                <Row label="Tags" isDiff={false} labelWidth={LABEL_WIDTH}>
                  {components.map((c) => (
                    <td key={c.id} className="px-4 py-3 align-top border-l border-gray-100">
                      <div className="flex flex-wrap gap-1 justify-center max-w-xs mx-auto">
                        {c.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-block bg-stone-50 text-stone-600 border border-stone-200 text-[10px] font-medium rounded-full px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </Row>
                <Row label="Datasheet" isDiff={false} labelWidth={LABEL_WIDTH}>
                  {components.map((c) => (
                    <td key={c.id} className="px-4 py-3 text-center border-l border-gray-100">
                      {c.datasheet_url ? (
                        <a
                          href={c.datasheet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          <ExternalLink size={11} /> View
                        </a>
                      ) : (
                        <Minus size={13} className="mx-auto text-gray-300" />
                      )}
                    </td>
                  ))}
                </Row>
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend / Chú thích bên dưới */}
        <div className="flex items-center gap-5 text-[11px] text-gray-400 font-medium px-2 pb-6">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-200 shrink-0" />
            Values differ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-white border border-gray-100 shrink-0" />
            Values match
          </span>
          <span className="flex items-center gap-1.5">
            <Minus size={11} /> Not available
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components phục vụ layout ─── */

function SectionHeaderTitle({ title }: { title: string }) {
  return (
    <tr className="bg-gray-100/50">
      <td className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-100/80 backdrop-blur-sm z-10">
        {title}
      </td>
      <td colSpan={4} className="px-4 py-2" />
    </tr>
  );
}

function Row({
  label,
  isDiff,
  icon,
  children,
  labelWidth,
}: {
  label: string;
  isDiff: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  labelWidth: string;
}) {
  return (
    <tr className={cn('transition-colors', isDiff ? 'hover:bg-amber-50/20' : 'hover:bg-gray-50/40')}>
      <td
        style={{ width: labelWidth, minWidth: labelWidth }}
        className={cn(
          'px-4 py-3 text-xs font-semibold sticky left-0 z-10 border-r border-gray-100/80',
          isDiff ? 'bg-amber-50/70 text-amber-900' : 'bg-white text-gray-500'
        )}
      >
        <div className="flex items-center gap-1.5">
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', isDiff ? 'bg-amber-400 ring-4 ring-amber-400/10' : 'bg-gray-200')} />
          {icon && <span className="shrink-0 text-gray-400">{icon}</span>}
          {label}
        </div>
      </td>
      {children}
    </tr>
  );
}

function Cell({
  isDiff,
  children,
}: {
  isDiff: boolean;
  children: React.ReactNode;
}) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-xs text-center align-middle border-l border-gray-100 first:border-l-0',
        isDiff ? 'bg-amber-50/30 font-semibold text-amber-950' : 'text-gray-700'
      )}
    >
      {children}
    </td>
  );
}