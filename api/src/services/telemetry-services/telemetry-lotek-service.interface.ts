import { z } from 'zod';
import { TelemetryLotekRecord } from '../../database-models/telemetry_lotek';

export interface LotekAPIDevice {
  nDeviceID: number;
  strSpecialID: string;
  dtCreated: string;
  strSatellite: string;
}

export const TelemetryLotekAPIRecord = TelemetryLotekRecord.omit({
  telemetry_lotek_id: true,
  device_key: true,
  geom: true
});

export type TelemetryLotekAPIRecord = z.infer<typeof TelemetryLotekAPIRecord>;
