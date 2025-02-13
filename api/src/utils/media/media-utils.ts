import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import AdmZip from 'adm-zip';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import mime from 'mime';
import {
  TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING,
  TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE,
  TELEMETRY_CREDENTIAL_ATTACHMENT_VECTRONIC_XMLTAGS
} from '../../constants/attachments';
import {
  convertLotekCredentialFileToJson,
  findVectronicExpectedTags,
  IMultipleData,
  mapKeyxData,
  validateCfgFormat,
  xmlParserOptions
} from '../../services/telemetry-services/telemetry-utils';
import { TelemetryVectronicService } from '../../services/telemetry-services/telemetry-vectronic-service';
import { ArchiveFile, MediaFile } from './media-file';

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
  keyData?: IMultipleData[]; // Array<{}>;
  /**
   * Error message place holder
   *
   * @type {string}
   */
  error?: string;
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
 * @returns {{
 *   filesArray: MediaFile[];
 *   error?: string;
 * }}
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

/**
 * Check for supported compression mime types
 *
 * @param {string} mimetype
 * @returns {boolean}
 */
export const isZipMimetype = (mimetype: string): boolean => {
  if (!mimetype) {
    return false;
  }

  return [/application\/zip/, /application\/x-zip-compressed/, /application\/x-rar-compressed/].some((regex) =>
    regex.test(mimetype)
  );
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
  if (file.originalname.toLowerCase().endsWith('.keyx')) {
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
    } catch (error) {
      keyStatus = {
        type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX,
        error:
          TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.INVALID_XML_FILE +
          TELEMETRY_CREDENTIAL_ATTACHMENT_ERROR_STRING.KEYX_NOT_FOUND
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
  if (file?.originalname.toLowerCase().endsWith('.cfg')) {
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

    let keyStatus;
    try {
      await telemetryVectronicService.fetchTelemetrySepCountFromVectronic(jsonKeyxData.id, jsonKeyxData.key);
      keyStatus = true;
    } catch (error) {
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
  if (!file?.originalname.toLowerCase().endsWith('.zip')) {
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
  const keyxDataJSON = await processKeyxFilesArray(zipEntries.filesArray, telemetryVectronicService);
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
