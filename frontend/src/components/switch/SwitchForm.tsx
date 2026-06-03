import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
// Unused type import kept for potential future use
// import type { CreateSwitchPayload } from '@/types/network';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  ip_address: z.string().ip({ version: 'v4' }).optional().or(z.literal('')),
  brand: z.string().max(80).optional(),
  model: z.string().max(80).optional(),
  rack_id: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  snmp_community: z.string().max(100).optional(),
  port_count: z.coerce.number().int().min(4).max(96).optional().default(24),
});

export type SwitchFormData = z.infer<typeof schema>;

interface SwitchFormProps {
  defaultValues?: Partial<SwitchFormData>;
  onSubmit: (data: SwitchFormData) => void;
  isLoading?: boolean;
}

const inputClass = 'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-slate-400">
      {label}
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
  );
}

export function SwitchForm({ defaultValues, onSubmit, isLoading }: SwitchFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SwitchFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      port_count: 24,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Nome" error={errors.name?.message}>
        <input {...register('name')} className={inputClass} placeholder="SW-EXEMPLO-01" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="IP Address" error={errors.ip_address?.message}>
          <input {...register('ip_address')} className={inputClass} placeholder="192.168.1.10" />
        </Field>

        <Field label="Port Count" error={errors.port_count?.message}>
          <select {...register('port_count', { valueAsNumber: true })} className={inputClass}>
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={96}>96</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Marca" error={errors.brand?.message}>
          <input {...register('brand')} className={inputClass} placeholder="HP, Cisco, etc." />
        </Field>

        <Field label="Modelo" error={errors.model?.message}>
          <input {...register('model')} className={inputClass} placeholder="2530-24, etc." />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Rack ID" error={errors.rack_id?.message}>
          <input {...register('rack_id')} className={inputClass} placeholder="RACK-A1" />
        </Field>

        <Field label="Localização" error={errors.location?.message}>
          <input {...register('location')} className={inputClass} placeholder="Administrativo" />
        </Field>
      </div>

      <Field label="SNMP Community" error={errors.snmp_community?.message}>
        <input {...register('snmp_community')} className={inputClass} placeholder="public" />
      </Field>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-cyan-600 py-2.5 font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
      >
        {isLoading ? 'Salvando...' : 'Salvar Switch'}
      </button>
    </form>
  );
}
