import {
  ChevronRight, GitCompare, CheckCircle, XCircle,
  Thermometer, Zap, Package, Ruler, Shield, FileText, BarChart3, Weight,
  ExternalLink, Tag, ChevronLeft, ChevronRight as ChevronRightIcon, ZoomIn, X,
  Pencil, Trash2
} from 'lucide-react';
import { useState, useEffect, type ReactNode } from 'react';
import type { Component } from '../lib/supabase';
import { categoryIcons, formatSpecKey, formatSpecValue, getDisplaySpecs } from '../lib/utils';
import { getComponentGallery } from '../lib/images';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn } from '../lib/cn';

interface Props {
  component: Component;
  onBack: () => void;
  onToggleCompare: (c: Component) => void;
  isSelected: boolean;
  onEdit?: (c: Component) => void;
  onDelete?: (c: Component) => void;
}

/* ── Image gallery — large hero image + thumbnail strip + click-to-enlarge lightbox ── */
function ImageGallery({ component }: { component: Component }) {
  const gallery = getComponentGallery(component);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = gallery[activeIdx];

  const prev = () => setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setActiveIdx((i) => (i + 1) % gallery.length);

  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen, gallery.length]);

  return (
    <>
      <div className="flex flex-col gap-3">
        <div
          className="group relative bg-gray-100 overflow-hidden rounded-2xl border border-gray-200 shadow-sm aspect-[4/3] cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <img src={active.src} alt={active.label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <div className="absolute top-3 right-3 p-1.5 bg-black/45 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={14} />
          </div>
          {gallery.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
              >
                <ChevronRightIcon size={16} />
              </button>
            </>
          )}
          <div className="absolute bottom-3 left-3 right-3 flex justify-center">
            <span className="text-xs bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full font-medium">
              {active.label}
            </span>
          </div>
        </div>

        {gallery.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={cn(
                  'aspect-square rounded-xl overflow-hidden border-2 transition-all',
                  i === activeIdx ? 'border-stone-500 shadow-sm' : 'border-gray-200 hover:border-gray-400'
                )}
              >
                <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — full-screen enlarged view */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {gallery.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <ChevronRightIcon size={20} />
              </button>
            </>
          )}

          <img
            src={active.src}
            alt={active.label}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-medium">
            {active.label}
          </span>
        </div>
      )}
    </>
  );
}

/* ── Section heading — used for each panel below the hero ── */
function SectionHeading({ icon, title, count }: { icon: ReactNode; title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="p-1.5 bg-stone-50 text-stone-600 rounded-lg shrink-0">{icon}</span>
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h2>
      </div>
      {count != null && (
        <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      )}
    </div>
  );
}

export function ComponentDetailPage({ component, onBack, onToggleCompare, isSelected, onEdit, onDelete }: Props) {
  const category = component.categories;
  const IconComponent = category ? categoryIcons[category.icon] ?? categoryIcons['cpu'] : categoryIcons['cpu'];

  const tempRange = (component.operating_temp_min != null && component.operating_temp_max != null)
    ? `${component.operating_temp_min}°C to ${component.operating_temp_max}°C` : null;
  const voltageRange = (component.voltage_min != null && component.voltage_max != null)
    ? `${component.voltage_min}V – ${component.voltage_max}V` : null;

  const physicalSpecs = [
    { label: 'Package Type',   value: component.package_type,                                          icon: <Package size={16} />,     accent: 'bg-stone-50 text-stone-600' },
    { label: 'Dimensions',     value: component.dimensions_mm,                                         icon: <Ruler size={16} />,       accent: 'bg-cyan-50 text-cyan-600' },
    { label: 'Weight',         value: component.weight_g != null ? `${component.weight_g}g` : null,    icon: <Weight size={16} />,      accent: 'bg-purple-50 text-purple-600' },
    { label: 'Operating Temp', value: tempRange,                                                        icon: <Thermometer size={16} />, accent: 'bg-orange-50 text-orange-600' },
    { label: 'Supply Voltage', value: voltageRange,                                                     icon: <Zap size={16} />,         accent: 'bg-amber-50 text-amber-600' },
    { label: 'RoHS Status',    value: component.rohs_compliant ? 'Compliant' : 'Non-compliant',        icon: <Shield size={16} />,      accent: component.rohs_compliant ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500' },
  ].filter((s) => s.value);

  const displaySpecs = getDisplaySpecs(component.specs);
  const hasSpecs = displaySpecs.length > 0;
  const quickSpecs = displaySpecs.slice(0, 4);

  const highlightChips = [
    tempRange ? { icon: <Thermometer size={11} />, label: tempRange } : null,
    voltageRange ? { icon: <Zap size={11} />, label: voltageRange } : null,
    component.weight_g != null ? { icon: <Weight size={11} />, label: `${component.weight_g} g` } : null,
    component.package_type ? { icon: <Package size={11} />, label: component.package_type } : null,
  ].filter(Boolean) as { icon: ReactNode; label: string }[];

  return (
    <div className="flex-1 min-w-0 px-4 sm:px-6 py-5 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-6">
        <button
          onClick={onBack}
          className="text-stone-600 hover:text-stone-700 hover:underline font-medium transition-colors"
        >
          Home
        </button>
        <ChevronRight size={14} className="text-gray-400 shrink-0" />
        {category && (
          <>
            <span className="text-gray-500">{category.name}</span>
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
          </>
        )}
        <span className="text-gray-900 font-medium truncate">{component.name}</span>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-stone-50 text-stone-600 rounded-xl shrink-0">
            <IconComponent size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-gray-900">{component.name}</h1>
              {component.rohs_compliant && <Badge variant="success"><Shield size={10} /> RoHS</Badge>}
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-stone-600">{component.series || category?.name}</span>
              {component.manufacturer && <> · {component.manufacturer}</>}
              {component.part_number && component.part_number !== component.name && (
                <span className="font-mono ml-2 text-gray-400 text-xs">{component.part_number}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant={isSelected ? 'default' : 'outline'} size="sm" onClick={() => onToggleCompare(component)}>
            <GitCompare size={13} /> {isSelected ? 'Remove' : 'Compare'}
          </Button>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(component)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
              <Pencil size={13} /> Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" size="sm" onClick={() => onDelete(component)} className="text-red-500 border-red-200 hover:bg-red-50">
              <Trash2 size={13} /> Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onBack}>
            ← Back
          </Button>
        </div>
      </div>

      {/* Hero: large gallery + a filled, high-contrast info panel */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch mb-10">
        <div className="w-full lg:w-[440px] shrink-0">
          <ImageGallery component={component} />
        </div>

        <div className="flex-1 min-w-0 bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
          <p className="text-sm text-gray-600 leading-relaxed">{component.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: 'Manufacturer', value: component.manufacturer || '—' },
              { label: 'Series',       value: component.series || '—' },
              { label: 'Category',     value: category?.name || '—' },
              { label: 'Part Number',  value: component.part_number || component.name },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{s.label}</div>
                <div className="text-sm font-bold text-gray-900 truncate">{s.value}</div>
              </div>
            ))}
          </div>

          {highlightChips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {highlightChips.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                >
                  <span className="text-stone-500 shrink-0">{c.icon}</span>{c.label}
                </span>
              ))}
            </div>
          )}

          {quickSpecs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <BarChart3 size={12} /> Key Specs
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickSpecs.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-500">{formatSpecKey(k)}</span>
                    <span className="text-xs font-bold text-gray-900">{formatSpecValue(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {component.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <Tag size={12} /> Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {component.tags.map((tag) => <Badge key={tag} variant="primary">{tag}</Badge>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Specifications + Physical & Environmental — side by side on larger screens */}
      {(hasSpecs || physicalSpecs.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
          {hasSpecs && (
            <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 h-full">
              <SectionHeading icon={<BarChart3 size={14} />} title="Specifications" count={displaySpecs.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displaySpecs.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-3 hover:border-gray-200 hover:bg-white transition-colors"
                  >
                    <span className="text-xs text-gray-500 font-medium">{formatSpecKey(k)}</span>
                    <span className="text-sm font-bold text-gray-900 text-right">
                      {typeof v === 'boolean'
                        ? v
                          ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={14} /> Yes</span>
                          : <span className="flex items-center gap-1 text-red-500"><XCircle size={14} /> No</span>
                        : formatSpecValue(v)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {physicalSpecs.length > 0 && (
            <section className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-6 h-full">
              <SectionHeading icon={<Ruler size={14} />} title="Physical & Environmental" count={physicalSpecs.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {physicalSpecs.map((s) => (
                  <div key={s.label} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                    <div className={cn('shrink-0 p-2.5 rounded-xl', s.accent)}>{s.icon}</div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{s.label}</div>
                      <div className="text-sm font-bold text-gray-900 truncate">{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Datasheet — compact banner instead of a separate tab */}
      {component.datasheet_url && (
        <section>
          <SectionHeading icon={<FileText size={14} />} title="Datasheet" />
          <div className="flex items-center gap-4 bg-white border border-gray-200 shadow-sm rounded-xl p-5">
            <div className="p-3 bg-stone-50 rounded-xl shrink-0">
              <FileText size={24} className="text-stone-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm mb-0.5">Official Datasheet</p>
              <p className="text-xs text-gray-500 truncate">Complete technical documentation for {component.name}</p>
            </div>
            <a
              href={component.datasheet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-stone-600 hover:bg-stone-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shrink-0"
            >
              <ExternalLink size={14} /> Open
            </a>
          </div>
        </section>
      )}
    </div>
  );
}