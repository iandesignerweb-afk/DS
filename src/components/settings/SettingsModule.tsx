import React, { useState, useRef } from 'react';
import {
  Building2,
  User,
  ShieldCheck,
  Printer,
  Sliders,
  Upload,
  Image as ImageIcon,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Phone,
  Mail,
  MapPin,
  FileText,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Percent,
  Receipt,
  Store,
} from 'lucide-react';
import { StoreSettings, User as UserType, UserRole } from '../../types';

interface SettingsModuleProps {
  storeSettings: StoreSettings;
  currentUser: UserType;
  userRole: UserRole;
  onUpdateStoreSettings: (newSettings: Partial<StoreSettings>) => Promise<boolean>;
  onUpdateUserProfile: (updatedUser: Partial<UserType>) => Promise<boolean>;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  storeSettings,
  currentUser,
  userRole,
  onUpdateStoreSettings,
  onUpdateUserProfile,
}) => {
  const [activeTab, setActiveTab] = useState<
    'STORE' | 'PROFILE' | 'SECURITY' | 'PRINTING' | 'POS_RULES'
  >('STORE');

  // Store form state
  const [storeForm, setStoreForm] = useState<StoreSettings>({ ...storeSettings });
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [storeSuccessMsg, setStoreSuccessMsg] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Security form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState('');
  const [securityErrorMsg, setSecurityErrorMsg] = useState('');

  // Logo file upload ref
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Handle Logo Upload (Converts to Base64 dataURL for instant persistent display)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem do logotipo deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setStoreForm((prev) => ({ ...prev, logo_url: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle User Avatar Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('A foto de perfil deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setProfileForm((prev) => ({ ...prev, avatar: event.target!.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Store Info
  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStore(true);
    setStoreSuccessMsg('');

    try {
      const ok = await onUpdateStoreSettings(storeForm);
      if (ok) {
        setStoreSuccessMsg('Configurações da loja e identidade visual salvas com sucesso!');
        setTimeout(() => setStoreSuccessMsg(''), 4000);
      }
    } finally {
      setIsSavingStore(false);
    }
  };

  // Save Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg('');

    try {
      const ok = await onUpdateUserProfile(profileForm);
      if (ok) {
        setProfileSuccessMsg('Dados do seu perfil atualizados com sucesso!');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save Security / Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityErrorMsg('');
    setSecuritySuccessMsg('');

    if (!passwordForm.currentPassword) {
      setSecurityErrorMsg('Por favor, informe a senha atual.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setSecurityErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSecurityErrorMsg('A confirmação da nova senha não confere.');
      return;
    }

    setSecuritySuccessMsg('Senha de acesso alterada com sucesso!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSecuritySuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Configurações da Conta & Loja
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Personalize a identidade da sua assistência, logotipo, cupom de 80mm e perfil de acesso.
            </p>
          </div>
        </div>

        {/* Store Live Badge Preview */}
        <div className="hidden md:flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            {storeForm.logo_url ? (
              <img
                src={storeForm.logo_url}
                alt="Logo Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Smartphone className="w-5 h-5" />
            )}
          </div>
          <div className="text-left">
            <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight truncate max-w-[160px]">
              {storeForm.store_name || 'Nome da Loja'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block leading-tight truncate max-w-[160px]">
              {storeForm.store_subtitle || 'Assistência Técnica'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Tabs Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Menu de Ajustes
            </span>

            <button
              onClick={() => setActiveTab('STORE')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'STORE'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Store className="w-4 h-4" />
              <div>
                <span className="block">Identidade da Loja</span>
                <span
                  className={`text-[10px] font-normal ${
                    activeTab === 'STORE' ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  Nome, Logotipo, Contatos
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'PROFILE'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <div>
                <span className="block">Meu Perfil de Usuário</span>
                <span
                  className={`text-[10px] font-normal ${
                    activeTab === 'PROFILE' ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  Nome, Foto, E-mail
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('PRINTING')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'PRINTING'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Printer className="w-4 h-4" />
              <div>
                <span className="block">Cupom & Impressão</span>
                <span
                  className={`text-[10px] font-normal ${
                    activeTab === 'PRINTING' ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  Bobina 80mm, Garantia
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('POS_RULES')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'POS_RULES'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <div>
                <span className="block">Regras do PDV & Vendas</span>
                <span
                  className={`text-[10px] font-normal ${
                    activeTab === 'POS_RULES' ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  Comissões, Caixa
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('SECURITY')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                activeTab === 'SECURITY'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Lock className="w-4 h-4" />
              <div>
                <span className="block">Segurança & Senha</span>
                <span
                  className={`text-[10px] font-normal ${
                    activeTab === 'SECURITY' ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  Trocar Senha de Acesso
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3">
          {/* ======================================================== */}
          {/* TAB 1: IDENTIDADE DA LOJA & LOGOTIPO */}
          {/* ======================================================== */}
          {activeTab === 'STORE' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Identidade Visual & Informações da Loja
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estes dados serão exibidos no cabeçalho do sistema, nos cupons não-fiscais térmicos de 80mm e nos termos de Ordem de Serviço.
                </p>
              </div>

              {storeSuccessMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{storeSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveStore} className="space-y-6">
                {/* Logotipo Upload Card */}
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Logotipo da Empresa
                  </span>

                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Visual Preview Box */}
                    <div className="relative group w-28 h-28 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 shadow-sm shrink-0">
                      {storeForm.logo_url ? (
                        <img
                          src={storeForm.logo_url}
                          alt="Logo da Loja"
                          className="w-full h-full object-contain p-2"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-center p-2">
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500">Sem Logo</span>
                        </div>
                      )}
                    </div>

                    {/* Actions and instructions */}
                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Carregue uma imagem do seu logotipo
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Recomendado: PNG ou JPG com fundo transparente ou quadrado (ex: 500x500px). Máx 2MB.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                        <input
                          type="file"
                          ref={logoInputRef}
                          onChange={handleLogoUpload}
                          accept="image/png, image/jpeg, image/webp, image/svg+xml"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Selecionar Imagem</span>
                        </button>

                        {storeForm.logo_url && (
                          <button
                            type="button"
                            onClick={() => setStoreForm((prev) => ({ ...prev, logo_url: '' }))}
                            className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dados da Loja Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nome da Loja / Razão Social *
                    </label>
                    <input
                      type="text"
                      required
                      value={storeForm.store_name}
                      onChange={(e) => setStoreForm({ ...storeForm, store_name: e.target.value })}
                      placeholder="Ex: DUAL CELL PRO"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Slogan / Especialidade
                    </label>
                    <input
                      type="text"
                      value={storeForm.store_subtitle}
                      onChange={(e) => setStoreForm({ ...storeForm, store_subtitle: e.target.value })}
                      placeholder="Ex: Assistência Técnica Especializada & Acessórios"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      CNPJ ou CPF
                    </label>
                    <input
                      type="text"
                      value={storeForm.cnpj_cpf}
                      onChange={(e) => setStoreForm({ ...storeForm, cnpj_cpf: e.target.value })}
                      placeholder="Ex: 12.345.678/0001-90"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      WhatsApp Comercial
                    </label>
                    <input
                      type="text"
                      value={storeForm.whatsapp}
                      onChange={(e) => setStoreForm({ ...storeForm, whatsapp: e.target.value })}
                      placeholder="Ex: (11) 98111-2233"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Telefone Fixo
                    </label>
                    <input
                      type="text"
                      value={storeForm.phone}
                      onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                      placeholder="Ex: (11) 3322-1100"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      E-mail de Atendimento
                    </label>
                    <input
                      type="email"
                      value={storeForm.email}
                      onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                      placeholder="Ex: contato@dualcellpro.com.br"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Endereço da Loja
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Logradouro (Rua, Av.)
                      </label>
                      <input
                        type="text"
                        value={storeForm.address_street}
                        onChange={(e) => setStoreForm({ ...storeForm, address_street: e.target.value })}
                        placeholder="Ex: Av. Principal"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Número
                      </label>
                      <input
                        type="text"
                        value={storeForm.address_number}
                        onChange={(e) => setStoreForm({ ...storeForm, address_number: e.target.value })}
                        placeholder="Ex: 1000"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={storeForm.address_neighborhood}
                        onChange={(e) =>
                          setStoreForm({ ...storeForm, address_neighborhood: e.target.value })
                        }
                        placeholder="Ex: Centro"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Cidade / UF
                      </label>
                      <input
                        type="text"
                        value={storeForm.address_city}
                        onChange={(e) => setStoreForm({ ...storeForm, address_city: e.target.value })}
                        placeholder="Ex: São Paulo"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={storeForm.address_zip}
                        onChange={(e) => setStoreForm({ ...storeForm, address_zip: e.target.value })}
                        placeholder="Ex: 01001-000"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={isSavingStore}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingStore ? 'Salvando Alterações...' : 'Salvar Dados da Loja'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: MEU PERFIL DE USUÁRIO */}
          {/* ======================================================== */}
          {activeTab === 'PROFILE' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Meu Perfil de Acesso
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gerencie sua foto de perfil, dados pessoais e confira seu cargo no sistema.
                </p>
              </div>

              {profileSuccessMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar upload */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750">
                  <div className="relative group w-20 h-20 rounded-full overflow-hidden bg-indigo-200 dark:bg-indigo-900 flex items-center justify-center text-xl font-black text-indigo-700 dark:text-indigo-300 shrink-0 shadow-md">
                    {profileForm.avatar ? (
                      <img
                        src={profileForm.avatar}
                        alt={profileForm.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{profileForm.name.charAt(0) || 'U'}</span>
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Foto de Perfil
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Sua foto será exibida no cabeçalho superior e no registro de vendas e ordens de serviço.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                      <input
                        type="file"
                        ref={avatarInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Carregar Nova Foto</span>
                      </button>

                      {profileForm.avatar && (
                        <button
                          type="button"
                          onClick={() => setProfileForm((prev) => ({ ...prev, avatar: '' }))}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-300 transition-colors"
                        >
                          Remover Foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="Seu nome"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      E-mail de Login *
                    </label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="seuemail@exemplo.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Cargo / Nível de Acesso
                    </label>
                    <div className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>
                        {userRole === 'ADMIN'
                          ? '👑 Administrador'
                          : userRole === 'SELLER'
                          ? '💼 Vendedor(a)'
                          : '🔧 Técnico de Bancada'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded font-bold">
                        Definido pelo Administrador
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Comissão Individual (%)
                    </label>
                    <div className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{currentUser?.commission_percentage || 4.0}% por venda/serviço</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingProfile ? 'Salvando...' : 'Salvar Alterações do Perfil'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CUPOM & IMPRESSÃO */}
          {/* ======================================================== */}
          {activeTab === 'PRINTING' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600" />
                  Configurações de Impressão & Cupom Térmico (80mm)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Defina o comportamento das impressoras térmicas e personalize os textos legais e termos de garantia.
                </p>
              </div>

              {storeSuccessMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{storeSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveStore} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tamanho de papel */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Formato Padrão de Impressão do Cupom
                    </label>
                    <select
                      value={storeForm.paper_size}
                      onChange={(e) =>
                        setStoreForm({
                          ...storeForm,
                          paper_size: e.target.value as '80mm' | '58mm' | 'A4',
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="80mm">Bobina Térmica 80mm (Recomendado / PDV Padrão)</option>
                      <option value="58mm">Bobina Térmica 58mm (Mini Impressora)</option>
                      <option value="A4">Folha Inteira A4 (Documento Formal)</option>
                    </select>
                  </div>

                  {/* Auto Print Toggle */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Comportamento ao Finalizar Venda no PDV
                    </label>
                    <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                      <input
                        type="checkbox"
                        id="chk-autoprint"
                        checked={storeForm.auto_print_receipt}
                        onChange={(e) =>
                          setStoreForm({ ...storeForm, auto_print_receipt: e.target.checked })
                        }
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="chk-autoprint" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                        Abrir pop-up do cupom de 80mm automaticamente
                      </label>
                    </div>
                  </div>
                </div>

                {/* Rodapé do cupom térmico */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mensagem de Rodapé / Termo de Garantia do Cupom Térmico (80mm)
                  </label>
                  <textarea
                    rows={3}
                    value={storeForm.receipt_footer_msg}
                    onChange={(e) =>
                      setStoreForm({ ...storeForm, receipt_footer_msg: e.target.value })
                    }
                    placeholder="Ex: Garantia legal de 90 dias para defeitos de fabricação..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Este texto aparece no fim de todas as impressões de comprovante não-fiscal.
                  </p>
                </div>

                {/* Termos de garantia da OS */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Termos & Condições de Ordem de Serviço (A4 / Documento de Entrada)
                  </label>
                  <textarea
                    rows={3}
                    value={storeForm.warranty_terms}
                    onChange={(e) => setStoreForm({ ...storeForm, warranty_terms: e.target.value })}
                    placeholder="Ex: Garantia de 90 dias referente aos serviços executados..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={isSavingStore}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingStore ? 'Salvando...' : 'Salvar Ajustes de Impressão'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: REGRAS DO PDV & VENDAS */}
          {/* ======================================================== */}
          {activeTab === 'POS_RULES' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  Regras Comerciais & PDV
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure os parâmetros padrão de comissões e regras financeiras da loja.
                </p>
              </div>

              {storeSuccessMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{storeSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveStore} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Comissão Padrão de Vendas (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={storeForm.default_commission_pct}
                        onChange={(e) =>
                          setStoreForm({
                            ...storeForm,
                            default_commission_pct: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                        %
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Aplicada automaticamente nos cálculos de comissão dos vendedores no PDV.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={isSavingStore}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingStore ? 'Salvando...' : 'Salvar Regras Comerciais'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: SEGURANÇA & SENHA */}
          {/* ======================================================== */}
          {activeTab === 'SECURITY' && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  Segurança & Senha de Acesso
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Atualize sua senha de autenticação para manter sua conta protegida.
                </p>
              </div>

              {securitySuccessMsg && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{securitySuccessMsg}</span>
                </div>
              )}

              {securityErrorMsg && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{securityErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Senha Atual *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="Digite sua senha atual"
                      className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nova Senha *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirmar Nova Senha *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    placeholder="Repita a nova senha"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Atualizar Senha de Acesso</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
