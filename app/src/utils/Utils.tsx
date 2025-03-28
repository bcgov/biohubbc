import Typography from '@mui/material/Typography';
import { AxiosProgressEvent } from 'axios';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
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
 * @param {(string | null)} date ISO 8601 date string
 * @return {string} formatted date string, or an empty string if unable to parse the date
 */
export const getFormattedDate = (dateFormat: DATE_FORMAT, date: string | null): string => {
  if (!date) {
    return '';
  }

  const dateJs = dayjs(date);

  if (!dateJs.isValid()) {
    //date was invalid
    return '';
  }

  return dateJs.format(dateFormat);
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
    // Change the multiplier to change the colour boldness
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

/**
 * Gets the progress percentage from an Axios ProgressEvent.
 *
 * Note: Axios will fire a `progress event` 3 times a second.
 *
 * @param {AxiosProgressEvent} progressEvent - Axios progress event
 *
 */
export const getAxiosProgress = (progressEvent: AxiosProgressEvent) => {
  return Math.round((progressEvent.loaded / (progressEvent.total || 1)) * 100);
};

/**
 * Wait for the render cycle to complete before continuing.
 *
 * How? React updates the DOM asynchronously by queing updates in the event loop.
 * Awaiting this promise allows react to complete its currently queued tasks (state updates) before continuing.
 *
 * Note: The `delayMs` is used to wait AFTER the render cycle updates. This is useful when you want to wait for
 * the render cycle to complete and then perform some action after a delay, useful for animation or state timing.
 *
 * @see https://www.justjeb.com/post/why-does-settimeout-work
 * @async
 * @param {number} [delayMs=0] - Delay in milliseconds to wait AFTER the render cycle updates
 * @returns {*} {Promise<void>}
 */
export const waitForRenderCycle = async (delayMs = 0) => {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
};
