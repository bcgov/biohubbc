import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import AdmZip from 'adm-zip';
import axios from 'axios';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import mime from 'mime';
import {
  TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING,
  TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE,
  TELEMETRY_CREDENTIAL_ATTACHMENT_VECTRONIC_XMLTAGS
} from '../../constants/attachments';
import { getEnvironmentVariable } from '../env-config';
import { ArchiveFile, MediaFile } from './media-file';

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
   * @type {Array}
   */
  keyData?: IMultipleData[]; // Array<{}>;
  /**
   * Error message place holder
   *
   * @type {string}
   */
  error?: string;
}

interface IMultipleData {
  fileName: string;
  keysData?: ICfgData[] | IKeyxData[];
  error?: string;
}
interface ICfgData {
  id: number;
  key: string;
  'Iridium IMEI': number;
}

interface IKeyxData {
  id: string;
  key: string;
  comID: number;
  comType: string;
  collarType: number;
}

/**
 * Parses an unknown file into an array of MediaFile.
 *
 * Note: The array will always have 1 item unless the unknown file is a zip file containing multiple files, in which
 * case the array will have 1 item per file in the zip (folders ignored).
 *
 * @param {(Express.Multer.File | GetObjectCommandOutput)} rawMedia
 * @return {*}  {(Promise<null | MediaFile | ArchiveFile>)}
 */
export const parseUnknownMedia = async (
  rawMedia: Express.Multer.File | GetObjectCommandOutput
): Promise<null | MediaFile | ArchiveFile> => {
  if ((rawMedia as Express.Multer.File).originalname) {
    return parseUnknownMulterFile(rawMedia as Express.Multer.File);
  } else {
    return parseUnknownS3File(rawMedia as GetObjectCommandOutput);
  }
};

/**
 * Parses an unknown multer file into a known file type.
 *
 * @param {Express.Multer.File} rawMedia
 * @return {*}  {(null | MediaFile | ArchiveFile)}
 */
export const parseUnknownMulterFile = (rawMedia: Express.Multer.File): null | MediaFile | ArchiveFile => {
  const mimetype = mime.getType(rawMedia.originalname);

  if (isZipMimetype(mimetype || '')) {
    const archiveFile = parseMulterFile(rawMedia);
    const mediaFiles = parseUnknownZipFile(rawMedia.buffer);

    return new ArchiveFile(archiveFile.fileName, archiveFile.mimetype, archiveFile.buffer, mediaFiles.filesArray);
  }

  return parseMulterFile(rawMedia);
};

/**
 * Parses an unknown S3 file into a known file type.
 *
 * @param {GetObjectCommandOutput} rawMedia
 * @return {*}  {(Promise<null | MediaFile | ArchiveFile>)}
 */
export const parseUnknownS3File = async (rawMedia: GetObjectCommandOutput): Promise<null | MediaFile | ArchiveFile> => {
  const mimetype = rawMedia.ContentType;

  if (isZipMimetype(mimetype || '')) {
    if (!rawMedia.Body) {
      return null;
    }

    const archiveFile = await parseS3File(rawMedia);
    const mediaFiles = parseUnknownZipFile((await rawMedia.Body.transformToByteArray()) as Buffer);

    return new ArchiveFile(archiveFile.fileName, archiveFile.mimetype, archiveFile.buffer, mediaFiles.filesArray);
  }

  return await parseS3File(rawMedia);
};

/**
 * Parse a zip file  buffer into an array of MediaFile.
 *
 * Note: Ignores any directory structures, flattening all nested files into a single array.
 *
 * @param {Buffer} zipFile
 * @return {*}  {filesArray: MediaFile[], error?: string}
 */
export const parseUnknownZipFile = (
  zipFile: Buffer
): {
  filesArray: MediaFile[];
  error?: string;
} => {
  try {
    const unzippedFile = new AdmZip(zipFile);
    const entries = unzippedFile.getEntries();
    return {
      filesArray: entries
        .filter((item) => !item.isDirectory)
        .map((item) => {
          const fileName = item?.name;
          const mimetype = mime.getType(fileName) || '';
          const buffer = item?.getData();

          return new MediaFile(fileName, mimetype, buffer);
        })
    };
  } catch (err: any) {
    console.error(err);
    return { filesArray: [], error: err.message };
  }
};

/**
 * Parse a single file into an array of MediaFile with 1 element.
 *
 * @param {Express.Multer.File} file
 * @return {*}  {MediaFile}
 */
export const parseMulterFile = (file: Express.Multer.File): MediaFile => {
  const fileName = file?.originalname;
  const mimetype = mime.getType(fileName) || '';
  const buffer = file?.buffer;

  return new MediaFile(fileName, mimetype, buffer);
};

/**
 * Parse a single file into an array of MediaFile with 1 element.
 *
 * @param {GetObjectCommandOutput} file
 * @return {*}  {Promise<MediaFile>}
 */
export const parseS3File = async (file: GetObjectCommandOutput): Promise<MediaFile> => {
  const fileName = file?.Metadata?.filename || '';
  const mimetype = mime.getType(fileName) || '';
  const buffer = (await file?.Body?.transformToByteArray()) as Buffer;

  return new MediaFile(fileName, mimetype, buffer);
};

export const isZipMimetype = (mimetype: string): boolean => {
  if (!mimetype) {
    return false;
  }

  return [/application\/zip/, /application\/x-zip-compressed/, /application\/x-rar-compressed/].some((regex) =>
    regex.test(mimetype)
  );
};

// XML parser configuration options
const xmlParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_'
};

/**
 * As A check test, fetch vectronic device telemetry separation count from the Vectronic API.
 *
 * @param { string } collarId - Vectronic collar device ID
 * @param { string } collarKey - Vectronic collar key
 * @returns {*} {Promise<number>}
 */
const fetchCollarSepCount = async (collarId: string, collarKey: string): Promise<number> => {
  const vectronicApi = axios.create({
    baseURL: getEnvironmentVariable('VECTRONIC_API_HOST')
  });
  try {
    const response = await vectronicApi.get(`/collar/${collarId}/sep/count`, {
      params: {
        collarkey: collarKey
      }
    });
    return response.data;
  } catch (error: any) {
    console.error(error.message);
    throw error;
  }
};

const findVectronicExpectedTags = (str: string, substrings: ReadonlyArray<string>) => {
  return substrings.filter((substring) => str.includes(substring));
};

// Map keyx data to common JSON
const mapKeyxData = (input: any): IKeyxData => {
  return {
    id: input.collarKey.collar['@_ID'],
    key: input.collarKey.collar.key,
    comID: input.collarKey.collar.comIDList.comID['#text'],
    collarType: input.collarKey.collar.collarType,
    comType: input.collarKey.collar.comIDList.comID['@_comType']
  };
};

const validateCfgFormat = (content: string): string | null => {
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

const cfgToJSON = (input: string): ICfgData[] => {
  const regex = /\[(\d+)\]\s*((?:Key=[^\n]+(?:\s+Iridium IMEI=\d+)?|\s+Iridium IMEI=\d+\s+Key=[^\n]+)+)/g;
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
 * Checks if the file is a valid telemetry credential file.
 *
 * @param {Express.Multer.File} file
 * @return {*}  {({
 *   type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE;
 *   error?: string;
 * })}
 */
export const validateGetKeyDataTelementryCredentialFile = async (
  file: Express.Multer.File
): Promise<IValidationData> => {
  const isKeyX = await checkFileForKeyx(file);
  if (TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX === isKeyX.type) {
    return isKeyX;
  }

  const isCfg = checkFileForCfg(file);
  if (TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG === isCfg.type) {
    return isCfg;
  }

  const isZip = checkFileForZip(file);
  return isZip;
};

/**
 * Returns true if the file is a keyx file, or a zip that contains only keyx files.
 *
 * @export
 * @param {Express.Multer.File} file
 * @return {*}  {({
 *   type: 'unknown' | 'keyx';
 *   error?: string;
 * })}
 */
export const checkFileForKeyx = async (file: Express.Multer.File): Promise<IValidationData> => {
  // File is a KeyX file if it ends in '.keyx'
  if (file.originalname.endsWith('.keyx')) {
    const xmlString = file.buffer.toString();

    // Validate file for properly formed XML
    const resultXMLValidation = XMLValidator.validate(xmlString);
    if (true !== resultXMLValidation) {
      return {
        type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
        error:
          TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_XML_FILE +
          resultXMLValidation.err.code +
          ', ' +
          resultXMLValidation.err.msg
      };
    }

    // Quick Check XML file for existence of expected tags and attributes
    // Note : not using an xml parser at this point to make validation more efficient
    const expectedXmlTags = findVectronicExpectedTags(xmlString, TELEMETRY_CREDENTIAL_ATTACHMENT_VECTRONIC_XMLTAGS);
    if (expectedXmlTags.length !== TELEMETRY_CREDENTIAL_ATTACHMENT_VECTRONIC_XMLTAGS.length) {
      return {
        type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
        error: TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_XML_FILE + 'Missing one or more expected tags'
      };
    }

    // Parse data out of the XML file
    const parser = new XMLParser(xmlParserOptions);
    // const jsonKeyxData = parser.parse(xmlString);
    const jsonKeyxData = mapKeyxData(parser.parse(xmlString));

    // Validate key using Vectronic API separation count
    const keyStatus = await fetchCollarSepCount(jsonKeyxData.id, jsonKeyxData.key)
      .then(() => {
        return {
          type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
          keyData: [
            {
              fileName: file.originalname,
              keysData: [jsonKeyxData]
            }
          ]
        };
      })
      .catch(() => {
        return {
          type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
          error:
            TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_XML_FILE +
            TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.KEYX_NOT_FOUND
        };
      });

    return keyStatus;
  }

  return {
    type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
    error: 'File type is not a .keyx'
  };
};

/**
 * Returns IValidationData.
 *
 * @export
 * @param {Express.Multer.File} file
 * @return {IValidationData}
 */
export const checkFileForCfg = (file: Express.Multer.File): IValidationData => {
  // File is a Cfg file if it ends in '.cfg'
  if (file?.originalname.endsWith('.cfg')) {
    const cfgString = file.buffer.toString();
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
          keysData: cfgToJSON(cfgString)
        }
      ]
    };
  }
  return {
    type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
    error: 'File type is not a .Cfg'
  };
};

const processCfgFilesArray = (dataArray: MediaFile[]): IMultipleData[] => {
  const resultJSON: IMultipleData[] = [];
  dataArray.some((data) => {
    const cfgFileString = data.buffer.toString();
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
      keysData: cfgToJSON(cfgFileString)
    });

    return false;
  });

  return resultJSON;
};

const processKeyxFilesArray = async (dataArray: MediaFile[]): Promise<IMultipleData[]> => {
  const resultJSON: IMultipleData[] = [];
  for (const keyxData of dataArray) {
    const keyxFileString = keyxData.buffer.toString();

    // Validate file for properly formed XML and break iterator if error
    const resultXMLValidation = XMLValidator.validate(keyxFileString);
    if (true !== resultXMLValidation) {
      resultJSON.length = 0;
      resultJSON.push({
        fileName: keyxData.fileName,
        error: resultXMLValidation.err.code + ', ' + resultXMLValidation.err.msg
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

    // Validate key using Vectronic API separation count
    const keyStatus = await fetchCollarSepCount(jsonKeyxData.id, jsonKeyxData.key)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });

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
 * Returns true if the file is a zip that contains only keyx or a zip with only Cfg files.
 *
 * @export
 * @param {Express.Multer.File} file
 * @return {*}  {({
 *   type: 'unknown' | 'keyx' | 'cfg';
 *   error?: string;
 * })}
 */
export const checkFileForZip = async (file: Express.Multer.File): Promise<IValidationData> => {
  const mimeType = mime.getType(file.originalname) ?? '';
  if (!isZipMimetype(mimeType)) {
    // File is a zip file with invalid mime type
    return {
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.UNKNOWN,
      error: 'File is a zip file with invalid mime type'
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
        error:
          TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_KEY_FILE +
          cfgDataJSON[0].fileName +
          ', ' +
          cfgDataJSON[0].error
      };
    }

    return {
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG,
      keyData: cfgDataJSON
    };
  }

  // Validate each keyx file in zip and extract data
  const keyxDataJSON = await processKeyxFilesArray(zipEntries.filesArray);
  if (keyxDataJSON[0].error) {
    return {
      type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
      error:
        TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_KEY_FILE +
        keyxDataJSON[0].fileName +
        ', ' +
        keyxDataJSON[0].error
    };
  }

  return {
    type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
    keyData: keyxDataJSON
  };
};
