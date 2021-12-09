export interface IMediaFile {
  fileName: string;
  mimetype: string;
  buffer: Buffer;
  mediaValidation: MediaValidation;
}

/**
 * A generic wrapper for any media file.
 *
 * @export
 * @class MediaFile
 * @implements {IMediaFile}
 */
export class MediaFile implements IMediaFile {
  fileName: string;
  mimetype: string;
  buffer: Buffer;
  mediaValidation: MediaValidation;

  constructor(fileName: string, mimetype: string, buffer: Buffer) {
    this.fileName = fileName.toLowerCase();
    this.mimetype = mimetype;
    this.buffer = buffer;
    this.mediaValidation = new MediaValidation(this.fileName);
  }

  /**
   * The file name without extension.
   *
   * @readonly
   * @type {string}
   * @memberof MediaFile
   */
  get name(): string {
    return this.fileName.substring(0, this.fileName.lastIndexOf('.'));
  }

  /**
   * Executes each validator function in the provided `validators` against this instance, returning
   * `this.mediaValidation`
   *
   * @param {MediaValidator[]} validators
   * @return {*}  {MediaValidation}
   * @memberof MediaFile
   */
  validate(validators: MediaValidator[]): MediaValidation {
    validators.forEach((validator) => validator(this));

    return this.mediaValidation;
  }
}

export type MediaValidator = (mediaFile: IMediaFile) => IMediaFile;

/**
 * A generic wrapper for any archive file.
 *
 * @class ArchiveFile
 * @implements {IMediaFile}
 */
export class ArchiveFile implements IMediaFile {
  fileName: string;
  mimetype: string;
  buffer: Buffer;
  mediaValidation: MediaValidation;

  mediaFiles: MediaFile[];

  constructor(fileName: string, mimetype: string, buffer: Buffer, mediaFiles: MediaFile[]) {
    this.fileName = fileName.toLowerCase();
    this.mimetype = mimetype;
    this.buffer = buffer;
    this.mediaValidation = new MediaValidation(this.fileName);

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
    return this.fileName.substring(0, this.fileName.lastIndexOf('.'));
  }

  /**
   * Executes each validator function in the provided `validators` against this instance, returning
   * `this.mediaValidation`
   *
   * @param {ArchiveValidator[]} validators
   * @return {*}  {MediaValidation}
   * @memberof ArchiveFile
   */
  validate(validators: ArchiveValidator[]): MediaValidation {
    validators.forEach((validator) => validator(this));

    return this.mediaValidation;
  }
}

export type ArchiveValidator = (archiveFile: ArchiveFile) => ArchiveFile;

export interface IMediaState {
  fileName: string;
  fileErrors?: string[];
  isValid: boolean;
}

/**
 * Supports getting/setting validation errors for any media file.
 *
 * @export
 * @class MediaValidation
 */
export class MediaValidation {
  fileName: string;
  fileErrors: string[];
  isValid: boolean;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.fileErrors = [];
    this.isValid = true;
  }

  addFileErrors(errors: string[]) {
    this.fileErrors = this.fileErrors.concat(errors);

    if (errors?.length) {
      this.isValid = false;
    }
  }

  getState(): IMediaState {
    return {
      fileName: this.fileName,
      fileErrors: this.fileErrors,
      isValid: this.isValid
    };
  }
}
