/**
 * Raw Vectronic API telemetry record.
 *
 * @see https://api.vectronic-wildlife.com/swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config#//getPositions_2
 */
export interface TelemetryVectronicAPIRecord {
  idPosition: number;
  idCollar: number;
  acquisitionTime: string | null;
  scts: string | null;
  originCode: string | null;
  ecefX: number | null;
  ecefY: number | null;
  ecefZ: number | null;
  latitude: number | null;
  longitude: number | null;
  height: number | null;
  dop: number | null;
  idFixType: number | null;
  positionError: number | null;
  satCount: number | null;
  ch01SatId: number | null;
  ch01SatCnr: number | null;
  ch02SatId: number | null;
  ch02SatCnr: number | null;
  ch03SatId: number | null;
  ch03SatCnr: number | null;
  ch04SatId: number | null;
  ch04SatCnr: number | null;
  ch05SatId: number | null;
  ch05SatCnr: number | null;
  ch06SatId: number | null;
  ch06SatCnr: number | null;
  ch07SatId: number | null;
  ch07SatCnr: number | null;
  ch08SatId: number | null;
  ch08SatCnr: number | null;
  ch09SatId: number | null;
  ch09SatCnr: number | null;
  ch10SatId: number | null;
  ch10SatCnr: number | null;
  ch11SatId: number | null;
  ch11SatCnr: number | null;
  ch12SatId: number | null;
  ch12SatCnr: number | null;
  idMortalityStatus: number;
  activity: number | null;
  mainVoltage: number;
  backupVoltage: number;
  temperature: number;
  transformedX: number | null;
  transformedY: number | null;
}
