//Interface for a Lotek API Device. Raw API response.
export interface LotekAPIDevice {
  nDeviceID: number;
  strSpecialID: string;
  dtCreated: string;
  strSatellite: string;
}
