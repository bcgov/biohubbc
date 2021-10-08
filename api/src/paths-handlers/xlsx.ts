import { RequestHandler } from 'express';
import { getLogger } from '../utils/logger';
import { MediaFile } from '../utils/media/media-file';
import { parseUnknownMedia } from '../utils/media/media-utils';
import { XLSXCSV } from '../utils/media/xlsx/xlsx-file';

const defaultLog = getLogger('paths-request-handlers/xlsx');

export function prepXLSX(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'prepXLSX', message: 's3File' });

    try {
      const s3File = req['s3File'];

      const parsedMedia = parseUnknownMedia(s3File);

      if (!parsedMedia) {
        req['parseError'] = 'Failed to parse submission, file was empty';

        return next();
      }

      if (!(parsedMedia instanceof MediaFile)) {
        req['parseError'] = 'Failed to parse submission, not a valid XLSX CSV file';

        return next();
      }

      const xlsxCsv = new XLSXCSV(parsedMedia);

      req['xlsxCsv'] = xlsxCsv;

      next();
    } catch (error) {
      defaultLog.error({ label: 'prepXLSX', message: 'error', error });
      throw error;
    }
  };
}
