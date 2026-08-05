import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, RefreshCw, Upload, X, Check } from 'lucide-react';
import type { DeviceType, DeviceMetadata } from '@/types/network';
import { devicesApi } from '@/services/api';

const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  device_type_id: z.coerce.number().positive('Tipo de equipamento é obrigatório'),
  ip_address: z.string().ip({ version: 'v4' }).optional().or(z.literal('')),
  mac_address: z.string().regex(MAC_REGEX, 'MAC Address inválido').optional().or(z.literal('')),
  location: z.string().optional(),
  status: z.enum(['online', 'offline', 'unknown', 'maintenance']).optional(),
  snapshot_url: z.string().optional(),
  camera_username: z.string().optional(),
  camera_password: z.string().optional(),
  image_url: z.string().optional(),
});

export type DeviceFormData = z.infer<typeof schema> & {
  metadata?: DeviceMetadata;
};

interface DeviceFormProps {
  types: DeviceType[];
  defaultValues?: Partial<DeviceFormData> & { metadata?: DeviceMetadata };
  onSubmit: (data: DeviceFormData) => void;
  isLoading?: boolean;
  includeSwitch?: boolean;
}

export function DeviceForm({ types, defaultValues, onSubmit, isLoading, includeSwitch = false }: DeviceFormProps) {
  const meta = defaultValues?.metadata || {};
  
  const [imageUrl, setImageUrl] = useState<string>(meta.image_url || defaultValues?.image_url || '');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [captureSuccess, setCaptureSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(schema),
    values: defaultValues ? {
      status: 'unknown',
      ...defaultValues,
      snapshot_url: meta.snapshot_url || defaultValues.snapshot_url || '',
      camera_username: meta.camera_username || defaultValues.camera_username || '',
      camera_password: meta.camera_password || defaultValues.camera_password || '',
      image_url: meta.image_url || defaultValues.image_url || '',
    } as DeviceFormData : undefined,
    defaultValues: {
      status: 'unknown',
      ...defaultValues,
      snapshot_url: meta.snapshot_url || '',
      camera_username: meta.camera_username || '',
      camera_password: meta.camera_password || '',
      image_url: meta.image_url || '',
    },
  });

  const selectedTypeId = watch('device_type_id');
  const selectedType = types.find((t) => t.id === Number(selectedTypeId));
  const isCamera = selectedType?.slug === 'camera' || selectedType?.name.toLowerCase().includes('câmera') || selectedType?.name.toLowerCase().includes('camera');

  const ipAddress = watch('ip_address');
  const snapshotUrl = watch('snapshot_url');
  const cameraUsername = watch('camera_username');
  const cameraPassword = watch('camera_password');

  const filteredTypes = includeSwitch
    ? types
    : types.filter((t) => t.name.toLowerCase() !== 'switch');

  // Trata o envio do arquivo manual
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCaptureError('Por favor selecione um arquivo de imagem válido (JPG ou PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setImageUrl(dataUri);
      setValue('image_url', dataUri);
      setCaptureError(null);
      setCaptureSuccess(true);
      setTimeout(() => setCaptureSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  }

  // Testa e busca snapshot diretamente do IP/URL da câmera
  async function handleAutoCapture() {
    setIsCapturing(true);
    setCaptureError(null);
    setCaptureSuccess(false);

    try {
      const result = await devicesApi.fetchSnapshotPreview({
        ip_address: ipAddress || undefined,
        snapshot_url: snapshotUrl || undefined,
        camera_username: cameraUsername || undefined,
        camera_password: cameraPassword || undefined,
      });

      setImageUrl(result.image_data_uri);
      setValue('image_url', result.image_data_uri);
      setCaptureSuccess(true);
      setTimeout(() => setCaptureSuccess(false), 3000);
    } catch (err: any) {
      setCaptureError(err.response?.data?.error || err.response?.data?.message || err.message || 'Falha ao buscar snapshot da câmera.');
    } finally {
      setIsCapturing(false);
    }
  }

  function handleFormSubmit(data: DeviceFormData) {
    const metadataPayload: DeviceMetadata = {
      ...(defaultValues?.metadata || {}),
      image_url: imageUrl || undefined,
      snapshot_url: data.snapshot_url || undefined,
      camera_username: data.camera_username || undefined,
      camera_password: data.camera_password || undefined,
      last_snapshot_at: imageUrl ? new Date().toISOString() : undefined,
    };

    onSubmit({
      ...data,
      metadata: metadataPayload,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Field label="Nome" error={errors.name?.message}>
        <input {...register('name')} className={inputClass} placeholder="Ex: Câmera Portaria Principal" />
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
        <input {...register('ip_address')} className={inputClass} placeholder="10.107.70.85" />
      </Field>
      <Field label="MAC Address" error={errors.mac_address?.message}>
        <input {...register('mac_address')} className={inputClass} placeholder="AA:BB:CC:DD:EE:FF" />
      </Field>
      <Field label="Localização / setor" error={errors.location?.message}>
        <input {...register('location')} className={inputClass} placeholder="Ex: Galpão 02 / Portaria" />
      </Field>
      <Field label="Status">
        <select {...register('status')} className={inputClass}>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="unknown">Desconhecido</option>
          <option value="maintenance">Manutenção</option>
        </select>
      </Field>

      {/* Seção Especial para Câmeras & Snapshot de Imagem */}
      <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-medium text-sm">
          <Camera className="h-4 w-4" />
          <span>Imagem / Snapshot da Câmera</span>
        </div>

        {isCamera && (
          <>
            <Field label="URL do Snapshot HTTP (Intelbras / ONVIF)">
              <input
                {...register('snapshot_url')}
                className={inputClass}
                placeholder={ipAddress ? `http://${ipAddress}/cgi-bin/snapshot.cgi` : 'http://10.107.70.85/cgi-bin/snapshot.cgi'}
              />
              <span className="text-xs text-slate-500 mt-1 block">
                Default Intelbras: <code className="text-slate-400">/cgi-bin/snapshot.cgi</code>
              </span>
            </Field>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Usuário Câmera (Opcional)">
                <input {...register('camera_username')} className={inputClass} placeholder="admin" />
              </Field>
              <Field label="Senha Câmera (Opcional)">
                <input {...register('camera_password')} type="password" className={inputClass} placeholder="••••" />
              </Field>
            </div>
          </>
        )}

        {/* Botão de Captura Automática por IP */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={handleAutoCapture}
            disabled={isCapturing || (!ipAddress && !snapshotUrl)}
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCapturing ? 'animate-spin' : ''}`} />
            {isCapturing ? 'Capturando via IP...' : 'Capturar Snapshot do IP'}
          </button>

          <label className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer">
            <Upload className="h-3.5 w-3.5" />
            Upload Foto / Print (Manual)
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {captureSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <Check className="h-3.5 w-3.5" /> Imagem atualizada com sucesso!
          </div>
        )}

        {captureError && (
          <p className="text-xs text-red-400 border border-red-900/50 bg-red-950/30 p-2 rounded">
            {captureError}
          </p>
        )}

        {/* Preview da Imagem */}
        {imageUrl ? (
          <div className="relative mt-2 rounded-lg border border-slate-800 overflow-hidden bg-black/40">
            <img src={imageUrl} alt="Snapshot da câmera" className="w-full max-h-48 object-contain" />
            <button
              type="button"
              onClick={() => {
                setImageUrl('');
                setValue('image_url', '');
              }}
              className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1 text-slate-400 hover:text-red-400"
              title="Remover imagem"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-xs text-slate-500">
            Nenhuma imagem capturada. Use o botão acima para buscar via IP ou faça o upload manual.
          </div>
        )}
      </div>

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
