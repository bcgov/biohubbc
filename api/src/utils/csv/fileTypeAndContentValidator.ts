import Papa, { ParseConfig, ParseResult } from 'papaparse';

// File type and content validation helper functions

export const isFileNull = (file: Express.Multer.File): boolean => {
  if (!file) {
    return true;
  }

  return false;
};

export const isFileMimeValid = (file: Express.Multer.File, validMimeTypes: string[]): boolean => {
  if (!validMimeTypes?.length) {
    return true;
  }

  if (!validMimeTypes.includes(file.mimetype)) {
    return false;
  }

  return true;
};

export const getFileContent = (file: Express.Multer.File, options?: ParseConfig<string[]>): ParseResult<string[]> => {
  return Papa.parse(file.buffer.toString(), options);
};

export const isCSVNull = (data: string[][]): boolean => {
  if (!data?.length) {
    return true;
  }

  return false;
};
