import React, { useState } from 'react';
import {
  X,
  Shield,
  Package,
  FileCode,
  Info,
  Link2,
  ChevronRight,
  ChevronLeft,
  Check,
  Cpu,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category, Component } from '../lib/supabase';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogCloseButton } from './ui/Dialog';
import { cn } from '../lib/cn';

interface AddComponentFormProps {
  categories: Category[];
  editComponent?: Component;
  onSuccess: () => void;
  onCancel: () => void;
}

const STEPS = [
  { label: 'Basic Info', icon: Info },
  { label: 'Physical', icon: Package },
  { label: 'Technical', icon: FileCode },
  { label: 'Resources', icon: Link2 },
];

export function AddComponentForm({ categories, editComponent, onSuccess, onCancel }: AddComponentFormProps) {
  const isEdit = !!editComponent;
  const [step, setStep] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));

  // Step 1: Basic
  const [name, setName] = useState(editComponent?.name ?? '');
  const [partNumber, setPartNumber] = useState(editComponent?.part_number ?? '');
  const [series, setSeries] = useState(editComponent?.series ?? '');
  const [manufacturer, setManufacturer] = useState(editComponent?.manufacturer ?? '');
  const [categoryId, setCategoryId] = useState(editComponent?.category_id ?? '');
  const [description, setDescription] = useState(editComponent?.description ?? '');

  // Step 2: Physical
  const [packageType, setPackageType] = useState(editComponent?.package_type ?? '');
  const [dimensionsMm, setDimensionsMm] = useState(editComponent?.dimensions_mm ?? '');
  const [weightG, setWeightG] = useState(editComponent?.weight_g?.toString() ?? '');
  const [tempMin, setTempMin] = useState(editComponent?.operating_temp_min?.toString() ?? '');
  const [tempMax, setTempMax] = useState(editComponent?.operating_temp_max?.toString() ?? '');
  const [voltMin, setVoltMin] = useState(editComponent?.voltage_min?.toString() ?? '');
  const [voltMax, setVoltMax] = useState(editComponent?.voltage_max?.toString() ?? '');
  const [rohsCompliant, setRohsCompliant] = useState(editComponent?.rohs_compliant ?? true);

  // Step 3: Specs JSON
  const [specsText, setSpecsText] = useState(
    editComponent?.specs && Object.keys(editComponent.specs).length > 0
      ? JSON.stringify(editComponent.specs, null, 2)
      : '{\n  \n}'
  );

  // Step 4: Resources
  const [tagsInput, setTagsInput] = useState(editComponent?.tags?.join(', ') ?? '');
  const [datasheetUrl, setDatasheetUrl] = useState(editComponent?.datasheet_url ?? '');
  const [imageUrl, setImageUrl] = useState(editComponent?.image_url ?? '');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Gallery images: array of {label, src, uploading}
  type GalleryEntry = { label: string; src: string; uploading: boolean };

  // Default image roles per category slug
  const CATEGORY_ROLES: Record<string, string[]> = {
    microcontroller:    ['Top View', 'Pin Diagram', 'PCB Footprint', 'Application Circuit'],
    sbc:                ['Board Overview', 'GPIO Pinout', 'Connector Layout', 'Application Setup'],
    transistor:         ['Package View', 'Pinout', 'I-V Characteristic Curve', 'Circuit Symbol'],
    sensor:             ['Top View', 'Wiring Diagram', 'Output Chart', 'Application Circuit'],
    'op-amp':           ['Package View', 'Pinout', 'Transfer Curve', 'Typical Application'],
    'power-regulator':  ['Package View', 'Pinout', 'Efficiency Curve', 'Application Circuit'],
    communication:      ['Module View', 'Antenna Layout', 'Block Diagram', 'Wiring Example'],
    display:            ['Front View', 'Connector Pinout', 'Pixel Layout', 'Wiring Example'],
    default:            ['Top View', 'Pin Diagram', 'Schematic Symbol', 'Application Circuit'],
  };

  function getRolesForCategory(catId: string): string[] {
    const cat = categories.find((c) => c.id === catId);
    const slug = cat?.slug ?? 'default';
    return CATEGORY_ROLES[slug] ?? CATEGORY_ROLES.default;
  }

  function buildGallery(roles: string[], saved?: { label: string; src: string }[]): GalleryEntry[] {
    return roles.map((label) => {
      const found = saved?.find((g) => g.label === label);
      return { label, src: found?.src ?? '', uploading: false };
    });
  }

  function initGallery(): GalleryEntry[] {
    const saved = (editComponent?.specs as Record<string, unknown>)?._gallery;
    if (Array.isArray(saved) && saved.length > 0) {
      // Edit mode: restore exactly what was saved (labels + srcs)
      return (saved as { label: string; src: string }[]).map((g) => ({
        label: g.label,
        src: g.src,
        uploading: false,
      }));
    }
    return buildGallery(getRolesForCategory(editComponent?.category_id ?? ''));
  }

  const [gallery, setGallery] = useState<GalleryEntry[]>(initGallery);

  // When category changes, update gallery labels (keep existing srcs by position)
  const prevCategoryRef = React.useRef(categoryId);
  React.useEffect(() => {
    if (prevCategoryRef.current === categoryId) return;
    prevCategoryRef.current = categoryId;
    const newRoles = getRolesForCategory(categoryId);
    setGallery((prev) => newRoles.map((label, i) => ({
      label,
      src: prev[i]?.src ?? '',
      uploading: false,
    })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const minioBaseUrl = String(import.meta.env.VITE_MINIO_URL ?? '').replace(/\/$/, '');
  const minioBucket = String(import.meta.env.VITE_MINIO_BUCKET ?? 'eletronic-component').trim();

  function goTo(i: number) {
    if (i < step || visited.has(i)) {
      setStep(i);
      return;
    }
    if (validateStep(step)) {
      setVisited((v) => new Set([...v, i]));
      setStep(i);
      setError('');
    }
  }

  function validateStep(s: number): boolean {
    if (s === 0 && !name.trim()) {
      setError('Component name is required.');
      return false;
    }
    if (s === 2) {
      try { JSON.parse(specsText); } catch {
        setError('Invalid JSON format.');
        return false;
      }
    }
    setError('');
    return true;
  }

  function handleNext() {
    if (step < STEPS.length - 1) goTo(step + 1);
  }

  function handleBack() {
    if (step > 0) { setStep(step - 1); setError(''); }
  }

  function handleFormatJSON() {
    try {
      setSpecsText(JSON.stringify(JSON.parse(specsText), null, 2));
      setError('');
    } catch {
      setError('JSON is invalid and cannot be formatted.');
    }
  }

  async function handleUploadImage(file: File) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setError('');
    setUploadingImage(true);

    try {
      if (!minioBaseUrl || !minioBucket) {
        throw new Error('Missing VITE_MINIO_URL or VITE_MINIO_BUCKET in .env');
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectKey = `components/${Date.now()}-${safeName}`;
      const uploadUrl = `${minioBaseUrl}/${minioBucket}/${objectKey}`;

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Upload failed (${res.status}). ${text || 'Check bucket policy/CORS for public PUT.'}`);
      }

      setImageUrl(objectKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload image failed.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleUploadGalleryImage(index: number, file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError('');
    setGallery((prev) => prev.map((g, i) => i === index ? { ...g, uploading: true } : g));
    try {
      if (!minioBaseUrl || !minioBucket) throw new Error('Missing VITE_MINIO_URL or VITE_MINIO_BUCKET in .env');
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const objectKey = `components/${Date.now()}-${safeName}`;
      const uploadUrl = `${minioBaseUrl}/${minioBucket}/${objectKey}`;
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Upload failed (${res.status}). ${text || 'Check bucket policy/CORS.'}`);
      }
      setGallery((prev) => prev.map((g, i) => i === index ? { ...g, src: objectKey, uploading: false } : g));
      // Auto-set main image if not yet set
      if (!imageUrl) setImageUrl(objectKey);
    } catch (err) {
      setGallery((prev) => prev.map((g, i) => i === index ? { ...g, uploading: false } : g));
      setError(err instanceof Error ? err.message : 'Upload failed.');
    }
  }

  async function handleSubmit() {
    if (!validateStep(step)) return;
    let specs: Record<string, unknown> = {};
    try { specs = JSON.parse(specsText); } catch {
      setError('Invalid specs JSON format.');
      return;
    }
    setLoading(true);
    const payload = {
      name: name.trim(),
      series: series.trim(),
      manufacturer: manufacturer.trim(),
      category_id: categoryId || null,
      description: description.trim(),
      datasheet_url: datasheetUrl.trim(),
      image_url: imageUrl.trim() || gallery.find((g) => g.src)?.src || '',
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      specs: {
        ...specs,
        _gallery: gallery.filter((g) => g.src).map(({ label, src }) => ({ label, src })),
      },
      part_number: partNumber.trim() || name.trim(),
      package_type: packageType.trim() || null,
      dimensions_mm: dimensionsMm.trim() || null,
      weight_g: weightG ? parseFloat(weightG) : null,
      operating_temp_min: tempMin ? parseFloat(tempMin) : null,
      operating_temp_max: tempMax ? parseFloat(tempMax) : null,
      voltage_min: voltMin ? parseFloat(voltMin) : null,
      voltage_max: voltMax ? parseFloat(voltMax) : null,
      rohs_compliant: rohsCompliant,
    };
    const { error: dbError } = isEdit
      ? await supabase.from('components').update(payload).eq('id', editComponent!.id)
      : await supabase.from('components').insert(payload);
    setLoading(false);
    if (dbError) setError(dbError.message);
    else onSuccess();
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <Dialog open onClose={onCancel} size="lg">
      <DialogHeader className="border-b border-gray-100 pb-0 px-0 pt-0">
        {/* Header row */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-50 text-stone-600 flex items-center justify-center shrink-0">
              <Cpu size={16} />
            </div>
            <div>
              <DialogTitle className="text-sm font-medium text-gray-900">
                {isEdit ? 'Edit Component' : 'Add New Component'}
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">{isEdit ? 'Update component details' : 'Fill in the details to add to inventory'}</p>
            </div>
          </div>
          <DialogCloseButton onClose={onCancel} />
        </div>

        {/* Step indicator */}
        <div className="flex items-center border-t border-gray-100 bg-gray-50 px-5 overflow-x-auto scrollbar-none">
          {STEPS.map((s, i) => {
            const done = visited.has(i) && i < step;
            const active = i === step;
            return (
              <React.Fragment key={s.label}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  className={cn(
                    'flex items-center gap-1.5 py-2.5 text-xs transition-colors border-b-2 whitespace-nowrap',
                    active
                      ? 'text-stone-600 border-stone-500'
                      : done
                      ? 'text-emerald-600 border-transparent hover:text-emerald-700'
                      : 'text-gray-400 border-transparent hover:text-gray-500'
                  )}
                >
                  <span
                    className={cn(
                      'rounded-full border flex items-center justify-center text-[10px] font-medium shrink-0',
                      'w-[18px] h-[18px]',
                      active
                        ? 'bg-stone-50 border-stone-400 text-stone-600'
                        : done
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-600'
                        : 'border-gray-300 text-gray-400'
                    )}
                  >
                    {done ? <Check size={9} /> : i + 1}
                  </span>
                  {s.label}
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={12} className="text-gray-300 mx-2 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </DialogHeader>

      <DialogBody className="p-0">
        <div className="flex flex-col max-h-[calc(100vh-16rem)] overflow-hidden">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-4">

            {/* ── Step 0: Basic ── */}
            {step === 0 && (
              <>
                <SectionLabel icon={<Info size={12} />} text="General Information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <FieldLabel required>Component Name</FieldLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. ESP32-WROOM-32"
                      autoFocus
                    />
                  </div>
                  <div>
                    <FieldLabel>Part Number</FieldLabel>
                    <Input
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      placeholder="e.g. ESP32-WROOM-32E"
                    />
                  </div>
                  <div>
                    <FieldLabel>Series</FieldLabel>
                    <Input
                      value={series}
                      onChange={(e) => setSeries(e.target.value)}
                      placeholder="e.g. ESP32"
                    />
                  </div>
                  <div>
                    <FieldLabel>Manufacturer</FieldLabel>
                    <Input
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      placeholder="e.g. Espressif"
                    />
                  </div>
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <Select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="h-9"
                    >
                      <option value="">Select category...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description of functions, features, or applications..."
                      rows={2}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-100 focus:border-stone-400 resize-none placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── Step 1: Physical ── */}
            {step === 1 && (
              <>
                <SectionLabel icon={<Package size={12} />} text="Physical & Environmental Specs" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FieldLabel>Package Type</FieldLabel>
                    <Input
                      value={packageType}
                      onChange={(e) => setPackageType(e.target.value)}
                      placeholder="e.g. LCC-38, QFN-24"
                    />
                  </div>
                  <div>
                    <FieldLabel>Dimensions (mm)</FieldLabel>
                    <Input
                      value={dimensionsMm}
                      onChange={(e) => setDimensionsMm(e.target.value)}
                      placeholder="e.g. 18 × 20 × 3.2"
                    />
                  </div>
                  <div>
                    <FieldLabel>Weight (g)</FieldLabel>
                    <Input
                      value={weightG}
                      onChange={(e) => setWeightG(e.target.value)}
                      placeholder="e.g. 2.0"
                      type="number"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Temperature range */}
                <div>
                  <FieldLabel>Operating Temperature Range (°C)</FieldLabel>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <Input
                      value={tempMin}
                      onChange={(e) => setTempMin(e.target.value)}
                      placeholder="Min −40"
                      type="number"
                    />
                    <span className="text-xs text-gray-400 text-center">to</span>
                    <Input
                      value={tempMax}
                      onChange={(e) => setTempMax(e.target.value)}
                      placeholder="Max 125"
                      type="number"
                    />
                  </div>
                </div>

                {/* Voltage range */}
                <div>
                  <FieldLabel>Supply Voltage Range (V)</FieldLabel>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <Input
                      value={voltMin}
                      onChange={(e) => setVoltMin(e.target.value)}
                      placeholder="Min 3.0"
                      type="number"
                      step="0.1"
                    />
                    <span className="text-xs text-gray-400 text-center">to</span>
                    <Input
                      value={voltMax}
                      onChange={(e) => setVoltMax(e.target.value)}
                      placeholder="Max 3.6"
                      type="number"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* RoHS toggle */}
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Shield size={15} className="text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-800">RoHS Compliant</p>
                      <p className="text-xs text-gray-400">Hazardous substance free according to EU standards</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={rohsCompliant}
                    onClick={() => setRohsCompliant(!rohsCompliant)}
                    className={cn(
                      'relative w-9 h-5 rounded-full transition-colors shrink-0',
                      rohsCompliant ? 'bg-emerald-500' : 'bg-gray-200'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all',
                        rohsCompliant ? 'left-[18px]' : 'left-0.5'
                      )}
                    />
                  </button>
                </div>
              </>
            )}

            {/* ── Step 2: Specs JSON ── */}
            {step === 2 && (
              <>
                <div className="flex items-center justify-between">
                  <SectionLabel icon={<FileCode size={12} />} text="Technical Specifications (JSON)" />
                  <button
                    type="button"
                    onClick={handleFormatJSON}
                    className="text-xs text-stone-600 hover:text-stone-700 bg-stone-50 border border-stone-200 rounded-md px-2 py-1 transition-colors"
                  >
                    Format Code
                  </button>
                </div>
                <div className="flex items-start gap-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-700">
                  <Info size={12} className="shrink-0 mt-0.5" />
                  <span>
                    Provide custom key-value attributes. Example:{' '}
                    <code className="font-mono">"clock_mhz": 240</code>
                  </span>
                </div>
                <textarea
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                  rows={10}
                  spellCheck={false}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-xs font-mono bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-stone-400/30 focus:border-stone-400 resize-none"
                  placeholder={'{\n  "clock_speed_mhz": 240,\n  "flash_mb": 4\n}'}
                />
              </>
            )}

            {/* ── Step 3: Resources ── */}
            {step === 3 && (
              <>
                <SectionLabel icon={<Link2 size={12} />} text="Links & Search Tags" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <FieldLabel>Tags (separated by commas)</FieldLabel>
                    <Input
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="esp32, wifi, ble, iot"
                    />
                  </div>
                  <div>
                    <FieldLabel>Datasheet URL</FieldLabel>
                    <Input
                      value={datasheetUrl}
                      onChange={(e) => setDatasheetUrl(e.target.value)}
                      placeholder="https://example.com/datasheet.pdf"
                      type="url"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <FieldLabel>Component Images</FieldLabel>
                      {categoryId && (
                        <span className="text-[10px] text-stone-500 bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5">
                          Labels auto-set by category
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {gallery.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                          {/* Thumbnail */}
                          <div className="w-10 h-10 rounded-md border border-gray-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                            {entry.src ? (
                              <img
                                src={
                                  entry.src.startsWith('http')
                                    ? entry.src
                                    : `${String(import.meta.env.VITE_MINIO_URL ?? '').replace(/\/$/, '')}/${String(import.meta.env.VITE_MINIO_BUCKET ?? 'eletronic-component').trim()}/${entry.src}`
                                }
                                alt={entry.label}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon size={14} className="text-gray-300" />
                            )}
                          </div>

                          {/* Label (editable) + src input */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <input
                              value={entry.label}
                              onChange={(e) => setGallery((prev) => prev.map((g, i) => i === idx ? { ...g, label: e.target.value } : g))}
                              placeholder="Image role name..."
                              className="w-full text-[10px] font-medium text-stone-600 bg-transparent border-b border-dashed border-gray-300 focus:border-stone-400 focus:outline-none pb-0.5 placeholder:text-gray-300"
                            />
                            <Input
                              value={entry.src}
                              onChange={(e) => setGallery((prev) => prev.map((g, i) => i === idx ? { ...g, src: e.target.value } : g))}
                              placeholder="URL or object key..."
                              className="h-7 text-[11px]"
                            />
                          </div>

                          {/* Upload button */}
                          <label className={cn(
                            'shrink-0 inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-[10px] cursor-pointer transition-colors',
                            entry.uploading
                              ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                              : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                          )}>
                            <Upload size={11} />
                            {entry.uploading ? 'Uploading…' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={entry.uploading || loading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void handleUploadGalleryImage(idx, file);
                                e.currentTarget.value = '';
                              }}
                            />
                          </label>

                          {/* Remove slot button */}
                          <button
                            type="button"
                            onClick={() => setGallery((prev) => prev.filter((_, i) => i !== idx))}
                            className="shrink-0 p-1 rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                            title="Remove this image slot"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {/* Add slot button */}
                      <button
                        type="button"
                        onClick={() => setGallery((prev) => [...prev, { label: '', src: '', uploading: false }])}
                        className="w-full flex items-center justify-center gap-1.5 border border-dashed border-gray-300 rounded-lg py-2 text-[11px] text-gray-400 hover:text-stone-600 hover:border-stone-400 hover:bg-stone-50 transition-colors"
                      >
                        <span className="text-base leading-none">+</span> Add image slot
                      </button>

                      <p className="text-[10px] text-gray-400 pl-1">
                        Click the label name to rename it. First image with a src becomes the main image.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary card */}
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 text-xs text-gray-500 font-medium">
                    Review Summary Before Saving
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    {[
                      { label: 'Name', value: name },
                      { label: 'Manufacturer', value: manufacturer },
                      { label: 'Package', value: packageType },
                      { label: 'RoHS', value: rohsCompliant ? 'Yes ✓' : 'No' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-400 w-24 shrink-0">{row.label}</span>
                        <span className="text-xs text-gray-700 truncate">{row.value || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-5 mb-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
              <X size={12} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-3.5 flex items-center gap-2">
            {/* Progress dots */}
            <div className="flex items-center gap-1 mr-auto">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-colors',
                    i <= step ? 'bg-stone-500' : 'bg-gray-300'
                  )}
                />
              ))}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-white transition-colors"
              >
                <ChevronLeft size={13} /> Back
              </button>
            )}

            <button
              type="button"
              onClick={isLastStep ? handleSubmit : handleNext}
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              {loading ? (
                'Saving...'
              ) : isLastStep ? (
                <><Check size={13} /> {isEdit ? 'Update Component' : 'Save Component'}</>
              ) : (
                <>Next <ChevronRight size={13} /></>
              )}
            </button>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}

/* ─── Tiny helpers ─── */

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
      {icon}
      {text}
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs text-gray-600 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}