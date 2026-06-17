import { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Cpu, SlidersHorizontal, LayoutGrid, LayoutList, X, GitCompare } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Component, Category } from './lib/supabase';
import { categoryIcons } from './lib/utils';
import { ComponentCard } from './components/ComponentCard';
import { ComponentDetailPage } from './components/ComponentDetailPage';
import { CompareDrawer, CompareTable } from './components/CompareView';
import { AddComponentForm } from './components/AddComponentForm';
import { AddCategoryForm } from './components/AddCategoryForm';
import { Sidebar, DEFAULT_FILTERS, type FilterState } from './components/Sidebar';
import { Button } from './components/ui/Button';
import { Tooltip } from './components/ui/Tooltip';

const MAX_COMPARE = 4;

export default function App() {
  const [components, setComponents] = useState<Component[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [compareList, setCompareList] = useState<Component[]>([]);
  const [showCompareTable, setShowCompareTable] = useState(false);
  const [detailComponent, setDetailComponent] = useState<Component | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  /* KÍCH HOẠT: State quản lý số lượng hiển thị (Mặc định ban đầu là 20 card) */
  const MAX_VISIBLE_COUNT = 20;
  const [visibleCount, setVisibleCount] = useState(MAX_VISIBLE_COUNT);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [catRes, compRes] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('components').select('*, categories(id, name, slug, icon, description, created_at)').order('name'),
    ]);
    if (!catRes.error && catRes.data) setCategories(catRes.data);
    if (!compRes.error && compRes.data) setComponents(compRes.data as Component[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = components.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      c.name.toLowerCase().includes(q) ||
      c.series.toLowerCase().includes(q) ||
      c.manufacturer.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.part_number ?? '').toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q));

    const matchesCategory = !filters.category || c.category_id === filters.category;
    const matchesSeries = !filters.series || c.series === filters.series;
    const matchesMfr = !filters.manufacturer || c.manufacturer === filters.manufacturer;
    const matchesPkg = !filters.packageType || c.package_type === filters.packageType;
    const matchesRohs = !filters.rohsOnly || c.rohs_compliant;

    const matchesTemp = filters.tempRange === 'any' ? true
      : filters.tempRange === 'commercial' ? (c.operating_temp_min ?? -999) >= 0 && (c.operating_temp_max ?? 0) >= 70
      : filters.tempRange === 'industrial' ? (c.operating_temp_min ?? 0) <= -40 && (c.operating_temp_max ?? 0) >= 85
      : (c.operating_temp_min ?? 0) <= -55 && (c.operating_temp_max ?? 0) >= 125;

    const matchesVoltage = filters.voltageRange === 'any' ? true
      : filters.voltageRange === '1v8' ? (c.voltage_min ?? 99) <= 1.8 && (c.voltage_max ?? 0) >= 1.8
      : filters.voltageRange === '3v3' ? (c.voltage_min ?? 99) <= 3.3 && (c.voltage_max ?? 0) >= 3.3
      : (c.voltage_min ?? 99) <= 5.0 && (c.voltage_max ?? 0) >= 5.0;

    return matchesSearch && matchesCategory && matchesSeries && matchesMfr &&
      matchesPkg && matchesRohs && matchesTemp && matchesVoltage;
  });

  function toggleCompare(component: Component) {
    setCompareList((prev) => {
      if (prev.find((c) => c.id === component.id)) return prev.filter((c) => c.id !== component.id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, component];
    });
  }

  const hasActiveFilters = !!(searchQuery || Object.entries(filters).some(([k, v]) =>
    k === 'rohsOnly' ? v === true : v !== '' && v !== 'any'
  ));

  function clearAll() {
    setSearchQuery('');
    setFilters(DEFAULT_FILTERS);
    /* KÍCH HOẠT: Reset lại số lượng hiển thị ban đầu khi clear filter */
    setVisibleCount(MAX_VISIBLE_COUNT);
  }

  return (
    <div className="min-h-screen bg-stone-100 font-sans">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-[60px]">
        <div className="max-w-screen-2xl mx-auto h-full px-4 sm:px-6 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-1.5 bg-stone-600 rounded-lg shadow-sm">
              <Cpu size={16} className="text-white" />
            </div>
            <div 
            className="hidden sm:block cursor-pointer select-none"
            onClick={() => {
              // Nếu bạn có hàm setDetailComponent(null) để đóng trang chi tiết
              if (typeof setDetailComponent === 'function') setDetailComponent(null);
              // Nếu muốn xóa luôn bộ lọc và ô search khi về home
              // if (typeof clearAll === 'function') clearAll();
            }}
          >
            <h1 className="text-sm font-bold text-gray-900 leading-tight hover:text-stone-600 transition-colors">
              ElectroParts
            </h1>
            <p className="text-[10px] text-gray-400 leading-tight">Component Catalog</p>
          </div>
          </div>

          <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1 shrink-0" />

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, part number, manufacturer…"
              className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-400 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 shrink-0">
            {compareList.length >= 2 && (
              <Button size="sm" onClick={() => setShowCompareTable(true)} className="hidden sm:flex h-8 text-xs gap-1">
                <GitCompare size={13} /> Compare ({compareList.length})
              </Button>
            )}

            {/* View toggle — desktop */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
              <Tooltip content="Grid view">
                <button onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-stone-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <LayoutGrid size={14} />
                </button>
              </Tooltip>
              <Tooltip content="List view">
                <button onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-stone-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  <LayoutList size={14} />
                </button>
              </Tooltip>
            </div>

            {/* Mobile filter */}
            <Tooltip content="Filters">
              <Button variant="outline" size="icon" className="lg:hidden relative h-8 w-8" onClick={() => setShowMobileSidebar(true)}>
                <SlidersHorizontal size={14} />
                {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2 h-2 bg-stone-500 rounded-full border-2 border-white" />}
              </Button>
            </Tooltip>

            {/* Add Part */}
            <Button variant="outline" size="sm" onClick={() => setShowAddCategoryForm(true)} className="h-8 text-xs gap-1">
              <Plus size={13} /> <span className="hidden sm:inline">Add Category</span>
            </Button>

            <Button size="sm" onClick={() => setShowAddForm(true)} className="h-8 text-xs gap-1">
              <Plus size={13} /> <span className="hidden sm:inline">Add Part</span>
            </Button>
          </div>
        </div>
      </header>

      {detailComponent ? (
        <div className="max-w-screen-2xl mx-auto">
          <ComponentDetailPage
            component={detailComponent}
            onBack={() => setDetailComponent(null)}
            onToggleCompare={toggleCompare}
            isSelected={!!compareList.find((c) => c.id === detailComponent.id)}
          />
        </div>
      ) : (
      <>
      {/* ── Category pills ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[60px] z-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => { setFilters((f) => ({ ...f, category: '' })); setVisibleCount(MAX_VISIBLE_COUNT); }}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
              !filters.category ? 'bg-stone-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${!filters.category ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>
              {components.length}
            </span>
          </button>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.icon] ?? categoryIcons['cpu'];
            const active = filters.category === cat.id;
            const count = components.filter((c) => c.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => { setFilters((f) => ({ ...f, category: active ? '' : cat.id })); setVisibleCount(MAX_VISIBLE_COUNT); }}
                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  active ? 'bg-stone-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon size={11} /> {cat.name}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div className="max-w-screen-2xl mx-auto flex">
        <Sidebar
          categories={categories}
          components={components}
          filters={filters}
          onChange={(newFilters) => { setFilters(newFilters); setVisibleCount(MAX_VISIBLE_COUNT); }}
          onClear={clearAll}
          resultCount={filtered.length}
          isOpen={showMobileSidebar}
          onClose={() => setShowMobileSidebar(false)}
        />

        <main className="flex-1 min-w-0 px-4 sm:px-6 py-5 pb-32">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              {loading ? (
                <span className="text-sm text-gray-400">Loading…</span>
              ) : (
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-gray-900">{filtered.length}</span> component{filtered.length !== 1 ? 's' : ''}
                  {hasActiveFilters && ' found'}
                </p>
              )}
              {hasActiveFilters && (
                <button onClick={clearAll} className="flex items-center gap-1 text-xs text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors">
                  <X size={11} /> Clear
                </button>
              )}
            </div>
            {/* Mobile view toggle */}
            <div className="flex sm:hidden items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
              <button onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-stone-600' : 'text-gray-500'}`}>
                <LayoutGrid size={13} />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-stone-600' : 'text-gray-500'}`}>
                <LayoutList size={13} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'
              : 'space-y-2.5'
            }>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`bg-white rounded-xl border border-gray-100 animate-pulse ${viewMode === 'list' ? 'h-20' : 'h-72'}`} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="p-4 bg-gray-100 rounded-2xl mb-4">
                <Search size={28} className="text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">No components found</h3>
              <p className="text-sm text-gray-400 mb-4">Try adjusting your search or filters</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearAll}>
                  <X size={13} /> Clear all filters
                </Button>
              )}
            </div>
          ) : (
            /* KÍCH HOẠT: Toàn bộ vùng hiển thị danh sách linh kiện bọc chung một wrapper logic Xem thêm */
            <div className="space-y-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {filtered.slice(0, visibleCount).map((component) => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      isSelected={!!compareList.find((c) => c.id === component.id)}
                      viewMode="grid"
                      onToggleCompare={toggleCompare}
                      onViewDetails={setDetailComponent}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.slice(0, visibleCount).map((component) => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      isSelected={!!compareList.find((c) => c.id === component.id)}
                      viewMode="list"
                      onToggleCompare={toggleCompare}
                      onViewDetails={setDetailComponent}
                    />
                  ))}
                </div>
              )}

              {/* KÍCH HOẠT: Nút Xem thêm dùng chung cho cả 2 chế độ View Mode */}
              {visibleCount < filtered.length && (
                <div className="flex flex-col items-center justify-center pt-5 pb-2 border-t border-gray-200/60">
                  <p className="text-xs text-gray-400 mb-3 font-medium">
                    Đang hiển thị {Math.min(visibleCount, filtered.length)} trên tổng số {filtered.length} linh kiện
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="px-6 py-2 h-10 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 active:scale-95 transition-all shadow-sm rounded-xl"
                  >
                    Xem thêm linh kiện
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      </>
      )}

      {/* Compare drawer */}
      {!showCompareTable && (
        <CompareDrawer
          components={compareList}
          onRemove={(id) => setCompareList((p) => p.filter((c) => c.id !== id))}
          onClear={() => setCompareList([])}
          onOpenTable={() => setShowCompareTable(true)}
        />
      )}

      {/* Compare full-screen table */}
      {showCompareTable && (
        <CompareTable
          components={compareList}
          onRemove={(id) => setCompareList((p) => p.filter((c) => c.id !== id))}
          onClose={() => setShowCompareTable(false)}
        />
      )}

      {/* Add form */}
      {showAddForm && (
        <AddComponentForm
          categories={categories}
          onSuccess={() => { setShowAddForm(false); fetchData(); }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {showAddCategoryForm && (
        <AddCategoryForm
          categories={categories}
          onChanged={fetchData}
          onCancel={() => setShowAddCategoryForm(false)}
        />
      )}
    </div>
  );
}