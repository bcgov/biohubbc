import { Request } from 'express';

/**
 * Get file by index from request or throws error if missing. Defaults to first file.
 *
 * @param {Request} req
 * @param {number} [fileIndex] - Index of file defaults to 0
 * @throws {Error} - If unable to retrieve file
 * @returns {Express.Multer.File} Multer file
 */
export const getFileFromRequest = (req: Request, fileIndex = 0): Express.Multer.File => {
  if (!req.files || !req.files[fileIndex]) {
    throw new Error(`Request missing file. Unable to retrieve file at index ${fileIndex}.`);
  }

  return req.files[fileIndex];
};
