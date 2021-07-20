import AdmZip from 'adm-zip';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import mime from 'mime';
import { MediaFile } from './media-file';

/**
 * Parses an unknown file into an array of MediaFile.
 *
 * Note: The array will always have 1 item unless the unknown file is a zip file containing multiple files.
 *
 * @param {(Express.Multer.File | GetObjectOutput)} rawMedia
 * @return {*}  {MediaFile[]}
 */
export const parseUnknownMedia = (rawMedia: Express.Multer.File | GetObjectOutput): MediaFile[] => {
  if ((rawMedia as Express.Multer.File).originalname) {
    return parseUnknownMulterFile(rawMedia as Express.Multer.File);
  } else {
    return parseUnknownS3File(rawMedia as GetObjectOutput);
  }
};

export const parseUnknownMulterFile = (rawMedia: Express.Multer.File) => {
  const mimetype = mime.getType(rawMedia.originalname);

  if (mimetype === 'application/zip' || mimetype === 'application/x-zip-compressed') {
    return parseUnknownZipFile(rawMedia.buffer);
  }

  return [parseMulterFile(rawMedia)];
};

export const parseUnknownS3File = (rawMedia: GetObjectOutput) => {
  const mimetype = rawMedia.ContentType;

  if (mimetype === 'application/zip' || mimetype === 'application/x-zip-compressed') {
    if (!rawMedia.Body) {
      return [];
    }

    return parseUnknownZipFile(rawMedia.Body as Buffer);
  }

  return [parseS3File(rawMedia)];
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
 * @param {GetObjectOutput} file
 * @return {*}  {MediaFile}
 */
export const parseS3File = (file: GetObjectOutput): MediaFile => {
  const fileName = file?.Metadata?.filename || '';
  const mimetype = mime.getType(fileName) || '';
  const buffer = file?.Body as Buffer;

  return new MediaFile(fileName, mimetype, buffer);
};
