import { parseBase64DataURLString } from './../utils/file-utils';

/**
 * A single media item.
 *
 * @export
 * @interface IMediaItem
 */
export interface IMediaItem {
  media_date?: string;
  description?: string;
  file_name: string;
  encoded_file: string;
}

/**
 * Media object for Data URL base64 encoded files.
 *
 * @export
 * @class MediaBase64
 */
export class MediaBase64 {
  mediaName: string;
  contentType: string;
  contentString: string;
  mediaBuffer: Buffer;
  mediaDescription: string;
  mediaDate: string;

  /**
   * Creates an instance of MediaBase64.
   *
   * @param {IMediaItem} obj
   * @memberof MediaBase64
   */
  constructor(obj: IMediaItem) {
    if (!obj) {
      throw new Error('media was null');
    }

    const base64StringParts = parseBase64DataURLString(obj.encoded_file);

    if (!base64StringParts) {
      throw new Error('media encoded_file could not be parsed');
    }

    this.contentType = base64StringParts.contentType;
    this.contentString = base64StringParts.contentString;
    this.mediaName = obj.file_name;
    this.mediaBuffer = Buffer.from(base64StringParts.contentString, 'base64');
    this.mediaDescription = obj.description || '';
    this.mediaDate = obj.media_date || '';
  }
}
