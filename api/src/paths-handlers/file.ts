import { RequestHandler } from 'express';
import { HTTP500 } from '../errors/CustomError';
import { getFileFromS3 } from '../utils/file-utils';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('paths-request-handlers/file');

/**
 * Get a single file from S3.
 *
 * Reads:
 * - req.s3Key
 *
 * @export
 * @throws {HTTP500} if S3 returns a falsy response.
 * @return {*}  {RequestHandler}
 */
export function getS3File(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getS3File', message: 'params', files: req.body });

    try {
      const s3Key = req['s3Key'];

      const s3File = await getFileFromS3(s3Key);

      if (!s3File) {
        throw new HTTP500('Failed to get file from S3');
      }

      req['s3File'] = s3File;

      next();
    } catch (error) {
      defaultLog.error({ label: 'getS3File', message: 'error', error });
      throw error;
    }
  };
}
