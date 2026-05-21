import { XMLParser, XMLValidator } from 'fast-xml-parser';
import {
  TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING,
  TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE,
  TELEMETRY_CREDENTIAL_ATTACHMENT_VECTRONIC_XMLTAGS
} from '../../constants/attachments';
import { ICfgData } from '../../repositories/telemetry-repositories/telemetry-lotek-repository.interface';
import { IKeyxData } from '../../repositories/telemetry-repositories/telemetry-vectronic-repository.interface';
import { TelemetryVectronicService } from '../../services/telemetry-services/telemetry-vectronic-service';
import { MediaFile } from '../../utils/media/media-file';
import { isZipMimetype, parseUnknownZipFile } from '../../utils/media/media-utils';

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
 * Validation and device key data structure
 *
 * @export
 * @interface IValidationData
 * @typedef {IValidationData}
 */
export interface IValidationData {
  /**
   * Device Key file type, keyx or cfg
   *
   * @type {TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE}
   */
  type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE;
  /**
   * keyData array, stores one or many keys
   *
   * @type {IMultipleData}
   */
  keyData?: IMultipleData[];
  /**
   * Error message place holder
   *
   * @type {string}
   */
  error?: string;
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
  return Object.keys(obj).reduce(
    (acc, key) => {
      acc[key.toLowerCase()] = obj[key];
      return acc;
    },
    {} as Record<string, any>
  ) as T;
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
          '#text': string;
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
const xmlParserOptions = {
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
const findVectronicExpectedTags = (str: string, substrings: ReadonlyArray<string>) => {
  return substrings.filter((substring) => str.includes(substring));
};

/**
 * Map keyx data to common JSON
 *
 * @param {ParsedKeyxXMLData} input
 * @returns {IKeyxData}
 */
const mapKeyxData = (input: ParsedKeyxXMLData): IKeyxData => {
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
const convertLotekCredentialFileToJson = (input: string): ICfgData[] => {
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

/**
 * Checks if the file is a valid telemetry credential file an extracts the key data.
 *
 * @async
 * @param {Express.Multer.File} file
 * @returns {Promise<IValidationData>}
 */
export const validateGetKeyDataTelementryCredentialFile = async (
  file: Express.Multer.File,
  telemetryVectronicService: TelemetryVectronicService
): Promise<IValidationData> => {
  const isKeyX = await checkFileForKeyx(file, telemetryVectronicService);
  if (TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX === isKeyX.type) {
    return isKeyX;
  }

  const isCfg = checkFileForCfg(file);
  if (TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG === isCfg.type) {
    return isCfg;
  }

  const isZip = checkFileForZip(file, telemetryVectronicService);
  return isZip;
};

/**
 * Check device key extension type .cfg, .keyx, .zip
 *
 * @param {Express.Multer.File} file
 * @param {TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE} fileType
 * @returns {boolean}
 */
const isCredentialFileExtension = (
  file: Express.Multer.File,
  fileType: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE
): boolean => {
  const originalName = file?.originalname?.toLowerCase();
  const fileExtension = `.${fileType.toLowerCase()}`;
  if (originalName?.endsWith(fileExtension)) {
    return true;
  }
  return false;
};

/**
 * Validates vectronic keyx file and extracts key data
 *
 * @async
 * @param {Express.Multer.File} file
 * @returns {Promise<IValidationData>}
 */
export const checkFileForKeyx = async (
  file: Express.Multer.File,
  telemetryVectronicService: TelemetryVectronicService
): Promise<IValidationData> => {
  // File is a KeyX file if it ends in '.keyx'
  if (isCredentialFileExtension(file, TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX)) {
    const xmlString = file.buffer ? file.buffer.toString() : '';
    // Validate file for properly formed XML
    const resultXMLValidation = XMLValidator.validate(xmlString);
    if (true !== resultXMLValidation) {
      return {
        type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
        error: `${TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_XML_FILE}: ${resultXMLValidation.err.code}, ${resultXMLValidation.err.msg}`
      };
    }

    // Quick Check XML file for existence of expected tags and attributes
    // Note : not using an xml parser at this point to make validation more efficient
    const expectedXmlTags = findVectronicExpectedTags(xmlString, TELEMETRY_CREDENTIAL_ATTACHMENT_VECTRONIC_XMLTAGS);
    if (expectedXmlTags.length !== TELEMETRY_CREDENTIAL_ATTACHMENT_VECTRONIC_XMLTAGS.length) {
      return {
        type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
        error: `${TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_XML_FILE}: ${TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.MISSING_XML_TAGS}`
      };
    }

    // Parse data out of the XML file
    const parser = new XMLParser(xmlParserOptions);
    const jsonKeyxData = mapKeyxData(parser.parse(xmlString));

    // Validate key using Vectronic API separation count
    let keyStatus;
    try {
      await telemetryVectronicService.fetchTelemetrySepCountFromVectronic(jsonKeyxData.id, jsonKeyxData.key);
      keyStatus = {
        type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
        keyData: [
          {
            fileName: file.originalname,
            keysData: [jsonKeyxData]
          }
        ]
      };
    } catch (_error) {
      keyStatus = {
        type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
        error: `${TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_XML_FILE}: ${TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.KEYX_NOT_FOUND}`
      };
    }

    return keyStatus;
  }

  return {
    type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
    error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.FILE_NOT_KEYX
  };
};

/**
 * Validates lotek cfg file and extracts key data
 *
 * @param {Express.Multer.File} file
 * @returns {IValidationData}
 */
export const checkFileForCfg = (file: Express.Multer.File): IValidationData => {
  // File is a Cfg file if it ends in '.cfg'
  if (isCredentialFileExtension(file, TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG)) {
    const cfgString = file.buffer ? file.buffer.toString() : '';
    const notValidCfg = validateCfgFormat(cfgString);

    if (notValidCfg) {
      return {
        type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
        error: notValidCfg
      };
    }
    return {
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
      keyData: [
        {
          fileName: file.originalname,
          keysData: convertLotekCredentialFileToJson(cfgString)
        }
      ]
    };
  }
  return {
    type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
    error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.FILE_NOT_CFG
  };
};

/**
 * Processes lotek key file to extract key data
 *
 * @param {MediaFile[]} dataArray
 * @returns {IMultipleData[]}
 */
const processCfgFilesArray = (dataArray: MediaFile[]): IMultipleData[] => {
  const resultJSON: IMultipleData[] = [];
  dataArray.some((data) => {
    const cfgFileString = data.buffer ? data.buffer.toString() : '';
    const notValidCfg = validateCfgFormat(cfgFileString);

    // break files iterator as soon as an error is found
    if (notValidCfg) {
      resultJSON.length = 0;
      resultJSON.push({
        fileName: data.fileName,
        error: notValidCfg
      });
      return true;
    }

    resultJSON.push({
      fileName: data.fileName,
      keysData: convertLotekCredentialFileToJson(cfgFileString)
    });

    return false;
  });

  return resultJSON;
};

/**
 * Processes vectronic key file to extract key data
 *
 * @async
 * @param {MediaFile[]} dataArray
 * @returns {Promise<IMultipleData[]>}
 */
const processKeyxFilesArray = async (
  dataArray: MediaFile[],
  telemetryVectronicService: TelemetryVectronicService
): Promise<IMultipleData[]> => {
  const resultJSON: IMultipleData[] = [];
  for (const keyxData of dataArray) {
    const keyxFileString = keyxData.buffer ? keyxData.buffer.toString() : '';
    // Validate file for properly formed XML and break iterator if error
    const resultXMLValidation = XMLValidator.validate(keyxFileString);
    if (true !== resultXMLValidation) {
      resultJSON.length = 0;
      resultJSON.push({
        fileName: keyxData.fileName,
        error: `${resultXMLValidation.err.code}, ${resultXMLValidation.err.msg}`
      });
      break;
    }

    // Validate tags before parsing and break iterator if error
    const expectedXmlTags = findVectronicExpectedTags(
      keyxFileString,
      TELEMETRY_CREDENTIAL_ATTACHMENT_VECTRONIC_XMLTAGS
    );
    if (expectedXmlTags.length !== TELEMETRY_CREDENTIAL_ATTACHMENT_VECTRONIC_XMLTAGS.length) {
      resultJSON.length = 0;
      resultJSON.push({
        fileName: keyxData.fileName,
        error: 'Missing one or more required tags'
      });
      break;
    }

    // Parse data out of the XML file
    const parser = new XMLParser(xmlParserOptions);
    const jsonKeyxData = mapKeyxData(parser.parse(keyxFileString));

    let keyStatus;
    try {
      await telemetryVectronicService.fetchTelemetrySepCountFromVectronic(jsonKeyxData.id, jsonKeyxData.key);
      keyStatus = true;
    } catch (_error) {
      keyStatus = false;
    }

    if (!keyStatus) {
      resultJSON.length = 0;
      resultJSON.push({
        fileName: keyxData.fileName,
        error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.KEYX_NOT_FOUND
      });
      break;
    }

    resultJSON.push({
      fileName: keyxData.fileName,
      keysData: [jsonKeyxData]
    });
  }

  return resultJSON;
};

/**
 * Validates ZIP device key files (lotek or vectronic) and extracts key data
 *
 * @async
 * @param {Express.Multer.File} file
 * @returns {Promise<IValidationData>}
 */
export const checkFileForZip = async (
  file: Express.Multer.File,
  telemetryVectronicService: TelemetryVectronicService
): Promise<IValidationData> => {
  if (!isCredentialFileExtension(file, TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.ZIP)) {
    // File extension is not a zip
    return {
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
      error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_ZIP_CONTENT
    };
  }

  if (!isZipMimetype(file.mimetype)) {
    // File is a zip file with invalid mime type
    return {
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
      error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.FILE_INVALID_MIMETYPE
    };
  }

  const zipEntries = parseUnknownZipFile(file.buffer);
  if (zipEntries.error) {
    // File is a zip file, but it is corrupted or has an invalid zip format
    return {
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
      error: zipEntries.error
    };
  }

  if (zipEntries.filesArray.length === 0) {
    // File is a zip file, but it is empty (no files)
    return {
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
      error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.ARCHIVE_WITH_NO_FILES
    };
  }

  // Return false if any of the files in the zip are not keyx files
  const resultKeyX = zipEntries.filesArray.every((zipEntry) => zipEntry.fileName.endsWith('.keyx'));
  if (!resultKeyX) {
    // Return false if any of the files in the zip are not cfg files
    const resultCfg = zipEntries.filesArray.every((zipEntry) => zipEntry.fileName.endsWith('.cfg'));
    if (!resultCfg) {
      return {
        type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
        error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_ZIP_CONTENT
      };
    }

    // Validate keys and produce keys JSON
    const cfgDataJSON = processCfgFilesArray(zipEntries.filesArray);
    if (cfgDataJSON[0].error) {
      return {
        type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
        error: `${TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_KEY_FILE}: ${cfgDataJSON[0].fileName}, ${cfgDataJSON[0].error}`
      };
    }

    return {
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
      keyData: cfgDataJSON
    };
  }

  // Validate each keyx file in zip and extract data
  const keyxDataJSON = await processKeyxFilesArray(zipEntries.filesArray, telemetryVectronicService);
  if (keyxDataJSON[0].error) {
    return {
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
      error: `${TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_KEY_FILE}: ${keyxDataJSON[0].fileName}, ${keyxDataJSON[0].error}`
    };
  }

  return {
    type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
    keyData: keyxDataJSON
  };
};
