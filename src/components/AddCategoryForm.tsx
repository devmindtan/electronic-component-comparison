import React, { useMemo, useState } from 'react';
import { FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { categoryIcons } from '../lib/utils';
import type { Category } from '../lib/supabase';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogBody, DialogCloseButton } from './ui/Dialog';

interface AddCategoryFormProps {
  categories: Category[];
  onChanged: () => void;
  onCancel: () => void;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function AddCategoryForm({ categories, onChanged, onCancel }: AddCategoryFormProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('cpu');
  const [description, setDescription] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const iconOptions = useMemo(() => Object.keys(categoryIcons).sort(), []);
  const SelectedIcon = categoryIcons[icon] ?? categoryIcons.cpu;

  function handleNameChange(next: string) {
    setName(next);
    if (!slug.trim()) {
      setSlug(slugify(next));
    }
  }

  function resetForm() {
    setName('');
    setSlug('');
    setIcon('cpu');
    setDescription('');
    setEditingCategoryId(null);
    setError('');
  }

  function handleEdit(category: Category) {
    setEditingCategoryId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setIcon(category.icon || 'cpu');
    setDescription(category.description || '');
    setError('');
  }

  async function handleDelete(category: Category) {
    const ok = window.confirm(`Delete category "${category.name}"? Components in this category will be uncategorized.`);
    if (!ok) return;

    setLoading(true);
    setError('');

    const { error: dbError } = await supabase.from('categories').delete().eq('id', category.id);

    setLoading(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    if (editingCategoryId === category.id) {
      resetForm();
    }

    await onChanged();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextName = name.trim();
    const nextSlug = slugify(slug || name);

    if (!nextName) {
      setError('Category name is required.');
      return;
    }

    if (!nextSlug) {
      setError('Slug is required.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      name: nextName,
      slug: nextSlug,
      icon,
      description: description.trim(),
    };

    const { error: dbError } = editingCategoryId
      ? await supabase.from('categories').update(payload).eq('id', editingCategoryId)
      : await supabase.from('categories').insert(payload);

    setLoading(false);

    if (dbError) {
      if (dbError.message.toLowerCase().includes('duplicate key')) {
        setError('This slug already exists. Please use another slug/name.');
        return;
      }

      setError(dbError.message);
      return;
    }

    resetForm();
    await onChanged();
  }

  return (
    <Dialog open onClose={onCancel} size="md">
      <DialogHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-50 text-stone-600 flex items-center justify-center">
            <FolderPlus size={16} />
          </div>
          <div>
            <DialogTitle className="text-sm font-semibold">Add New Category</DialogTitle>
            <p className="text-xs text-gray-400 mt-0.5">Create a new category for components</p>
          </div>
        </div>
        <DialogCloseButton onClose={onCancel} />
      </DialogHeader>

      <DialogBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Category Name</label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Oscillator"
              autoFocus
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Slug</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="e.g. oscillator"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Icon</label>
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map((iconKey) => {
                  const IconComponent = categoryIcons[iconKey] ?? categoryIcons.cpu;
                  const active = icon === iconKey;

                  return (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setIcon(iconKey)}
                      disabled={loading}
                      className={[
                        'h-14 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all',
                        active
                          ? 'border-stone-500 bg-stone-50 text-stone-700 ring-1 ring-stone-300'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      <IconComponent size={16} />
                      <span className="text-[10px] leading-none">{iconKey}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                <SelectedIcon size={14} className="text-stone-600" />
                Selected icon: <span className="font-medium text-gray-800">{icon}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-400 resize-none"
              placeholder="Short description for this category"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
            {editingCategoryId && (
              <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>New Category</Button>
            )}
            <Button type="submit" isLoading={loading}>{editingCategoryId ? 'Update Category' : 'Create Category'}</Button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-700 mb-2">Existing Categories</div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {categories.length === 0 && (
              <div className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg px-3 py-2">
                No categories yet.
              </div>
            )}

            {categories.map((category) => {
              const IconComponent = categoryIcons[category.icon] ?? categoryIcons.cpu;
              const active = editingCategoryId === category.id;

              return (
                <div
                  key={category.id}
                  className={[
                    'flex items-center justify-between gap-2 border rounded-lg px-3 py-2',
                    active ? 'border-stone-300 bg-stone-50' : 'border-gray-200 bg-white',
                  ].join(' ')}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 inline-flex items-center justify-center shrink-0">
                      <IconComponent size={13} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-800 truncate">{category.name}</div>
                      <div className="text-[11px] text-gray-400 truncate">{category.slug}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      onClick={() => handleEdit(category)}
                      className="h-7 px-2"
                    >
                      <Pencil size={12} />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={loading}
                      onClick={() => void handleDelete(category)}
                      className="h-7 px-2"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogBody>
    </Dialog>
  );
}