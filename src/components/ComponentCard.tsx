import React, { useState } from 'react';
import {
  ExternalLink, Tag, GitCompare, CheckCircle, XCircle,
  Thermometer, Zap, Package, Ruler, Shield, FileText, BarChart3, Info, Weight,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import type { Component } from '../lib/supabase';
import { categoryIcons, formatSpecKey, formatSpecValue } from '../lib/utils';
import { getComponentImage, getComponentGallery } from '../lib/images';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogCloseButton } from './ui/Dialog';
import { Tooltip } from './ui/Tooltip';
import { cn } from '../lib/cn';

interface ComponentCardProps {
  component: Component;
  isSelected: boolean;
  viewMode: 'grid' | 'list';
  onToggleCompare: (c: Component) => void;
  onViewDetails: (c: Component) => void;
}

export function ComponentCard({ component, isSelected, viewMode, onToggleCompare, onViewDetails }: ComponentCardProps) {
  const category = component.categories;
  const IconComponent = category ? categoryIcons[category.icon] ?? categoryIcons['cpu'] : categoryIcons['cpu'];
  const imgSrc = getComponentImage(component);
  const topSpecs = Object.entries(component.specs).slice(0, 3);

  if (viewMode === 'list') {
    return (
      <div
        className={cn(
          'group flex items-center gap-4 bg-white border rounded-xl px-4 py-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300',
          isSelected ? 'border-blue-500 shadow-md shadow-blue-100/60 ring-1 ring-blue-500/20' : 'border-gray-200'
        )}
        onClick={() => onViewDetails(component)}
      >
        <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 transform-gpu">
          <img src={imgSrc} alt={component.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 transform-gpu" loading="lazy" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-semibold text-gray-900 text-sm">{component.name}</span>
            {component.rohs_compliant && <Badge variant="primary"><Shield size={9} /> RoHS</Badge>}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span className="font-medium text-gray-700">{component.manufacturer}</span>
            {component.series && <><span>·</span><span>{component.series}</span></>}
            {component.package_type && (
              <><span>·</span><Badge variant="outline" className="text-[10px]">{component.package_type}</Badge></>
            )}
          </div>
          <p className="text-xs text-gray-400 line-clamp-1">{component.description}</p>
        </div>

        <div className="hidden md:flex items-center gap-6 shrink-0">
          {topSpecs.map(([k, v]) => (
            <div key={k} className="text-center">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide leading-none mb-1">{formatSpecKey(k)}</div>
              <div className="text-sm font-bold text-gray-800">{formatSpecValue(v)}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
          <Tooltip content={isSelected ? 'Remove from compare' : 'Add to compare'}>
            <Button variant={isSelected ? 'default' : 'outline'} size="sm" onClick={() => onToggleCompare(component)} className="transition-all duration-200 active:scale-95">
              <GitCompare size={13} />
            </Button>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      'group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col overflow-hidden transform-gpu',
      isSelected ? 'border-blue-500 ring-1 ring-blue-500/30 shadow-blue-100/60 shadow-md' : 'border-gray-200'
    )}>
      {/* Image */}
      <div
        className="relative w-full h-45 max-h-[200px] overflow-hidden bg-gray-100 shrink-0 transform-gpu"
        onClick={() => onViewDetails(component)}
      >
        <img
          src={imgSrc}
          alt={component.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 transform-gpu"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <div className="absolute bottom-2 left-2.5 flex items-center gap-1 bg-black/55 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-medium text-white">
          <IconComponent size={10} className="text-blue-300 shrink-0" />
          {category?.name ?? 'Component'}
        </div>
        {component.rohs_compliant && (
          <div className="absolute top-2 right-2">
            <Badge variant="success" className="shadow-sm text-[10px]"><Shield size={9} /> RoHS</Badge>
          </div>
        )}
      </div>

      <CardContent className="flex-1 flex flex-col gap-2 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2" onClick={() => onViewDetails(component)}>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition-colors duration-200">{component.name}</h3>
            {component.part_number && component.part_number !== component.name && (
              <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate">{component.part_number}</p>
            )}
          </div>
          <span className="text-[10px] text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded shrink-0 font-medium leading-none mt-0.5 whitespace-nowrap">
            {component.manufacturer}
          </span>
        </div>

        {component.package_type && (
          <div onClick={() => onViewDetails(component)}>
            <Badge variant="outline" className="text-[10px]"><Package size={9} /> {component.package_type}</Badge>
          </div>
        )}

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 cursor-pointer" onClick={() => onViewDetails(component)}>
          {component.description}
        </p>

        {topSpecs.length > 0 && (
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 cursor-pointer divide-y divide-gray-100" onClick={() => onViewDetails(component)}>
            {topSpecs.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1 first:pt-0 last:pb-0">
                <span className="text-[10px] text-gray-400">{formatSpecKey(k)}</span>
                <span className="text-[10px] font-bold text-gray-800">{formatSpecValue(v)}</span>
              </div>
            ))}
          </div>
        )}

        {component.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 cursor-pointer" onClick={() => onViewDetails(component)}>
            {component.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
            ))}
            {component.tags.length > 3 && (
              <span className="text-[10px] text-gray-400 self-center">+{component.tags.length - 3}</span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-2 pb-3">
        <Button
          variant={isSelected ? 'default' : 'outline'}
          size="sm"
          className="flex-1 transition-all duration-200 active:scale-95"
          onClick={() => onToggleCompare(component)}
        >
          <GitCompare size={12} /> {isSelected ? 'Remove' : 'Compare'}
        </Button>
        <Button variant="secondary" size="sm" className="flex-1 transition-all duration-200 active:scale-95" onClick={() => onViewDetails(component)}>
          Details
        </Button>
      </CardFooter>
    </Card>
  );
}

/* ── Image Gallery ── */
function ImageGallery({ component }: { component: Component }) {
  const gallery = getComponentGallery(component);
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = () => setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setActiveIdx((i) => (i + 1) % gallery.length);

  const active = gallery[activeIdx];

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-52 bg-gray-100 overflow-hidden rounded-xl group/gallery shadow-inner transform-gpu">
        <img 
          key={activeIdx}
          src={active.src} 
          alt={active.label} 
          className="w-full h-full object-cover animate-in fade-in duration-300" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 via-gray-900/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-3 left-4 pointer-events-none">
          <span className="text-white font-bold text-lg drop-shadow">{component.name}</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full border border-white/30">
              {active.label}
            </span>
          </div>
        </div>
        {gallery.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 opacity-0 group-hover/gallery:opacity-100 active:scale-90"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 opacity-0 group-hover/gallery:opacity-100 active:scale-90"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className="flex-1 flex flex-col items-center gap-1 group transition-all"
            >
              <div className={cn(
                'w-full h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 transform-gpu',
                i === activeIdx ? 'border-blue-500 shadow-sm scale-[1.02]' : 'border-gray-200 hover:border-gray-400'
              )}>
                <img src={img.src} alt={img.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 transform-gpu" />
              </div>
              <span className={cn(
                'text-[9px] font-medium transition-colors leading-tight text-center',
                i === activeIdx ? 'text-blue-600 font-semibold' : 'text-gray-400'
              )}>
                {img.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Detail Modal ── */
interface ComponentDetailModalProps {
  component: Component | null;
  onClose: () => void;
  onToggleCompare: (c: Component) => void;
  isSelected: boolean;
}

export function ComponentDetailModal({ component, onClose, onToggleCompare, isSelected }: ComponentDetailModalProps) {
  if (!component) return null;

  const category = component.categories;
  const IconComponent = category ? categoryIcons[category.icon] ?? categoryIcons['cpu'] : categoryIcons['cpu'];

  const tempRange = (component.operating_temp_min != null && component.operating_temp_max != null)
    ? `${component.operating_temp_min}°C to ${component.operating_temp_max}°C`
    : null;
  const voltageRange = (component.voltage_min != null && component.voltage_max != null)
    ? `${component.voltage_min}V – ${component.voltage_max}V`
    : null;

  const physicalSpecs = [
    { label: 'Package Type', value: component.package_type, icon: <Package size={15} className="text-blue-500" /> },
    { label: 'Dimensions', value: component.dimensions_mm, icon: <Ruler size={15} className="text-blue-500" /> },
    { label: 'Weight', value: component.weight_g != null ? `${component.weight_g}g` : null, icon: <Weight size={15} className="text-blue-500" /> },
    { label: 'Operating Temp', value: tempRange, icon: <Thermometer size={15} className="text-blue-500" /> },
    { label: 'Supply Voltage', value: voltageRange, icon: <Zap size={15} className="text-blue-500" /> },
    { label: 'RoHS Status', value: component.rohs_compliant ? 'Compliant' : 'Non-compliant', icon: <Shield size={15} className={component.rohs_compliant ? 'text-emerald-500' : 'text-red-400'} /> },
  ].filter((s) => s.value);

  return (
    <Dialog open onClose={onClose} size="xl">
      <div className="animate-in fade-in zoom-in-95 duration-200 ease-out flex flex-col h-full">
        <DialogHeader className="border-b border-gray-100/80 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
              <IconComponent size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <DialogTitle>{component.name}</DialogTitle>
                {component.rohs_compliant && (
                  <Badge variant="success"><Shield size={10} /> RoHS</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-none">
                <span className="font-medium text-blue-600">{component.series || category?.name}</span>
                {component.manufacturer && <> · {component.manufacturer}</>}
                {component.part_number && component.part_number !== component.name && (
                  <span className="font-mono ml-2 text-gray-400">{component.part_number}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant={isSelected ? 'default' : 'outline'} size="sm" onClick={() => onToggleCompare(component)} className="transition-all duration-200 active:scale-95">
                <GitCompare size={13} /> {isSelected ? 'Remove' : 'Compare'}
              </Button>
              <DialogCloseButton onClose={onClose} />
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="p-0 overflow-hidden">
          <div className="px-6 pt-5 pb-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-gray-100/80 p-1 rounded-xl">
                <TabsTrigger value="overview" className="data-[state=active]:shadow-sm transition-all duration-150"><Info size={13} className="mr-1" />Overview</TabsTrigger>
                <TabsTrigger value="specs" className="data-[state=active]:shadow-sm transition-all duration-150"><BarChart3 size={13} className="mr-1" />Specifications</TabsTrigger>
                <TabsTrigger value="physical" className="data-[state=active]:shadow-sm transition-all duration-150"><Ruler size={13} className="mr-1" />Physical</TabsTrigger>
                {component.datasheet_url && (
                  <TabsTrigger value="datasheet" className="data-[state=active]:shadow-sm transition-all duration-150"><FileText size={13} className="mr-1" />Datasheet</TabsTrigger>
                )}
              </TabsList>

              <div className="mt-4 min-h-[310px]">
                <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-200 focus-visible:outline-none">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-56 shrink-0">
                      <ImageGallery component={component} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{component.description}</p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { label: 'Manufacturer', value: component.manufacturer || '—' },
                          { label: 'Series', value: component.series || '—' },
                          { label: 'Category', value: category?.name || '—' },
                          { label: 'Part Number', value: component.part_number || component.name },
                        ].map((s) => (
                          <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 hover:bg-gray-100/50 transition-colors duration-150">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{s.label}</div>
                            <div className="text-sm font-bold text-gray-800 truncate">{s.value}</div>
                          </div>
                        ))}
                      </div>

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

                      {Object.keys(component.specs).length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Specs</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(component.specs).slice(0, 8).map(([k, v]) => (
                              <div key={k} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 hover:border-gray-200 transition-colors">
                                <span className="text-xs text-gray-500">{formatSpecKey(k)}</span>
                                <span className="text-xs font-bold text-gray-900">{formatSpecValue(v)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="specs" className="animate-in fade-in slide-in-from-bottom-2 duration-200 focus-visible:outline-none">
                  {Object.keys(component.specs).length > 0 ? (
                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">Parameter</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {Object.entries(component.specs).map(([k, v]) => (
                            <tr key={k} className="hover:bg-gray-50/60 transition-colors duration-150">
                              <td className="px-4 py-3 text-sm text-gray-600 font-medium">{formatSpecKey(k)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                                {typeof v === 'boolean' ? (
                                  v
                                    ? <span className="flex items-center gap-1 text-emerald-600"><CheckCircle size={14} /> Yes</span>
                                    : <span className="flex items-center gap-1 text-red-500"><XCircle size={14} /> No</span>
                                ) : formatSpecValue(v)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 py-12 text-center animate-pulse">No technical specifications available.</p>
                  )}
                </TabsContent>

                <TabsContent value="physical" className="animate-in fade-in slide-in-from-bottom-2 duration-200 focus-visible:outline-none">
                  {physicalSpecs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {physicalSpecs.map((s) => (
                        <div key={s.label} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-all duration-150">
                          <div className="shrink-0 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">{s.icon}</div>
                          <div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{s.label}</div>
                            <div className="text-sm font-bold text-gray-900">{s.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 py-12 text-center animate-pulse">No physical specifications available.</p>
                  )}
                </TabsContent>

                {component.datasheet_url && (
                  <TabsContent value="datasheet" className="animate-in fade-in slide-in-from-bottom-2 duration-200 focus-visible:outline-none">
                    <div className="flex flex-col items-center gap-4 py-12 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
                      <div className="p-5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm animate-bounce duration-1000">
                        <FileText size={36} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 mb-1">Official Datasheet</p>
                        <p className="text-sm text-gray-500 mb-4">Complete technical documentation for {component.name}</p>
                        <a
                          href={component.datasheet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-md shadow-blue-600/10 active:scale-95"
                        >
                          <ExternalLink size={14} /> Open Datasheet
                        </a>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </div>
        </DialogBody>
      </div>
    </Dialog>
  );
}