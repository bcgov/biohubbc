export interface LotekAPIDevice {
  nDeviceID: number;
  strSpecialID: string;
  dtCreated: string;
  strSatellite: string;
}

export interface TelemetryLotekAPIRecord {
  channelstatus: string;
  uploadtimestamp: string;
  latitude: number;
  longitude: number;
  altitude: number;
  ecefx: number;
  ecefy: number;
  ecefz: number;
  rxstatus: number;
  pdop: number;
  mainv: number;
  bkupv: number;
  temperature: number;
  fixduration: number;
  bhastempvoltage: boolean;
  devname: string | null;
  deltatime: number;
  fixtype: number;
  cepradius: number;
  crc: number;
  deviceid: number;
  recdatetime: string;
  timeid: string;
}
