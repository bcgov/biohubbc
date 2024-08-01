import Typography from '@mui/material/Typography';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { DATE_FORMAT, TIME_FORMAT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

import _ from 'lodash';
import { IDialogContext } from '../contexts/dialogContext';

/**
 * Checks if a url string starts with an `http[s]://` protocol, and adds `https://` if it does not. If the url
 * begins with `localhost` or `host.docker.internal`, the `http` protocol is used.
 *
 * @param {string} url
 * @param {('http://' | 'https://')} [protocol='https://'] The protocol to add, if necessary. Defaults to `https://`.
 * @return {*}  {string} the url which is guaranteed to have an `http(s)://` protocol.
 */
export const ensureProtocol = (url: string, protocol: 'http://' | 'https://' = 'https://'): string => {
  if (url.startsWith('localhost') || url.startsWith('host.docker.internal')) {
    return `${'http://'}${url}`;
  }

  if (
    url.startsWith('https://') ||
    url.startsWith('http://localhost') ||
    url.startsWith('http://host.docker.internal')
  ) {
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
  const dateJs = dayjs(date);

  if (!dateJs.isValid()) {
    //date was invalid
    return '';
  }

  return dateJs.format(dateFormat);
};

/**
 * Get a formatted time string.
 *
 * @param {DATE_FORMAT} timeFormat
 * @param {string} timestamp ISO 8601 date string
 * @return {string} formatted date string, or an empty string if unable to parse the timestamp
 */
export const getFormattedTime = (timeFormat: TIME_FORMAT, timestamp: string): string => {
  const dateJs = dayjs(timestamp);

  if (!dateJs.isValid()) {
    //date was invalid
    return '';
  }

  return dateJs.format(timeFormat);
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
 * Checks if two dates are the same, but safe to use against nullish values.
 *
 * @param {NullishDate}
 * @param {NullishDate}
 * @returns boolean
 */
type NullishDate = string | null | undefined;
export const datesSameNullable = (date1: NullishDate, date2: NullishDate): boolean => {
  if (date1 == null && date2 == null) {
    //Note: intentionally loose equality
    return true;
  } else {
    return dayjs(date1).isSame(dayjs(date2));
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
 * Check if two date ranges overlap. End dates are allowed to be null, which is taken to mean indefinite.
 * Note that the order of arguments does matter here.
 *
 * @example dateRangesOverlap('2019-12-12', null, '2023-01-01', '2023-03-03') => true
 * @example dateRangesOverlap('2023-01-01', '2023-01-02', '2023-01-01', '2023-03-03') => true
 * @example dateRangesOverlap('2023-01-01', '2023-01-02', '2023-03-03', '2023-04-04') => false
 *
 * @param startDateA
 * @param endDateA
 * @param startDateB
 * @param endDateB
 * @returns boolean
 */
export const dateRangesOverlap = (
  startDateA: string,
  endDateA: string | null | undefined,
  startDateB: string,
  endDateB: string | null | undefined
): boolean => {
  const startA = dayjs(startDateA);
  const startB = dayjs(startDateB);

  const endA = endDateA ? dayjs(endDateA) : dayjs('2300-01-01');
  const endB = endDateB ? dayjs(endDateB) : dayjs('2300-01-01');

  return (startA.isSame(endB) || startA.isBefore(endB)) && (endA.isSame(startB) || endA.isAfter(startB));
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

  const rgbFillColor = HSLToRGB(hslFillColor);
  const rgbOutlineColor = HSLToRGB(hslOutlineColor);

  const hexFillColor = RGBToHex(rgbFillColor);
  const hexOutlineColor = RGBToHex(rgbOutlineColor);

  return { fillColor: `#${hexFillColor}`, outlineColor: `#${hexOutlineColor}` };
};

/**
 * Used to extract a name from specific fields that can occur in the properties of a shapefile.
 *
 * @param {Feature<Geometry, GeoJsonProperties>} geometry
 * @returns {string}
 */
export const shapeFileFeatureName = (geometry: Feature<Geometry, GeoJsonProperties>): string | undefined => {
  const nameKey = Object.keys(geometry.properties ?? {}).find(
    (key) => key.toLowerCase() === 'name' || key.toLowerCase() === 'label'
  );
  return nameKey && geometry.properties ? geometry.properties[nameKey].substring(0, 50) : undefined;
};

/**
 * Used to extract a description from specific fields that can occur in the properties of a shapefile.
 *
 * @param {Feature<Geometry, GeoJsonProperties>} geometry
 * @returns {string}
 */
export const shapeFileFeatureDesc = (geometry: Feature<Geometry, GeoJsonProperties>): string | undefined => {
  const descKey = Object.keys(geometry.properties ?? {}).find(
    (key) => key.toLowerCase() === 'desc' || key.toLowerCase() === 'descr' || key.toLowerCase() === 'des'
  );
  return descKey && geometry.properties ? geometry.properties[descKey].substring(0, 250) : undefined;
};

/**
 * Simple reusable method to make a snackbar appear with a string of your choice.
 *
 * @param message string to show
 * @param context reference to current DialogContext
 */
export const setMessageSnackbar = (message: string, context: IDialogContext) => {
  context.setSnackbar({
    open: true,
    snackbarMessage: (
      <Typography variant="body2" component="div">
        {message}
      </Typography>
    )
  });
};

/**
 * This will grab the first element from an array or return null if nothing is found
 *
 * @param arr array to check
 * @returns T
 */
export const firstOrNull = <T,>(arr: T[]): T | null => (arr.length > 0 ? arr[0] : null);

/**
 * Generates a random hex color from the given RNG seed.
 *
 * @param seed
 * @returns
 */
export const getRandomHexColor = (seed: number, min = 120, max = 180): string => {
  const randomChannel = (): string => {
    const x = Math.sin(seed++) * 1000;
    return (Math.floor((x - Math.floor(x)) * (max - min + 1)) + min).toString(16).padStart(2, '0');
  };

  return `#${randomChannel()}${randomChannel()}${randomChannel()}`;
};

/**
 * Returns true if the value is defined (not null and not undefined).
 *
 * @template T
 * @param {(T | undefined | null)} value
 * @return {*}  {value is T}
 */
export const isDefined = <T,>(value: T | undefined | null): value is T => value !== undefined && value !== null;
