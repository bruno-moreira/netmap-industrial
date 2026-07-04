import { z } from 'zod';

const deviceStatus = z.enum(['online', 'offline', 'unknown', 'maintenance']);
const portStatus = z.enum(['free', 'connected', 'error', 'disabled']);

const createDeviceSchema = z.object({
  device_type_id: z.coerce.number().int().positive(),
  name: z.string().min(1).max(150),
  ip_address: z.string().ip({ version: 'v4' }).optional().nullable(),
  mac_address: z.string().max(17).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  status: deviceStatus.optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateDeviceSchema = createDeviceSchema.partial();

const createSwitchSchema = z.object({
  name: z.string().min(1).max(100),
  ip_address: z.string().ip({ version: 'v4' }).optional().nullable(),
  brand: z.string().max(80).optional().nullable(),
  model: z.string().max(80).optional().nullable(),
  rack_id: z.string().max(50).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  snmp_community: z.string().max(100).optional().nullable(),
  port_count: z.coerce.number().int().min(4).max(96).optional(),
  uplink_count: z.coerce.number().int().min(0).max(16).optional(),
});

const updateSwitchSchema = createSwitchSchema.partial();

const createVlanSchema = z.object({
  vlan_number: z.coerce.number().int().min(1).max(4094),
  name: z.string().min(1).max(100),
  color: z.string().max(20).optional(),
  description: z.string().optional().nullable(),
});

const updateVlanSchema = createVlanSchema.partial();

const updatePortSchema = z.object({
  status: portStatus.optional(),
  port_type: z.enum(['access', 'hybrid', 'trunk']).optional(),
  untagged_vlan_id: z.coerce.number().int().positive().optional().nullable(),
  tagged_vlan_ids: z.array(z.coerce.number().int().positive()).optional(),
  mac_address: z.string().max(17).optional().nullable(),
  connected_device_id: z.coerce.number().int().positive().optional().nullable(),
  label: z.string().max(100).optional().nullable(),
});

const createPortSchema = z.object({
  switch_id: z.coerce.number().int().positive(),
  port_number: z.coerce.number().int().min(1).max(96),
  status: portStatus.optional(),
  port_type: z.enum(['access', 'hybrid', 'trunk']).optional(),
  untagged_vlan_id: z.coerce.number().int().positive().optional().nullable(),
  tagged_vlan_ids: z.array(z.coerce.number().int().positive()).optional(),
  connected_device_id: z.coerce.number().int().positive().optional().nullable(),
  label: z.string().max(100).optional().nullable(),
});

const searchQuerySchema = z.object({
  q: z.string().min(1).optional(),
  type: z.string().optional(),
  status: z.string().optional(),
});

export {
  createDeviceSchema,
  updateDeviceSchema,
  createSwitchSchema,
  updateSwitchSchema,
  createVlanSchema,
  updateVlanSchema,
  updatePortSchema,
  createPortSchema,
  searchQuerySchema,
};
export default {
  createDeviceSchema,
  updateDeviceSchema,
  createSwitchSchema,
  updateSwitchSchema,
  createVlanSchema,
  updateVlanSchema,
  updatePortSchema,
  createPortSchema,
  searchQuerySchema,
};
