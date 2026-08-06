import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { usersApi, rolesApi, type CreateUserPayload } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';

export function UsersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!user || user.role !== 'root') {
    navigate('/dashboard');
    return null;
  }

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowForm(false);
      setEditingUser(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.update(editingUser.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowForm(false);
      setEditingUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Partial<CreateUserPayload> = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      roleId: Number(formData.get('roleId')),
    };
    const pass = formData.get('password') as string;
    if (pass) {
      payload.password = pass;
    }
    
    if (editingUser) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload as CreateUserPayload);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none transition-colors';

  return (
    <div>
      <Header
        title="Usuários"
        subtitle="Gerenciar usuários do sistema"
        actions={
          <button
            type="button"
            onClick={() => {
              if (showForm && !editingUser) {
                setShowForm(false);
              } else {
                setEditingUser(null);
                setShowForm(true);
              }
            }}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
          >
            <Plus className="h-4 w-4" /> Novo Usuário
          </button>
        }
      />

      {showForm && (
        <div className="mb-8 max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors">
          <h3 className="mb-4 font-medium text-slate-900 dark:text-white">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
              <input
                name="name"
                type="text"
                required
                defaultValue={editingUser?.name}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={editingUser?.email}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Senha {editingUser && <span className="text-xs text-slate-500">(deixe em branco para manter)</span>}
              </label>
              <input
                name="password"
                type="password"
                required={!editingUser}
                minLength={6}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
              <select
                name="roleId"
                required
                defaultValue={editingUser?.role_id}
                className={inputClass}
              >
                <option value="">Selecione...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {usersLoading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-left text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{u.email}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{u.role_name}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        u.is_active
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {u.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUser(u);
                          setShowForm(true);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {u.id !== user.id && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja remover este usuário?')) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
