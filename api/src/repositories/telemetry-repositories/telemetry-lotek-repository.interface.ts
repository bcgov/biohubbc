import { z } from 'zod';

export const LotekAPIQuery = z.object({
  deviceId: z.number(),
  dtstart: z.string().optional(),
  dtend: z.string().optional()
});

export type LotekAPIQuery = z.infer<typeof LotekAPIQuery>;
