import AdmZip from 'adm-zip';
import mime from 'mime';
import { MediaFile } from './media-file';

/**
 * Parses an unknown file into an array of MediaFile.
 *
 * Note: The array will always have 1 item unless the unknown file is a zip file containing multiple files.
 *
 * @param {Express.Multer.File} rawMedia
 * @return {*}  {MediaFile[]}
 */
export const parseUnknownMedia = (rawMedia: Express.Multer.File): MediaFile[] => {
  const mimetype = mime.getType(rawMedia.originalname);

  if (mimetype === 'application/zip') {
    return parseUnknownZipFile(rawMedia);
  }

  return [parseUnknownFile(rawMedia)];
};

/**
 * Parse a zip file into an array of MediaFile.
 *
 * Note: Ignores any directory structures, flattening all nested files into a single array.
 *
 * @param {Express.Multer.File} zipFile
 * @return {*}  {MediaFile[]}
 */
export const parseUnknownZipFile = (zipFile: Express.Multer.File): MediaFile[] => {
  const unzippedFile = new AdmZip(zipFile.buffer);
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
export const parseUnknownFile = (file: Express.Multer.File): MediaFile => {
  const fileName = file?.originalname;
  const mimetype = mime.getType(fileName) || '';
  const buffer = file?.buffer;

  return new MediaFile(fileName, mimetype, buffer);
};
