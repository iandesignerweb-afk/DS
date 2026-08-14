import React, { useState } from 'react';
import {
  User,
  Shield,
  Mail,
  Phone,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Calendar,
  Save,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, role, permissions, updateUserProfile, updateUserPassword, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'PASSWORD'>('DETAILS');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !profile) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const { error } = await updateUserProfile({
      full_name: fullName,
      phone: phone || null,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    }
    setIsLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'A confirmação de senha não coincide.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await updateUserPassword(newPassword);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800 mb-5">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg ${
              role === 'ADMIN'
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/20'
                : 'bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-amber-500/20'
            }`}
          >
            {profile.full_name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{profile.full_name}</h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  role === 'ADMIN'
                    ? 'bg-blue-950 text-blue-300 border-blue-800/60'
                    : 'bg-amber-950 text-amber-300 border-amber-800/60'
                }`}
              >
                {role === 'ADMIN' ? 'ADMINISTRADOR' : 'VENDEDOR'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{profile.email}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('DETAILS');
              setMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'DETAILS'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Meus Dados
          </button>
          <button
            onClick={() => {
              setActiveTab('PASSWORD');
              setMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'PASSWORD'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Alterar Senha
          </button>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab 1: Profile Details Form */}
        {activeTab === 'DETAILS' ? (
          <form onSubmit={handleUpdateProfile} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="(11) 98888-7777"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Quick Permissions Summary */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs text-slate-400">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Privilégios da sua Conta:
              </span>
              <div className="flex items-center justify-between text-[11px]">
                <span>Visualização de Preço de Custo:</span>
                <span className={permissions.canViewCostPrices ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {permissions.canViewCostPrices ? 'Liberado' : 'Bloqueado (RLS)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>Acesso a Fornecedores:</span>
                <span className={permissions.canViewSuppliers ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {permissions.canViewSuppliers ? 'Liberado' : 'Bloqueado (RLS)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span>Gestão de Usuários:</span>
                <span className={permissions.canManageUsers ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {permissions.canManageUsers ? 'Liberado' : 'Bloqueado'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Encerrar Sessão</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Change Password Form */
          <form onSubmit={handleUpdatePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nova Senha de Acesso
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Atualizando...' : 'Atualizar Senha'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
