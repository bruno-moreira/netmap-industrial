import { z } from 'zod';
const deviceStatus = z.enum(['online', 'offline', 'unknown', 'maintenance']);
const createDeviceSchema = z.object({
  device_type_id: z.coerce.number().int().positive(),
  name: z.string().min(1).max(150),
  ip_address: z.string().ip({ version: 'v4' }).optional().nullable(),
  mac_address: z.string().max(17).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  status: deviceStatus.optional(),
  metadata: z.record(z.unknown()).optional(),
});

const payload = {
  name: "asdf",
  device_type_id: 1,
  ip_address: "",
  mac_address: "",
  location: "",
  status: "online"
};

const result = createDeviceSchema.safeParse(payload);
if (!result.success) {
  console.log(result.error.issues);
} else {
  console.log("Success");
}
