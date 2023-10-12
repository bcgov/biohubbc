import { DATE_FORMAT, TIME_FORMAT } from 'constants/dateTimeFormats';
import { IConfig } from 'contexts/configContext';
import { Feature, Polygon } from 'geojson';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { LatLngBounds } from 'leaflet';
import _ from 'lodash';
import moment from 'moment';

/**
 * Checks if a url string starts with an `http[s]://` protocol, and adds `https://` if it does not. If the url
 * begins with `localhost`, the `http` protocol is used.
 *
 * @param {string} url
 * @param {('http://' | 'https://')} [protocol='https://'] The protocol to add, if necessary. Defaults to `https://`.
 * @return {*}  {string} the url which is guaranteed to have an `http(s)://` protocol.
 */
export const ensureProtocol = (url: string, protocol: 'http://' | 'https://' = 'https://'): string => {
  if (url.startsWith('localhost')) {
    return `${'http://'}${url}`;
  }

  if (url.startsWith('https://') || url.startsWith('http://localhost')) {
    return url;
  }

  if (url.startsWith('http://')) {
    // If protocol is HTTPS, upgrade the URL
    if (protocol === 'https://') {
      return `${'https://'}${url.slice(7)}`;
    }
  }

  return `${protocol}${url}`;
};

/**
 * Builds a URL from multiple (possibly null or undefined) url parts, stripping any
 * double slashes from the resulting URL.
 *
 * @param {(string | undefined)[]} urlParts The parts of the URL
 * @returns The built URL
 */
export const buildUrl = (...urlParts: (string | undefined)[]): string => {
  return urlParts
    .filter((urlPart): urlPart is string => Boolean(urlPart))
    .map((urlPart) => String(urlPart).trim()) // Trim leading and trailing whitespace
    .filter(Boolean)
    .join('/')
    .replace(/([^:]\/)\/+/g, '$1'); // Trim double slashes
};

/**
 * Generates the <title> tag text for a React route
 * @param pageName The name of the page, e.g. 'Projects'
 * @returns The content to be rendered in the <title> tag
 */
export const getTitle = (pageName?: string) => {
  return pageName ? `SIMS - ${pageName}` : 'SIMS';
};

/**
 * Formats a date range into a formatted string.
 *
 * @param {DATE_FORMAT} dateFormat
 * @param {(string | null)} [startDate] ISO 8601 date string
 * @param {(string | null)} [endDate] ISO 8601 date string
 * @param {string} [dateSeparator='-'] specify date range separator
 * @return {string} formatted date string, or an empty string if unable to parse the startDate and/or endDate
 */
export const getFormattedDateRangeString = (
  dateFormat: DATE_FORMAT,
  startDate?: string | null,
  endDate?: string | null,
  dateSeparator = '-'
): string => {
  const startDateFormatted = getFormattedDate(dateFormat, startDate ?? '');

  const endDateFormatted = getFormattedDate(dateFormat, endDate ?? '');

  if (!startDateFormatted || (endDate && !endDateFormatted)) {
    return '';
  }

  if (endDateFormatted) {
    return `${startDateFormatted} ${dateSeparator} ${endDateFormatted}`;
  }

  return startDateFormatted;
};

/**
 * Get a formatted date string.
 *
 * @param {DATE_FORMAT} dateFormat
 * @param {string} date ISO 8601 date string
 * @return {string} formatted date string, or an empty string if unable to parse the date
 */
export const getFormattedDate = (dateFormat: DATE_FORMAT, date: string): string => {
  const dateMoment = moment(date);

  if (!dateMoment.isValid()) {
    //date was invalid
    return '';
  }

  return dateMoment.format(dateFormat);
};

/**
 * Get a formatted time string.
 *
 * @param {TIME_FORMAT} timeFormat
 * @param {string} date ISO 8601 date string
 * @return {string} formatted time string, or an empty string if unable to parse the date
 */
export const getFormattedTime = (timeFormat: TIME_FORMAT, date: string): string => {
  const dateMoment = moment(date);

  if (!dateMoment.isValid()) {
    //date was invalid
    return '';
  }

  return dateMoment.format(timeFormat);
};

/**
 * Get a formatted amount string.
 *
 * @param {number} [amount]
 * @param {{ minimumFractionDigits: number; maximumFractionDigits: number }} [options]
 * @return {string} formatted amount string (rounded to the nearest integer), or an empty string if unable to parse the amount
 */
export const getFormattedAmount = (
  amount?: number,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string => {
  if (!amount && amount !== 0) {
    //amount was invalid
    return '';
  }

  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0
  });

  return formatter.format(amount);
};

/**
 * Returns a url that when navigated to, will log the user out, redirecting them to the login page.
 *
 * @param {IConfig} config
 * @return {*}  {(string | undefined)}
 */
export const getLogOutUrl = (config: IConfig): string | undefined => {
  if (config?.KEYCLOAK_CONFIG.url && config?.KEYCLOAK_CONFIG.realm && config?.SITEMINDER_LOGOUT_URL) {
    const localRedirectURL = `${window.location.origin}/`;

    const keycloakLogoutRedirectURL = `${config.KEYCLOAK_CONFIG.url}/realms/${config.KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout?redirect_uri=${localRedirectURL}`;

    return `${config.SITEMINDER_LOGOUT_URL}?returl=${keycloakLogoutRedirectURL}&retnow=1`;
  }
};

export const getFormattedFileSize = (fileSize: number) => {
  if (!fileSize) {
    return '0 KB';
  }

  // kilobyte size
  if (fileSize < 1000000) {
    return `${(fileSize / 1000).toFixed(1)} KB`;
  }

  // megabyte size
  if (fileSize < 1000000000) {
    return `${(fileSize / 1000000).toFixed(1)} MB`;
  }

  // gigabyte size
  return `${(fileSize / 1000000000).toFixed(1)} GB`;
};

/**
 * Function to get an object key by the value
 * Ex: let obj = { 'role': 'admin' } -> getKeyByValue(obj, 'admin') will return 'role'
 *
 * @param {object} object
 * @param {any} value
 * @returns {any} key for the corresponding value
 */
export function getKeyByValue(object: any, value: any) {
  return Object.keys(object).find((key) => object[key] === value);
}

/**
 * Converts a `LatLngBounds` object into a GeoJSON Feature object.
 *
 * @export
 * @param {LatLngBounds} bounds
 * @return {*}  {Feature<Polygon>}
 */
export function getFeatureObjectFromLatLngBounds(bounds: LatLngBounds): Feature<Polygon> {
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [southWest.lng, southWest.lat],
          [southWest.lng, northEast.lat],
          [northEast.lng, northEast.lat],
          [northEast.lng, southWest.lat],
          [southWest.lng, southWest.lat]
        ]
      ]
    }
  };
}

/**
 * Takes an array of objects and produces an object URL pointing to a Blob which contains
 * the array. Supports large arrays thanks to use of Blob datatype.
 * @param entries Array containing objects
 * @returns A data URL, which downloads the given array as a CSV when clicked on in a browser.
 */
export const makeCsvObjectUrl = (entries: Array<Record<string, any>>) => {
  const keys = [...new Set(entries.reduce((acc: string[], entry) => acc.concat(Object.keys(entry)), []))];

  const rows = entries.map((entry: Record<string, any>) => {
    return keys.map((key) => String(entry[key]));
  });

  // Prepend the column names (object keys) to the CSV.
  rows.unshift(keys);

  const csvContent = rows.map((row) => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });

  return window.URL.createObjectURL(blob);
};

/**
 * Returns a human-readible identity source string.
 *
 * @example getFormattedIdentitySource("BCEIDBUSINESS"); // => "BCeID Business"
 *
 * @param {SYSTEM_IDENTITY_SOURCE} identitySource The identity source
 * @returns {*} {string} the string representing the identity source
 */
export const getFormattedIdentitySource = (identitySource: SYSTEM_IDENTITY_SOURCE): string | null => {
  switch (identitySource) {
    case SYSTEM_IDENTITY_SOURCE.BCEID_BASIC:
      return 'BCeID Basic';

    case SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS:
      return 'BCeID Business';

    case SYSTEM_IDENTITY_SOURCE.IDIR:
      return 'IDIR';

    case SYSTEM_IDENTITY_SOURCE.DATABASE:
      return 'System';

    default:
      return null;
  }
};

/**
 * For a given property, alphabetize an array of objects
 *
 * @param {T[]} data an array of objects to be alphabetize
 * @param {string} property a key property to alphabetize the data array on
 * @returns {any[]} Returns an alphabetized array of objects
 */
export const alphabetizeObjects = <T extends { [key: string]: any }>(data: T[], property: string) => {
  return _.sortBy(data, property);
};

/**
 * Coerce a potentially invalid number towards zero.
 * @param n a potentially NaN number
 * @returns n if a number, 0 otherwise
 */
export const coerceZero = (n: any): number => (isNaN(n ?? NaN) ? 0 : Number(n));

/**
 * Format a field name in a way that's appropriate for a UI label
 * ie. format_field_name -> Format Field Name
 * @param str format_field_name
 * @returns Format Field Name
 */
export const formatLabel = (str: string): string => {
  return str
    .split('_')
    .map((a) => a.charAt(0).toUpperCase() + a.slice(1))
    .join(' ');
};

export const datesSameNullable = (date1: string | undefined, date2: string | undefined): boolean => {
  if (date1 == null && date2 == null) {
    return true;
  } else {
    return moment(date1).isSame(moment(date2));
  }
};

/**
 * Pluralizes a word.
 *
 * @example p(2, 'apple'); // => 'apples'
 * @example p(null, 'orange'); // => 'oranges'
 * @example p(1, 'banana'); // => 'banana'
 * @example p(10, 'berr', 'y', 'ies'); // => 'berries'
 *
 * @param quantity The quantity used to infer plural or singular
 * @param word The word to pluralize
 * @param {[string]} singularSuffix The suffix used for a singular item
 * @param {[string]} pluralSuffix The suffix used for plural items
 * @returns
 */
export const pluralize = (quantity: number, word: string, singularSuffix = '', pluralSuffix = 's') => {
  return `${word}${quantity === 1 ? singularSuffix : pluralSuffix}`;
};

/**
 * Search through the Codes Response object for a given key (type of code)
 * for a particular codes (based on id) name.
 *
 * @param codes The Codes to search for
 * @param key Key word to access a code set
 * @param id ID of the code to find
 * @returns Name associated with the code
 */
export const getCodesName = (
  codes: IGetAllCodeSetsResponse | undefined,
  key: keyof IGetAllCodeSetsResponse,
  id: number
): string | undefined => {
  let name: string | undefined = undefined;
  if (codes) {
    const values: any = codes[key];
    const code = values.find((item: any) => item.id === id);
    name = code?.name;
  }
  return name;
};

/**
 * Convert a UUID into an arbitrary color within a constrained color space.
 *
 * @param id uuid
 * @returns {*} {fillColor: string, outlineColor: string}
 */
export const uuidToColor = (id: string): { fillColor: string; outlineColor: string } => {
  const uuidToInt = (uuid: string): number => {
    const noDashes = uuid.replace(/-/g, '');
    const substring = noDashes.substring(0, 9);
    return parseInt(substring, 16);
  };

  type HSL = { h: number; s: number; l: number };
  // Converts an integer value to an HSL color
  const intToHSL = (i: number): HSL => {
    const hue = (i / 1000) % 360;
    let saturation = (i % 50) + 50; // Ensuring saturation is between 50% and 100%
    let lightness = (i % 60) + 20; // Ensuring lightness is between 20% and 80%

    // Avoiding earthy tones for hues in the range of 20-170 by adjusting the saturation and lightness values
    if (hue >= 20 && hue <= 170) {
      saturation = (i % 40) + 60; // Ensuring saturation is between 60% and 100%
      lightness = (i % 50) + 40; // Ensuring lightness is between 40% and 90%
    }

    return { h: hue, s: saturation, l: lightness };
  };

  function HSLToRGB(hsl: HSL) {
    const { h, s, l } = hsl;
    const scaledS = s / 100;
    const scaledL = l / 100;
    const c = (1 - Math.abs(2 * scaledL - 1)) * scaledS;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = scaledL - c / 2;

    let r, g, b;
    if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
    else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
    else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
    else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
    else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return [(r + m) * 255, (g + m) * 255, (b + m) * 255].map((val) => Math.round(val));
  }

  function RGBToHex(rgb: number[]) {
    return rgb.map((val) => val.toString(16).padStart(2, '0')).join('');
  }

  function generateOutlineColor(hsl: HSL) {
    const { h, s, l } = hsl;
    const outlineL = l >= 50 ? l - 40 : l + 40;
    return { h, s, l: outlineL };
  }

  const intVal = uuidToInt(id);
  const hslFillColor = intToHSL(intVal);
  const hslOutlineColor = generateOutlineColor(hslFillColor);

  console.log(`HSL Fill: ${JSON.stringify(hslFillColor)}, HSL Outline: ${JSON.stringify(hslOutlineColor)}`);

  const rgbFillColor = HSLToRGB(hslFillColor);
  const rgbOutlineColor = HSLToRGB(hslOutlineColor);

  const hexFillColor = RGBToHex(rgbFillColor);
  const hexOutlineColor = RGBToHex(rgbOutlineColor);

  return { fillColor: `#${hexFillColor}`, outlineColor: `#${hexOutlineColor}` };
};
