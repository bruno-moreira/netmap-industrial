import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  vlan_number: z.coerce.number().min(1).max(4094),
  name: z.string().min(1, 'Nome obrigatório'),
  color: z.string().default('#3b82f6'),
  description: z.string().optional(),
});

export type VlanFormData = z.infer<typeof schema>;

interface VlanFormProps {
  onSubmit: (data: VlanFormData) => void;
  isLoading?: boolean;
}

export function VlanForm({ onSubmit, isLoading }: VlanFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VlanFormData>({
    resolver: zodResolver(schema),
    defaultValues: { color: '#3b82f6' },
  });

  const color = watch('color');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <label className="block text-sm text-slate-400">
        Número da VLAN
        <input type="number" {...register('vlan_number')} className={inputClass} />
        {errors.vlan_number && <p className="mt-1 text-xs text-red-400">{errors.vlan_number.message}</p>}
      </label>
      <label className="block text-sm text-slate-400">
        Nome
        <input {...register('name')} className={inputClass} placeholder="Administração" />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
      </label>
      <label className="block text-sm text-slate-400">
        Cor
        <div className="mt-1 flex items-center gap-3">
          <input type="color" {...register('color')} className="h-10 w-14 cursor-pointer rounded border-0" />
          <span className="h-8 flex-1 rounded-lg border border-slate-700" style={{ backgroundColor: color }} />
        </div>
      </label>
      <label className="block text-sm text-slate-400">
        Descrição
        <textarea {...register('description')} className={inputClass} rows={2} />
      </label>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-cyan-600 py-2.5 font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
      >
        {isLoading ? 'Salvando...' : 'Cadastrar VLAN'}
      </button>
    </form>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none';
