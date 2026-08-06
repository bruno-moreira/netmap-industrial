import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  ip_address: z.string().ip({ version: 'v4' }).optional().or(z.literal('')),
  brand: z.string().max(80).optional(),
  model: z.string().max(80).optional(),
  rack_id: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  snmp_community: z.string().max(100).optional(),
  snmp_version: z.enum(['v1', 'v2c', 'v3']).optional().default('v2c'),
  snmp_user: z.string().max(100).optional(),
  snmp_auth_protocol: z.preprocess((val) => (val === '' ? null : val), z.enum(['md5', 'sha', 'sha224', 'sha256', 'sha384', 'sha512']).optional().nullable()),
  snmp_auth_password: z.string().max(100).optional(),
  snmp_priv_protocol: z.preprocess((val) => (val === '' ? null : val), z.enum(['des', 'aes', 'aes256b', 'aes256r']).optional().nullable()),
  snmp_priv_password: z.string().max(100).optional(),
  port_count: z.coerce.number().int().min(4).max(96).optional().default(24),
  uplink_count: z.coerce.number().int().min(0).max(16).optional().default(0),
});

export type SwitchFormData = z.infer<typeof schema>;

interface SwitchFormProps {
  defaultValues?: Partial<SwitchFormData>;
  onSubmit: (data: SwitchFormData) => void;
  isLoading?: boolean;
}

const inputClass = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none transition-colors';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </label>
  );
}

export function SwitchForm({ defaultValues, onSubmit, isLoading }: SwitchFormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SwitchFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      port_count: 24,
      uplink_count: 0,
      snmp_version: 'v2c',
      ...defaultValues,
    },
  });

  const snmpVersion = watch('snmp_version');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Nome" error={errors.name?.message}>
        <input {...register('name')} className={inputClass} placeholder="SW-EXEMPLO-01" />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="IP Address" error={errors.ip_address?.message}>
          <input {...register('ip_address')} className={inputClass} placeholder="192.168.1.10" />
        </Field>

        <Field label="Portas Comuns" error={errors.port_count?.message}>
          <select {...register('port_count', { valueAsNumber: true })} className={inputClass}>
            <option value={4}>4</option>
            <option value={8}>8</option>
            <option value={16}>16</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={96}>96</option>
          </select>
        </Field>

        <Field label="Portas Uplink/GBIC" error={errors.uplink_count?.message}>
          <select {...register('uplink_count', { valueAsNumber: true })} className={inputClass}>
            <option value={0}>0</option>
            <option value={2}>2</option>
            <option value={4}>4</option>
            <option value={8}>8</option>
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

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-4">
        <h3 className="text-sm font-medium text-slate-800 dark:text-slate-300">Configuração SNMP</h3>
        
        <Field label="Versão SNMP" error={errors.snmp_version?.message}>
          <select {...register('snmp_version')} className={inputClass}>
            <option value="v1">v1</option>
            <option value="v2c">v2c</option>
            <option value="v3">v3</option>
          </select>
        </Field>

        {(snmpVersion === 'v1' || snmpVersion === 'v2c') && (
          <Field label="SNMP Community" error={errors.snmp_community?.message}>
            <input {...register('snmp_community')} className={inputClass} placeholder="public" />
          </Field>
        )}

        {snmpVersion === 'v3' && (
          <>
            <Field label="SNMP User" error={errors.snmp_user?.message}>
              <input {...register('snmp_user')} className={inputClass} placeholder="admin" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Auth Protocol" error={errors.snmp_auth_protocol?.message}>
                <select {...register('snmp_auth_protocol')} className={inputClass}>
                  <option value="">Nenhum</option>
                  <option value="md5">MD5</option>
                  <option value="sha">SHA</option>
                  <option value="sha224">SHA-224</option>
                  <option value="sha256">SHA-256</option>
                  <option value="sha384">SHA-384</option>
                  <option value="sha512">SHA-512</option>
                </select>
              </Field>

              <Field label="Auth Password" error={errors.snmp_auth_password?.message}>
                <input type="password" {...register('snmp_auth_password')} className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Priv Protocol" error={errors.snmp_priv_protocol?.message}>
                <select {...register('snmp_priv_protocol')} className={inputClass}>
                  <option value="">Nenhum</option>
                  <option value="des">DES</option>
                  <option value="aes">AES</option>
                  <option value="aes256b">AES-256-B</option>
                  <option value="aes256r">AES-256-R</option>
                </select>
              </Field>

              <Field label="Priv Password" error={errors.snmp_priv_password?.message}>
                <input type="password" {...register('snmp_priv_password')} className={inputClass} />
              </Field>
            </div>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-cyan-600 py-2.5 font-medium text-white hover:bg-cyan-500 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Salvando...' : 'Salvar Switch'}
      </button>
    </form>
  );
}
