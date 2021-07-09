export interface IMediaFile {
  fileName: string;
  mimetype: string;
  buffer: Buffer;
  mediaValidation: MediaValidation;
  validate: (validators: MediaValidator[]) => MediaValidation;
}

/**
 * A generic wrapper for any media file.
 *
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
    this.fileName = fileName;
    this.mimetype = mimetype;
    this.buffer = buffer;
    this.mediaValidation = new MediaValidation(this.fileName);
  }

  validate(validators: MediaValidator[]): MediaValidation {
    validators.forEach((validator) => validator(this));

    return this.mediaValidation;
  }
}

export type MediaValidator = (mediaFile: IMediaFile, ...rest: any) => IMediaFile;

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
