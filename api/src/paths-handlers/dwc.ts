import { RequestHandler } from 'express';
import { getLogger } from '../utils/logger';
import { DWCArchive } from '../utils/media/dwc/dwc-archive-file';
import { ArchiveFile } from '../utils/media/media-file';
import { parseUnknownMedia } from '../utils/media/media-utils';

const defaultLog = getLogger('paths-request-handlers/dwc');

export function prepDWCArchive(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'prepDWCArchive', message: 's3File' });

    try {
      const s3File = req['s3File'];

      const parsedMedia = parseUnknownMedia(s3File);

      if (!parsedMedia) {
        req['parseError'] = 'Failed to parse submission, file was empty';

        return next();
      }

      if (!(parsedMedia instanceof ArchiveFile)) {
        req['parseError'] = 'Failed to parse submission, not a valid DwC Archive Zip file';

        return next();
      }

      const dwcArchive = new DWCArchive(parsedMedia);

      req['dwcArchive'] = dwcArchive;

      next();
    } catch (error) {
      defaultLog.error({ label: 'prepDWCArchive', message: 'error', error });
      throw error;
    }
  };
}
