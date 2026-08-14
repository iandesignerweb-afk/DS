import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  KeyRound,
  RefreshCw,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  Filter,
  Check,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { UserProfile, UserRole, CreateUserData } from '../types';

export const UserManagementModule: React.FC = () => {
  const {
    role,
    profile: currentProfile,
    fetchUsersList,
    createUserAdmin,
    updateUserAdmin,
    toggleUserStatusAdmin,
  } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form State for Create/Edit
  const [formData, setFormData] = useState<CreateUserData>({
    full_name: '',
    email: '',
    phone: '',
    role: 'SELLER',
    is_active: true,
    password: '',
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { users: fetchedUsers, error } = await fetchUsersList();
      if (error) {
        setActionMessage({ type: 'error', text: error.message });
      } else {
        setUsers(fetchedUsers);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setActionMessage({ type: 'error', text: error.message || 'Erro ao carregar usuários' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [role]);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.is_active) ||
      (statusFilter === 'INACTIVE' && !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenCreate = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'SELLER',
      is_active: true,
      password: '',
    });
    setActionMessage(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      is_active: user.is_active,
    });
    setActionMessage(null);
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionMessage(null);

    const { user, error } = await createUserAdmin(formData);

    if (error) {
      setActionMessage({ type: 'error', text: error.message });
      setActionLoading(false);
    } else {
      setActionMessage({ type: 'success', text: 'Usuário cadastrado com sucesso!' });
      setIsCreateOpen(false);
      await loadUsers();
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setActionLoading(true);
    setActionMessage(null);

    const { error } = await updateUserAdmin(editingUser.id, {
      full_name: formData.full_name,
      phone: formData.phone || null,
      role: formData.role,
      is_active: formData.is_active,
    });

    if (error) {
      setActionMessage({ type: 'error', text: error.message });
      setActionLoading(false);
    } else {
      setActionMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
      setIsEditOpen(false);
      await loadUsers();
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    if (user.id === currentProfile?.id && user.is_active) {
      alert('Você não pode desativar seu próprio usuário ativo.');
      return;
    }

    const confirmMsg = user.is_active
      ? `Deseja desativar o acesso de ${user.full_name}?`
      : `Deseja reativar o acesso de ${user.full_name}?`;

    if (!window.confirm(confirmMsg)) return;

    const { success, error } = await toggleUserStatusAdmin(user.id, user.is_active);
    if (!success || error) {
      setActionMessage({ type: 'error', text: error?.message || 'Falha ao alterar status do usuário.' });
    } else {
      setActionMessage({
        type: 'success',
        text: `Status do usuário ${user.full_name} alterado para ${!user.is_active ? 'ATIVO' : 'INATIVO'}.`,
      });
      await loadUsers();
    }
  };

  if (role !== 'ADMIN') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-2xl mx-auto my-12 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Acesso Restrito: Apenas Administradores
        </h3>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          O gerenciamento de usuários, permissões e concessão de papéis exige privilégios de Administrador.
          Seu perfil atual é <strong className="text-amber-400">VENDEDOR</strong>, bloqueado por políticas RLS no PostgreSQL.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-800/40">
                Módulo Administrativo
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800/40">
                Supabase Auth & Profiles
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Users className="w-6 h-6 text-blue-400" />
              <span>Gerenciamento de Usuários</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Controle central de credenciais, papéis de acesso (ADMIN / VENDEDOR) e status de ativação da equipe.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadUsers}
              disabled={isLoading}
              title="Recarregar lista"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Usuário</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionMessage && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between ${
              actionMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-white font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {/* Role Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-500 px-2 font-semibold">Perfil:</span>
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-2.5 py-1 rounded font-medium ${
                roleFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('ADMIN')}
              className={`px-2.5 py-1 rounded font-medium ${
                roleFilter === 'ADMIN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin ({users.filter((u) => u.role === 'ADMIN').length})
            </button>
            <button
              onClick={() => setRoleFilter('SELLER')}
              className={`px-2.5 py-1 rounded font-medium ${
                roleFilter === 'SELLER' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Vendedor ({users.filter((u) => u.role === 'SELLER').length})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-500 px-2 font-semibold">Status:</span>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-1 rounded ${
                statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-2 py-1 rounded ${
                statusFilter === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ativos
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-2 py-1 rounded ${
                statusFilter === 'INACTIVE' ? 'bg-rose-950 text-rose-400 border border-rose-800/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inativos
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Nome do Usuário</th>
                <th className="py-3.5 px-4">E-mail Corporativo</th>
                <th className="py-3.5 px-4">Perfil de Acesso</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Data de Cadastro</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Carregando usuários do sistema...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <span>Nenhum usuário encontrado com os filtros selecionados.</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u.id === currentProfile?.id;
                  const formattedDate = new Date(u.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              u.role === 'ADMIN'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                                : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            }`}
                          >
                            {u.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200 flex items-center gap-1.5">
                              <span>{u.full_name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-blue-950 text-blue-400 px-1.5 py-0.2 rounded border border-blue-800/50">
                                  Você
                                </span>
                              )}
                            </div>
                            {u.phone && (
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5" />
                                {u.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60">
                            <Shield className="w-3 h-3 text-blue-400" />
                            ADMINISTRADOR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                            <UserCheck className="w-3 h-3 text-amber-400" />
                            VENDEDOR
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={`Clique para ${u.is_active ? 'desativar' : 'ativar'}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            u.is_active
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/60'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800/50 hover:bg-rose-900/60'
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Ativo</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>Inativo</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Editar Usuário"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create User */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold">Cadastrar Novo Usuário</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roberto Gomes da Silva"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  required
                  placeholder="roberto.vendas@dualsystem.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Telefone / WhatsApp (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="(11) 98888-7777"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Senha Inicial de Acesso
                </label>
                <input
                  type="password"
                  placeholder="Defina a senha (mínimo 6 caracteres)"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Perfil de Acesso
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      formData.role === 'ADMIN'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>ADMINISTRADOR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      formData.role === 'SELLER'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>VENDEDOR</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="create_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <label htmlFor="create_is_active" className="text-xs text-slate-300">
                  Usuário ativo e autorizado a realizar login
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {actionLoading ? 'Salvando...' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {isEditOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold">Editar Dados do Usuário</h3>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  E-mail Corporativo (Fixado)
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="(11) 98888-7777"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alterar Perfil de Acesso
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      formData.role === 'ADMIN'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>ADMINISTRADOR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'SELLER' })}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${
                      formData.role === 'SELLER'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>VENDEDOR</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
                />
                <label htmlFor="edit_is_active" className="text-xs text-slate-300">
                  Status Ativo (desmarque para suspender o acesso deste usuário)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {actionLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
