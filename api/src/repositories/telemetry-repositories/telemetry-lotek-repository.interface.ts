import { z } from 'zod';

export const LotekAPIQuery = z.object({
  deviceId: z.number(),
  dtstart: z.string().optional(),
  dtend: z.string().optional()
});

export type LotekAPIQuery = z.infer<typeof LotekAPIQuery>;

export const LotekTask = z.object({
  serial: z.number(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  telemetryCount: z.number().optional(),
  lastAcquisition: z.string().optional()
});

export type LotekTask = z.infer<typeof LotekTask>;
