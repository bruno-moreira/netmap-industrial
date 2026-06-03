import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { usersApi, rolesApi, type CreateUserPayload } from '@/services/api';
import { useAuthStore } from '@/stores/useAuthStore';

export function UsersPage() {
  const [showForm, setShowForm] = useState(false);
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

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: CreateUserPayload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      roleId: Number(formData.get('roleId')),
    };
    createMutation.mutate(payload);
  };

  return (
    <div>
      <Header
        title="Usuários"
        subtitle="Gerenciar usuários do sistema"
        actions={
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            <Plus className="h-4 w-4" /> Novo Usuário
          </button>
        }
      />

      {showForm && (
        <div className="mb-8 max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 font-medium text-white">Novo Usuário</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400">Nome</label>
              <input
                name="name"
                type="text"
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400">E-mail</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400">Senha</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400">Role</label>
              <select
                name="roleId"
                required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                <option value="">Selecione...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full rounded-lg bg-cyan-600 py-2.5 font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Salvando...' : 'Salvar Usuário'}
            </button>
          </form>
        </div>
      )}

      {usersLoading ? (
        <p className="text-slate-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-left text-slate-400">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">E-mail</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-800 hover:bg-slate-900/50">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role_name}</td>
                  <td className="p-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        u.is_active
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {u.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(u.id)}
                      disabled={u.id === user.id}
                      className="text-slate-500 hover:text-red-400 disabled:opacity-30"
                      aria-label="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
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
