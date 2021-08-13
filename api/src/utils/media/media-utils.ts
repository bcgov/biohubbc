import AdmZip from 'adm-zip';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import mime from 'mime';
import { ArchiveFile, MediaFile } from './media-file';

/**
 * Parses an unknown file into an array of MediaFile.
 *
 * Note: The array will always have 1 item unless the unknown file is a zip file containing multiple files, in which
 * case the array will have 1 item per file in the zip (folders ignored).
 *
 * @param {(Express.Multer.File | GetObjectOutput)} rawMedia
 * @return {*}  {(MediaFile | ArchiveFile)}
 */
export const parseUnknownMedia = (rawMedia: Express.Multer.File | GetObjectOutput): null | MediaFile | ArchiveFile => {
  if ((rawMedia as Express.Multer.File).originalname) {
    return parseUnknownMulterFile(rawMedia as Express.Multer.File);
  } else {
    return parseUnknownS3File(rawMedia as GetObjectOutput);
  }
};

export const parseUnknownMulterFile = (rawMedia: Express.Multer.File): null | MediaFile | ArchiveFile => {
  const mimetype = mime.getType(rawMedia.originalname);

  if (isZipMimetype(mimetype || '')) {
    const archiveFile = parseMulterFile(rawMedia);
    const mediaFiles = parseUnknownZipFile(rawMedia.buffer);

    return new ArchiveFile(archiveFile.fileName, archiveFile.mimetype, archiveFile.buffer, mediaFiles);
  }

  return parseMulterFile(rawMedia);
};

export const parseUnknownS3File = (rawMedia: GetObjectOutput): null | MediaFile | ArchiveFile => {
  const mimetype = rawMedia.ContentType;

  if (isZipMimetype(mimetype || '')) {
    if (!rawMedia.Body) {
      return null;
    }

    const archiveFile = parseS3File(rawMedia);
    const mediaFiles = parseUnknownZipFile(rawMedia.Body as Buffer);

    return new ArchiveFile(archiveFile.fileName, archiveFile.mimetype, archiveFile.buffer, mediaFiles);
  }

  return parseS3File(rawMedia);
};

/**
 * Parse a zip file  buffer into an array of MediaFile.
 *
 * Note: Ignores any directory structures, flattening all nested files into a single array.
 *
 * @param {Buffer} zipFile
 * @return {*}  {ArchiveFile}
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

export const isZipMimetype = (mimetype: string): boolean => {
  if (!mimetype) {
    return false;
  }

  return [/application\/zip/, /application\/x-zip-compressed/, /application\/x-rar-compressed/].some((regex) =>
    regex.test(mimetype)
  );
};
