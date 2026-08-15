import React, { useState } from 'react';
import {
  Smartphone,
  Plus,
  Trash2,
  Edit2,
  Search,
  Layers,
  CheckCircle,
  Tag,
  FolderPlus,
} from 'lucide-react';
import { Brand, DeviceModel } from '../../types';

interface BrandsModelsModuleProps {
  brands: Brand[];
  models: DeviceModel[];
  onRefresh: () => void;
  userRole: string;
}

export const BrandsModelsModule: React.FC<BrandsModelsModuleProps> = ({
  brands,
  models,
  onRefresh,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [modelBrandId, setModelBrandId] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelType, setNewModelType] = useState<'SMARTPHONE' | 'TABLET' | 'SMARTWATCH' | 'OTHER'>('SMARTPHONE');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered models
  const filteredModels = models.filter((m) => {
    const matchBrand = selectedBrandId === 'ALL' || m.brand_id === selectedBrandId;
    const matchSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchBrand && matchSearch;
  });

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrandName }),
      });
      if (res.ok) {
        setNewBrandName('');
        setIsAddBrandOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelBrandId || !newModelName.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: modelBrandId,
          name: newModelName,
          type: newModelType,
        }),
      });
      if (res.ok) {
        setNewModelName('');
        setIsAddModelOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a marca "${name}"?`)) return;
    try {
      const res = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteModel = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o modelo "${name}"?`)) return;
    try {
      const res = await fetch(`/api/models/${id}`, { method: 'DELETE' });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Marcas & Modelos de Celulares
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Base oficial de dispositivos pronta para seleção rápida na abertura de Ordens de Serviço
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddBrandOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            + Nova Marca
          </button>
          <button
            onClick={() => {
              if (brands.length > 0) setModelBrandId(brands[0].id);
              setIsAddModelOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            + Novo Modelo
          </button>
        </div>
      </div>

      {/* Grid Layout: Brands sidebar & Models list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Brands selector column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Marcas Cadastradas ({brands.length})
              </span>
              <button
                onClick={() => setIsAddBrandOpen(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                + Adicionar
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedBrandId('ALL')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  selectedBrandId === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Todas as Marcas</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    selectedBrandId === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                >
                  {models.length} modelos
                </span>
              </button>

              {brands.map((brand) => {
                const count = models.filter((m) => m.brand_id === brand.id).length;
                const isSelected = selectedBrandId === brand.id;
                return (
                  <div
                    key={brand.id}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all group ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedBrandId(brand.id)}
                      className="flex-1 text-left flex items-center gap-2 py-1"
                    >
                      <Smartphone className="w-3.5 h-3.5 opacity-70" />
                      <span>{brand.name}</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      >
                        {count}
                      </span>
                      <button
                        onClick={() => handleDeleteBrand(brand.id, brand.name)}
                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                          isSelected ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:text-rose-600'
                        }`}
                        title="Excluir marca"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Models list column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar modelo (ex: iPhone 13, Galaxy S22)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Exibindo <strong>{filteredModels.length}</strong> de {models.length} modelos
              </span>
            </div>

            {/* Grid of Model cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredModels.length > 0 ? (
                filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all group flex items-start justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {model.brand_name}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {model.name}
                      </h4>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-[9px] font-semibold text-slate-600 dark:text-slate-300 rounded">
                        {model.type === 'SMARTPHONE' ? '📱 Smartphone' : model.type === 'TABLET' ? '📟 Tablet' : '⌚ Smartwatch'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteModel(model.id, model.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Excluir modelo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs italic">
                  Nenhum modelo encontrado com os filtros aplicados.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Brand */}
      {isAddBrandOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cadastrar Nova Marca
            </h3>
            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Marca *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Asus, OnePlus, Huawei..."
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddBrandOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Marca'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Model */}
      {isAddModelOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cadastrar Novo Modelo
            </h3>
            <form onSubmit={handleCreateModel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Marca *
                </label>
                <select
                  required
                  value={modelBrandId}
                  onChange={(e) => setModelBrandId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Modelo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: iPhone 15 Pro Max, Galaxy Z Flip 5..."
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Dispositivo
                </label>
                <select
                  value={newModelType}
                  onChange={(e) => setNewModelType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="SMARTPHONE">📱 Smartphone (Celular)</option>
                  <option value="TABLET">📟 Tablet / iPad</option>
                  <option value="SMARTWATCH">⌚ Smartwatch / Apple Watch</option>
                  <option value="OTHER">🔌 Outro Dispositivo</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModelOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
