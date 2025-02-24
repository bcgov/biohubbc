/**
 * A generic wrapper for any media file.
 *
 * @export
 * @class MediaFile
 */
export class MediaFile {
  fileName: string;
  mimetype: string;
  buffer: Buffer;

  constructor(fileName: string, mimetype: string, buffer: Buffer) {
    this.fileName = fileName.toLowerCase();
    this.mimetype = mimetype;
    this.buffer = buffer;
  }

  /**
   * The file name without extension.
   *
   * @readonly
   * @type {string}
   * @memberof MediaFile
   */
  get name(): string {
    const lastPeriodIndex = this.fileName.lastIndexOf('.');

    if (lastPeriodIndex >= 0) {
      // strip out the file extension, if it exists
      return this.fileName.substring(0, lastPeriodIndex);
    } else {
      return this.fileName;
    }
  }
}

/**
 * A generic wrapper for any archive file.
 *
 * @class ArchiveFile
 * @implements {IMediaFile}
 */
export class ArchiveFile {
  fileName: string;
  mimetype: string;
  buffer: Buffer;

  mediaFiles: MediaFile[];

  constructor(fileName: string, mimetype: string, buffer: Buffer, mediaFiles: MediaFile[]) {
    this.fileName = fileName.toLowerCase();
    this.mimetype = mimetype;
    this.buffer = buffer;

    this.mediaFiles = mediaFiles;
  }

  /**
   * The file name without extension.
   *
   * @readonly
   * @type {string}
   * @memberof ArchiveFile
   */
  get name(): string {
    const lastPeriodindex = this.fileName.lastIndexOf('.');

    if (lastPeriodindex >= 0) {
      // strip out the file extension, if it exists
      return this.fileName.substring(0, lastPeriodindex);
    } else {
      return this.fileName;
    }
  }
}
