import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import AdmZip from 'adm-zip';
import mime from 'mime';
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
        .filter((item) => !item.isDirectory && !item.entryName.startsWith('__MACOSX/'))
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
