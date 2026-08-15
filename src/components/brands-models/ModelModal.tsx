import React, { useState, useEffect } from 'react';
import { X, Smartphone, Check, AlertCircle, Loader2 } from 'lucide-react';

interface BrandOption {
  id: string;
  name: string;
  is_active: boolean;
}

interface ModelModalProps {
  isOpen: boolean;
  modelToEdit?: any | null;
  brands: BrandOption[];
  preselectedBrandId?: string | null;
  onClose: () => void;
  onSuccess: (model: any) => void;
}

export const ModelModal: React.FC<ModelModalProps> = ({
  isOpen,
  modelToEdit,
  brands,
  preselectedBrandId,
  onClose,
  onSuccess,
}) => {
  const [brandId, setBrandId] = useState('');
  const [name, setName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (modelToEdit) {
      setBrandId(modelToEdit.brand_id || '');
      setName(modelToEdit.name || '');
      setModelNumber(modelToEdit.model_number || '');
      setIsActive(modelToEdit.is_active !== false);
    } else {
      setBrandId(preselectedBrandId && preselectedBrandId !== 'all' ? preselectedBrandId : (brands[0]?.id || ''));
      setName('');
      setModelNumber('');
      setIsActive(true);
    }
    setErrorMessage(null);
  }, [modelToEdit, isOpen, preselectedBrandId, brands]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!brandId) {
      setErrorMessage('Por favor, selecione uma marca para o modelo.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('O nome do modelo do aparelho é obrigatório.');
      return;
    }

    setLoading(true);

    try {
      const url = modelToEdit ? `/api/models/${modelToEdit.id}` : '/api/models';
      const method = modelToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: brandId,
          name: name.trim(),
          model_number: modelNumber.trim() || null,
          is_active: isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar modelo.');
      }

      onSuccess(data.model);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="model_modal_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="model_modal_card"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-200 flex items-center justify-center text-blue-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {modelToEdit ? 'Editar Modelo' : 'Novo Modelo de Aparelho'}
              </h2>
              <p className="text-xs text-slate-500">
                {modelToEdit ? `Alterando modelo ${modelToEdit.name}` : 'Vincule modelos à marca para o fluxo de OS'}
              </p>
            </div>
          </div>
          <button
            id="btn_close_model_modal"
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Brand Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Marca do Aparelho <span className="text-rose-500">*</span>
            </label>
            <select
              id="select_model_brand"
              required
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            >
              <option value="" disabled>Selecione a marca...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {!b.is_active ? '(Inativa)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome Comercial do Modelo <span className="text-rose-500">*</span>
            </label>
            <input
              id="input_model_name"
              type="text"
              required
              placeholder="Ex: iPhone 14 Pro Max, Galaxy S23 5G, Moto G60..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Model Number / Factory Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Código / Número de Fábrica (Opcional)
            </label>
            <input
              id="input_model_number"
              type="text"
              placeholder="Ex: A2894, SM-S911B, XT2135-1..."
              value={modelNumber}
              onChange={(e) => setModelNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Útil para identificar carcaças, displays e componentes específicos.
            </p>
          </div>

          {/* Active status */}
          <div className="pt-2">
            <label className="relative flex items-center gap-2 cursor-pointer select-none">
              <input
                id="checkbox_model_active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">
                Modelo Ativo no Sistema (Aparece na abertura de OS)
              </span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            id="btn_cancel_model_modal"
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            id="btn_submit_model_modal"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{modelToEdit ? 'Salvar Alterações' : 'Cadastrar Modelo'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
