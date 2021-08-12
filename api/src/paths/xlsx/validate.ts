import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getLogger } from '../../utils/logger';
import { ICsvState, XLSX_CSV } from '../../utils/media/csv/csv-file';
import { XLSXCSV, XLSX_CLASS } from '../../utils/media/csv/csv-file';
import { getXLSXCSVValidators, getXLSXMediaValidators } from '../../utils/media/csv/xlsx/xlsx-validator';
import { IMediaState, MediaFile } from '../../utils/media/media-file';
import { parseUnknownMedia } from '../../utils/media/media-utils';
import { logRequest } from '../../utils/path-utils';
import {
  getSubmissionFileFromS3,
  getSubmissionS3Key,
  getValidateAPIDoc,
  persistParseErrors,
  persistValidationResults
} from '../dwc/validate';

const defaultLog = getLogger('paths/xlsx/validate');

export const POST: Operation = [
  logRequest('paths/xlsx/validate', 'POST'),
  getSubmissionS3Key(),
  getSubmissionFileFromS3(),
  prepXLSX(),
  persistParseErrors(),
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

function getValidationRules(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getValidationRules', message: 's3File' });

    try {
      // TODO fetch/generate validation rules from reference data service
      const mediaValidationRules = {
        [XLSX_CSV.STRUCTURE]: getXLSXMediaValidators(),
        [XLSX_CLASS.SAMPLE_STATION_INFORMATION]: getXLSXMediaValidators(),
        [XLSX_CLASS.GENERAL_SURVEY]: getXLSXMediaValidators(),
        [XLSX_CLASS.SITE_INCIDENTAL_OBSERVATIONS]: getXLSXMediaValidators()
      };

      req['mediaValidationRules'] = mediaValidationRules;

      // TODO fetch/generate validation rules from reference data service
      const contentValidationRules = {
        [XLSX_CLASS.SAMPLE_STATION_INFORMATION]: getXLSXCSVValidators(XLSX_CLASS.SAMPLE_STATION_INFORMATION),
        [XLSX_CLASS.GENERAL_SURVEY]: getXLSXCSVValidators(XLSX_CLASS.GENERAL_SURVEY),
        [XLSX_CLASS.SITE_INCIDENTAL_OBSERVATIONS]: getXLSXCSVValidators(XLSX_CLASS.SITE_INCIDENTAL_OBSERVATIONS)
      };

      req['contentValidationRules'] = contentValidationRules;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'getValidationRules', message: 'error', error });
      throw error;
    }
  };
}

function validateXLSX(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'validateXLSX', message: 'dwcArchive' });

    try {
      const xlsxCsv: XLSXCSV = req['xlsx'];

      const mediaValidationRules = req['mediaValidationRules'];

      const mediaState: IMediaState[] = xlsxCsv.isMediaValid(mediaValidationRules);

      if (mediaState.some((item) => !item.isValid)) {
        req['mediaState'] = mediaState;

        // The file itself is invalid, skip content validation
        return next();
      }

      const contentValidationRules = req['contentValidationRules'];

      const csvState: ICsvState[] = xlsxCsv.isContentValid(contentValidationRules);

      req['csvState'] = csvState;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'validateXLSX', message: 'error', error });
      throw error;
    }
  };
}
