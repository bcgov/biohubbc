import { MediaValidator } from '../media-file';

export const getFileEmptyValidator = (): MediaValidator => {
  return (mediaFile) => {
    if (!mediaFile.buffer || !mediaFile.buffer.byteLength) {
      mediaFile.mediaValidation.addFileErrors(['File is empty']);
    }

    return mediaFile;
  };
};

export const getFileMimeTypeValidator = (validMimeTypes: RegExp[]): MediaValidator => {
  return (mediaFile) => {
    if (!validMimeTypes.length) {
      return mediaFile;
    }

    if (!validMimeTypes.some((regex) => regex.test(mediaFile.mimetype))) {
      mediaFile.mediaValidation.addFileErrors([
        `File mime type is invalid, must be one of: ${validMimeTypes.join(', ')}`
      ]);
    }

    return mediaFile;
  };
};
