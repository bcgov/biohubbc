export interface IUTM {
  easting: number;
  northing: number;
  zone_letter: string;
  zone_number: number;
  zone_srid: number;
}

const NORTH_UTM_BASE_ZONE_NUMBER = 32600;
const SOPUTH_UTM_BASE_ZONE_NUMBER = 32700;

const NORTH_UTM_ZONE_LETTERS = ['N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];
const SOUTH_UTM_ZONE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'];

const UTM_STRING_FORMAT = RegExp(/^[1-9]{0,1}[0-9][NPQRSTUVWXCDEFGHJKLM] [0-9]+ [0-9]+$/);

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

  const easting = Number(utmParts[1]);
  if (easting < 166640 || easting > 833360) {
    // utm easting is invalid
    return null;
  }

  const northing = Number(utmParts[2]);
  if (northing < 1110400 || northing > 9334080) {
    // utm northing is invalid
    return null;
  }

  const zone_letter = utmParts[0].slice(-1).toUpperCase();
  if (!zone_letter) {
    // utm zone letter is invalid
    return null;
  }

  const zone_number = Number(utmParts[0].slice(0, -1));
  if (zone_number < 1 || zone_number > 60) {
    // utm zone number is invalid
    return null;
  }

  let zone_srid;
  if (NORTH_UTM_ZONE_LETTERS.includes(zone_letter)) {
    zone_srid = NORTH_UTM_BASE_ZONE_NUMBER + zone_number;
  } else if (SOUTH_UTM_ZONE_LETTERS.includes(zone_letter)) {
    zone_srid = SOPUTH_UTM_BASE_ZONE_NUMBER + zone_number;
  } else {
    return null;
  }

  return { easting, northing, zone_letter, zone_number, zone_srid };
}
