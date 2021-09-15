import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getLogger } from '../../utils/logger';
import { ICsvState } from '../../utils/media/csv/csv-file';
import { IMediaState, MediaFile } from '../../utils/media/media-file';
import { parseUnknownMedia } from '../../utils/media/media-utils';
import { ValidationSchemaParser } from '../../utils/media/validation/validation-schema-parser';
import { XLSXCSV } from '../../utils/media/xlsx/xlsx-file';
import { logRequest } from '../../utils/path-utils';
import {
  getSubmissionFileFromS3,
  getSubmissionS3Key,
  getValidateAPIDoc,
  getValidationRules,
  persistParseErrors,
  persistValidationResults,
  getValidationSchema
} from '../dwc/validate';

const defaultLog = getLogger('paths/xlsx/validate');

export const POST: Operation = [
  logRequest('paths/xlsx/validate', 'POST'),
  getSubmissionS3Key(),
  getSubmissionFileFromS3(),
  prepXLSX(),
  persistParseErrors(),
  getValidationSchema(),
  getValidationRules(),
  validateXLSX(),
  persistValidationResults({ initialSubmissionStatusType: 'Template Validated' })
];

POST.apiDoc = {
  ...getValidateAPIDoc(
    'Validates an XLSX survey observation submission.',
    'Validate XLSX survey observation submission OK',
    ['survey', 'observation', 'xlsx']
  )
};

function prepXLSX(): RequestHandler {
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

      req['xlsx'] = xlsxCsv;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'prepXLSX', message: 'error', error });
      throw error;
    }
  };
}

function validateXLSX(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'validateXLSX', message: 'dwcArchive' });

    try {
      const xlsxCsv: XLSXCSV = req['xlsx'];

      const validationSchemaParser: ValidationSchemaParser = req['validationSchemaParser'];

      const mediaState: IMediaState = xlsxCsv.isMediaValid(validationSchemaParser);

      if (!mediaState.isValid) {
        req['mediaState'] = mediaState;

        // The file itself is invalid, skip remaining validation
        return next();
      }

      const csvState: ICsvState[] = xlsxCsv.isContentValid(validationSchemaParser);

      req['csvState'] = csvState;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'validateXLSX', message: 'error', error });
      throw error;
    }
  };
}
