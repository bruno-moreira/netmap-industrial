import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { DeviceType } from '@/types/network';

const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  device_type_id: z.coerce.number().positive(),
  ip_address: z.string().ip({ version: 'v4' }).optional().or(z.literal('')),
  mac_address: z.string().regex(MAC_REGEX, 'MAC Address inválido').optional().or(z.literal('')),
  location: z.string().optional(),
  status: z.enum(['online', 'offline', 'unknown', 'maintenance']).optional(),
});

export type DeviceFormData = z.infer<typeof schema>;

interface DeviceFormProps {
  types: DeviceType[];
  defaultValues?: Partial<DeviceFormData>;
  onSubmit: (data: DeviceFormData) => void;
  isLoading?: boolean;
  includeSwitch?: boolean;
}

export function DeviceForm({ types, defaultValues, onSubmit, isLoading, includeSwitch = false }: DeviceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(schema),
    values: defaultValues ? {
      status: 'unknown',
      ...defaultValues,
    } as DeviceFormData : undefined,
    defaultValues: {
      status: 'unknown',
      ...defaultValues,
    },
  });

  // Filtrar tipos para remover Switch se necessário
  const filteredTypes = includeSwitch
    ? types
    : types.filter(t => t.name.toLowerCase() !== 'switch');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Nome" error={errors.name?.message}>
        <input {...register('name')} className={inputClass} />
      </Field>
      <Field label="Tipo" error={errors.device_type_id?.message}>
        <select {...register('device_type_id')} className={inputClass}>
          <option value="">Selecione...</option>
          {filteredTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="IP" error={errors.ip_address?.message}>
        <input {...register('ip_address')} className={inputClass} placeholder="192.168.1.10" />
      </Field>
      <Field label="MAC Address" error={errors.mac_address?.message}>
        <input {...register('mac_address')} className={inputClass} placeholder="AA:BB:CC:DD:EE:FF" />
      </Field>
      <Field label="Localização / setor" error={errors.location?.message}>
        <input {...register('location')} className={inputClass} />
      </Field>
      <Field label="Status">
        <select {...register('status')} className={inputClass}>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="unknown">Desconhecido</option>
          <option value="maintenance">Manutenção</option>
        </select>
      </Field>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-cyan-600 py-2.5 font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
      >
        {isLoading ? 'Salvando...' : 'Salvar equipamento'}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm text-slate-400">
      {label}
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none';
