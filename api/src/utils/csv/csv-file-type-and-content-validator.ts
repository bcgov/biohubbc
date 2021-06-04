import { CSVValidator } from './csv-validation';

export const getFileNullOrEmptyValidator = (): CSVValidator => {
  return (file) => {
    if (!file || !file.buffer) {
      file.csvValidation.setFileErrors(['FIle is null or empty']);
    }

    return file;
  };
};

export const getFileMimeTypeValidator = (validMimeTypes: string[]): CSVValidator => {
  return (file) => {
    if (!validMimeTypes?.length) {
      return file;
    }

    if (!validMimeTypes.includes(file.mimetype)) {
      file.csvValidation.setFileErrors([`File mime type is invalid, must be one of: ${validMimeTypes.join(', ')}`]);
    }

    return file;
  };
};
