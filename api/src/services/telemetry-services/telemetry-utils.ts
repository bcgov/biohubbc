import { ICfgData } from '../../repositories/telemetry-repositories/telemetry-lotek-repository.interface';
import { IKeyxData } from '../../repositories/telemetry-repositories/telemetry-vectronic-repository.interface';

interface IDeviceKey {
  /**
   * Device vendor / manufacturer.
   *
   * @example 'lotek'
   * @type {string}
   */
  vendor: string;
  /**
   * Device serial identifier.
   *
   * @example 'a123' || 12345
   * @type {string | number}
   */
  serial: string | number;
}

/**
 * Generate a device key from a telemetry vendor and device serial.
 *
 * Note: In the database this value is used as psuedo foreign key from `telemetry` to `device`.
 *
 * @example 'lotek:1234'
 *
 * @param {{vendor: string; serial: string}} params - Vendor and serial
 * @returns {string}
 */
export const getTelemetryDeviceKey = ({ vendor, serial }: IDeviceKey): string => {
  return `${vendor.trim().toLowerCase()}:${String(serial).trim().toLowerCase()}`;
};

/**
 * Convert an object's keys to lowercase.
 *
 * @param {Record<string, any>} obj - Object to convert
 * @returns {Record<string, any>} - Object with lowercase keys
 */
export const keysToLowerCase = <T>(obj: Record<string, any>): T => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key.toLowerCase()] = obj[key];
    return acc;
  }, {} as T);
};

/**
 * Array that stores multiple device keys
 *
 * @export
 * @interface IMultipleData
 * @typedef {IMultipleData}
 */
export interface IMultipleData {
  fileName: string;
  keysData?: ICfgData[] | IKeyxData[];
  error?: string;
}

/**
 * Vectronic json parsed data structure
 *
 * @export
 * @interface ParsedKeyxXMLData
 * @typedef {ParsedKeyxXMLData}
 */
export interface ParsedKeyxXMLData {
  collarKey: {
    collar: {
      '@_ID': string;
      comIDList: {
        comID: {
          '@_comType': string;
          '#text': number;
        };
      };
      key: string;
      collarType: number;
    };
  };
}

/**
 * XML parser configuration options
 *
 * @type {{ ignoreAttributes: boolean; attributeNamePrefix: string; }}
 */
export const xmlParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
};

/**
 * Ensures input file contains expected xml tags
 *
 * @param {string} str
 * @param {ReadonlyArray<string>} substrings
 * @returns {*}
 */
export const findVectronicExpectedTags = (str: string, substrings: ReadonlyArray<string>) => {
  return substrings.filter((substring) => str.includes(substring));
};

/**
 * Map keyx data to common JSON
 *
 * @param {ParsedKeyxXMLData} input
 * @returns {IKeyxData}
 */
export const mapKeyxData = (input: ParsedKeyxXMLData): IKeyxData => {
  return {
    id: input.collarKey.collar['@_ID'],
    key: input.collarKey.collar.key,
    comID: input.collarKey.collar.comIDList.comID['#text'],
    collarType: input.collarKey.collar.collarType,
    comType: input.collarKey.collar.comIDList.comID['@_comType']
  };
};

/**
 * Validate lotek cfg file format
 *
 * @param {string} content
 * @returns {(string | null)}
 */
export const validateCfgFormat = (content: string): string | null => {
  // Split content in blocks by '[number]' directive
  const blocks = content.split(/(?=\[\d+\])/);

  // Iterate through each block and validate it
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    // Extract lines and trim spaces and returns
    const lines = block
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');

    // Ensure each block has exactly 3 lines
    if (lines.length !== 3) {
      return `Key ${index + 1} must contain exactly 3 non-empty lines.`;
    }

    const idLine = lines[0];
    const keyLine = lines[1];
    const IridiumIMEILine = lines[2];

    // Validate id, should be inside square brackets and be a number
    const idMatch = idLine.match(/^\[(\d+)\]$/);
    if (!idMatch) {
      return `Invalid ID in key ${index + 1}. Valid format: [number].`;
    }

    // Validate 'Key' and 'Iridium IMEI' in any order
    const keyMatch = [keyLine, IridiumIMEILine].find((line) => line.startsWith('Key='));
    const IridiumIMEIMatch = [keyLine, IridiumIMEILine].find((line) => line.startsWith('Iridium IMEI='));

    if (!keyMatch || !IridiumIMEIMatch) {
      return `Key ${index + 1} is missing either 'Key' or 'Iridium IMEI' directive.`;
    }

    const key = keyMatch.split('=')[1];
    const IridiumIMEI = IridiumIMEIMatch.split('=')[1];

    // Validate 'Key' length
    if (key.length !== 64) {
      return `Invalid 'Key' in key ${index + 1}. Expected 64 characters.`;
    }

    // validate Iridium IMEI length
    if (IridiumIMEI.length !== 15) {
      return `Invalid 'Iridium IMEI' length in key ${index + 1}. Expected a 15-digit number.`;
    }

    // Validate the key can contain special characters (optional validation, adjust as needed)
    if (!/^[\x21-\x7E]+$/.test(key)) {
      return `Invalid characters in 'Key' in key ${index + 1}.`;
    }
  }

  // return null when all is good
  return null;
};

/**
 * Convert properly formated lotek cfg devices file into JSON
 *
 * @param {string} input
 * @returns {ICfgData[]}
 */
export const convertLotekCredentialFileToJson = (input: string): ICfgData[] => {
  const regex = /\[(\d+)\]\s*((?:Key=[^\n]+(?:\s+Iridium IMEI=\d+)?\s*)+)/g;
  return [...input.matchAll(regex)].map(([, id, block]) => {
    // Extracting Key and Iridium IMEI directives in any order
    const keyMatch = block.match(/Key=([^\s]+)/);
    const imeiMatch = block.match(/Iridium IMEI=(\d+)/);

    const key = keyMatch ? keyMatch[1] : '';
    const imei = imeiMatch ? parseInt(imeiMatch[1], 10) : 0;

    return {
      id: parseInt(id, 10),
      key: key,
      'Iridium IMEI': imei
    };
  });
};
