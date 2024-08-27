import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import AdmZip from 'adm-zip';
import mime from 'mime';
import { TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE } from '../../constants/attachments';
import { ArchiveFile, MediaFile } from './media-file';

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

    return new ArchiveFile(archiveFile.fileName, archiveFile.mimetype, archiveFile.buffer, mediaFiles);
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

    return new ArchiveFile(archiveFile.fileName, archiveFile.mimetype, archiveFile.buffer, mediaFiles);
  }

  return await parseS3File(rawMedia);
};

/**
 * Parse a zip file  buffer into an array of MediaFile.
 *
 * Note: Ignores any directory structures, flattening all nested files into a single array.
 *
 * @param {Buffer} zipFile
 * @return {*}  {MediaFile[]}
 */
export const parseUnknownZipFile = (zipFile: Buffer): MediaFile[] => {
  const unzippedFile = new AdmZip(zipFile);
  const entries = unzippedFile.getEntries();

  return entries
    .filter((item) => !item.isDirectory)
    .map((item) => {
      const fileName = item?.name;
      const mimetype = mime.getType(fileName) || '';
      const buffer = item?.getData();

      return new MediaFile(fileName, mimetype, buffer);
    });
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

/**
 * Checks if the file is a valid telemetry credential file.
 *
 * @param {Express.Multer.File} file
 * @return {*}  {({
 *   type: 'unknown' | TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE;
 *   error?: string;
 * })}
 */
export const isValidTelementryCredentialFile = (
  file: Express.Multer.File
): {
  type: 'unknown' | TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE;
  error?: string;
} => {
  const isKeyX = checkFileForKeyx(file);

  if (isKeyX.error === undefined) {
    return isKeyX;
  }

  const isCfg = checkFileForCfg(file);

  if (isCfg.error === undefined) {
    return isCfg;
  }

  return {
    type: 'unknown',
    error: 'The file is neither a .keyx or .cfg file, nor is it an archive containing only files of these types.'
  };
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
export const checkFileForKeyx = (
  file: Express.Multer.File
): {
  type: 'unknown' | TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX;
  error?: string;
} => {
  // File is a KeyX file if it ends in '.keyx'
  if (file?.originalname.endsWith('.keyx')) {
    return { type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX };
  }

  const mimeType = mime.getType(file.originalname) ?? '';
  if (!isZipMimetype(mimeType)) {
    // File cannot be a KeyX file, since it is not an archive nor does it have a .keyx extension
    return {
      type: 'unknown',
      error: 'File is neither a .keyx file, nor an archive containing only .keyx files'
    };
  }

  const zipEntries = parseUnknownZipFile(file.buffer);
  if (zipEntries.length === 0) {
    // File is a zip file, but it is empty
    return { type: 'unknown', error: 'File is an archive that contains no content' };
  }

  // Return false if any of the files in the zip are not keyx files
  const result = zipEntries.every((zipEntry) => zipEntry.fileName.endsWith('.keyx'));

  if (!result) {
    return { type: 'unknown', error: 'File is an archive that contains non .keyx files' };
  }

  return { type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.KEYX };
};

/**
 * Returns true if the file is a cfg file, or a zip that contains only cfg files.
 *
 * @export
 * @param {Express.Multer.File} file
 * @return {*}  {({
 *   type: 'unknown' | TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG;
 *   error?: string;
 * })}
 */
export const checkFileForCfg = (
  file: Express.Multer.File
): {
  type: 'unknown' | TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG;
  error?: string;
} => {
  // File is a Cfg file if it ends in '.cfg'
  if (file?.originalname.endsWith('.cfg')) {
    return { type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG };
  }

  const mimeType = mime.getType(file.originalname) ?? '';
  if (!isZipMimetype(mimeType)) {
    // File cannot be a Cfg file, since it is not an archive nor does it have a .cfg extension
    return {
      type: 'unknown',
      error: 'File is neither a .cfg file, nor an archive containing only .cfg files'
    };
  }

  const zipEntries = parseUnknownZipFile(file.buffer);
  if (zipEntries.length === 0) {
    // File is a zip file, but it is empty
    return { type: 'unknown', error: 'File is an archive that contains no content' };
  }

  // Return false if any of the files in the zip are not cfg files
  const result = zipEntries.every((zipEntry) => zipEntry.fileName.endsWith('.cfg'));

  if (!result) {
    return { type: 'unknown', error: 'File is an archive that contains non .cfg files' };
  }

  return { type: TELEMETRY_CREDENTIAL_ATTACHMENT_TYPE.CFG };
};
