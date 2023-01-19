import { Feature } from 'geojson';
import SQL, { SQLStatement } from 'sql-template-strings';

export interface IUTM {
  easting: number;
  northing: number;
  zone_letter: string | undefined;
  zone_number: number;
  zone_srid: number;
}

const NORTH_UTM_BASE_ZONE_NUMBER = 32600;
const SOPUTH_UTM_BASE_ZONE_NUMBER = 32700;

const NORTH_UTM_ZONE_LETTERS = ['N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];
const SOUTH_UTM_ZONE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];

const UTM_STRING_FORMAT = RegExp(/^[1-9]\d?[NPQRSTUVWXCDEFGHJKLM]? \d+ \d+$/i);
const UTM_ZONE_WITH_LETTER_FORMAT = RegExp(/^[1-9]\d?[NPQRSTUVWXCDEFGHJKLM]$/i);

/**
 * Parses a UTM string of the form: `9N 573674 6114170`
 *
 * String format: `"<zone_number><zone_letter> <easting> <northing>"`
 *
 * @export
 * @param {string} utm
 * @return {*}  {(IUTM | null)}
 */
export function parseUTMString(utm: string): IUTM | null {
  if (!utm || !UTM_STRING_FORMAT.test(utm)) {
    // utm string is null or does not match the expected format
    return null;
  }

  const utmParts = utm.split(' ');

  let zone_letter = undefined;
  let zone_number = undefined;

  const hasZoneLetter = UTM_ZONE_WITH_LETTER_FORMAT.test(utmParts[0]);

  if (hasZoneLetter) {
    zone_number = Number(utmParts[0].slice(0, -1));
    zone_letter = utmParts[0].slice(-1).toUpperCase();
  } else {
    zone_number = Number(utmParts[0]);
  }

  if (zone_number < 1 || zone_number > 60) {
    // utm zone number is invalid
    return null;
  }

  const easting = Number(utmParts[1]);
  if (easting < 166640 || easting > 833360) {
    // utm easting is invalid
    return null;
  }

  const northing = Number(utmParts[2]);

  let zone_srid;

  if (!zone_letter || NORTH_UTM_ZONE_LETTERS.includes(zone_letter)) {
    if (northing < 0 || northing > 9334080) {
      // utm northing is invalid
      return null;
    }

    // If `zone_letter` is not defined, then assume northern hemisphere
    zone_srid = NORTH_UTM_BASE_ZONE_NUMBER + zone_number;
  } else if (SOUTH_UTM_ZONE_LETTERS.includes(zone_letter)) {
    if (northing < 1110400 || northing > 10000000) {
      // utm northing is invalid
      return null;
    }

    zone_srid = SOPUTH_UTM_BASE_ZONE_NUMBER + zone_number;
  } else {
    return null;
  }

  return { easting, northing, zone_letter, zone_number, zone_srid };
}

export interface ILatLong {
  lat: number;
  long: number;
}

const LAT_LONG_STRING_FORMAT = RegExp(/^[+-]?(\d*[.])?\d+ [+-]?(\d*[.])?\d+$/i);

/**
 * Parses a `latitude longitude` string of the form: `49.116906	-122.62887`
 *
 * @export
 * @param {string} latLong
 * @return {*}  {(ILatLong | null)}
 */
export function parseLatLongString(latLong: string): ILatLong | null {
  if (!latLong || !LAT_LONG_STRING_FORMAT.test(latLong)) {
    // latLong string is null or does not match the expected format
    return null;
  }

  const latLongParts = latLong.split(' ');

  const lat = Number(latLongParts[0]);
  if (lat < -90 || lat > 90) {
    // latitude is invalid
    return null;
  }

  const long = Number(latLongParts[1]);
  if (long < -180 || long > 180) {
    // longitude is invalid
    return null;
  }

  return { lat, long };
}

/**
 * Function to generate the SQL for insertion of a geometry collection
 *
 * @export
 * @param {(Feature | Feature[])} geometry
 * @return {*}  {SQLStatement}
 */
export function generateGeometryCollectionSQL(geometry: Feature | Feature[]): SQLStatement {
  if (!Array.isArray(geometry)) {
    const geo = JSON.stringify(geometry.geometry);

    return SQL`public.ST_Force2D(public.ST_GeomFromGeoJSON(${geo}))`;
  }

  if (geometry.length === 1) {
    const geo = JSON.stringify(geometry[0].geometry);

    return SQL`public.ST_Force2D(public.ST_GeomFromGeoJSON(${geo}))`;
  }

  const sqlStatement: SQLStatement = SQL`public.ST_AsText(public.ST_Collect(array[`;

  geometry.forEach((geom: Feature, index: number) => {
    const geo = JSON.stringify(geom.geometry);

    // as long as it is not the last geometry, keep adding to the ST_collect
    if (index !== geometry.length - 1) {
      sqlStatement.append(SQL`
        public.ST_Force2D(public.ST_GeomFromGeoJSON(${geo})),`);
    } else {
      sqlStatement.append(SQL`
        public.ST_Force2D(public.ST_GeomFromGeoJSON(${geo}))]))`);
    }
  });

  return sqlStatement;
}

export function utmToLatLng(zone: number, easting: number, northing: number): { lat: number; long: number } {
  const a = 6378137;
  const e = 0.081819191;
  const e1sq = 0.006739497;
  const k0 = 0.9996;

  const arc = northing / k0;
  const mu = arc / (a * (1 - Math.pow(e, 2) / 4.0 - (3 * Math.pow(e, 4)) / 64.0 - (5 * Math.pow(e, 6)) / 256.0));

  const ei = (1 - Math.pow(1 - e * e, 1 / 2.0)) / (1 + Math.pow(1 - e * e, 1 / 2.0));

  const ca = (3 * ei) / 2 - (27 * Math.pow(ei, 3)) / 32.0;

  const cb = (21 * Math.pow(ei, 2)) / 16 - (55 * Math.pow(ei, 4)) / 32;
  const cc = (151 * Math.pow(ei, 3)) / 96;
  const cd = (1097 * Math.pow(ei, 4)) / 512;
  const phi1 = mu + ca * Math.sin(2 * mu) + cb * Math.sin(4 * mu) + cc * Math.sin(6 * mu) + cd * Math.sin(8 * mu);

  const n0 = a / Math.pow(1 - Math.pow(e * Math.sin(phi1), 2), 1 / 2.0);

  const r0 = (a * (1 - e * e)) / Math.pow(1 - Math.pow(e * Math.sin(phi1), 2), 3 / 2.0);
  const fact1 = (n0 * Math.tan(phi1)) / r0;

  const _a1 = 500000 - easting;
  const dd0 = _a1 / (n0 * k0);
  const fact2 = (dd0 * dd0) / 2;

  const t0 = Math.pow(Math.tan(phi1), 2);
  const Q0 = e1sq * Math.pow(Math.cos(phi1), 2);
  const fact3 = ((5 + 3 * t0 + 10 * Q0 - 4 * Q0 * Q0 - 9 * e1sq) * Math.pow(dd0, 4)) / 24;

  const fact4 = ((61 + 90 * t0 + 298 * Q0 + 45 * t0 * t0 - 252 * e1sq - 3 * Q0 * Q0) * Math.pow(dd0, 6)) / 720;

  const lof1 = _a1 / (n0 * k0);
  const lof2 = ((1 + 2 * t0 + Q0) * Math.pow(dd0, 3)) / 6.0;
  const lof3 =
    ((5 - 2 * Q0 + 28 * t0 - 3 * Math.pow(Q0, 2) + 8 * e1sq + 24 * Math.pow(t0, 2)) * Math.pow(dd0, 5)) / 120;
  const _a2 = (lof1 - lof2 + lof3) / Math.cos(phi1);
  const _a3 = (_a2 * 180) / Math.PI;

  const latitude = (180 * (phi1 - fact1 * (fact2 + fact3 + fact4))) / Math.PI;

  const longitude = ((zone > 0 && 6 * zone - 183.0) || 3.0) - _a3;

  return { lat: latitude, long: longitude };
}
