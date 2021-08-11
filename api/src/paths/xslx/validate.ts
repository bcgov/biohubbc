import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getLogger } from '../../utils/logger';
import { ICsvState } from '../../utils/media/csv/csv-file';
import { XSLX } from '../../utils/media/csv/xslx/xslx-file';
import { getXSLXCSVValidators, getXSLXMediaValidators, XSLX_CLASS } from '../../utils/media/csv/xslx/xslx-validator';
import { IMediaState } from '../../utils/media/media-file';
import { parseUnknownMedia } from '../../utils/media/media-utils';
import { logRequest } from '../../utils/path-utils';
import {
  getSubmissionFileFromS3,
  getSubmissionS3Key,
  getValidateAPIDoc,
  persistValidationResults
} from '../dwc/validate';

const defaultLog = getLogger('paths/xslx/validate');

export const POST: Operation = [
  logRequest('paths/xslx/validate', 'POST'),
  getSubmissionS3Key(),
  getSubmissionFileFromS3(),
  prepXSLX(),
  getValidationRules(),
  validateXSLX(),
  persistValidationResults({ initialSubmissionStatusType: 'Template Validated' })
];

POST.apiDoc = {
  ...getValidateAPIDoc(
    'Validates an XSLX survey observation submission.',
    'Validate XSLX survey observation submission OK',
    ['survey', 'observation', 'xslx']
  )
};

function prepXSLX(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'prepXSLX', message: 's3File' });

    try {
      const s3File = req['s3File'];

      const mediaFiles = parseUnknownMedia(s3File);

      const xslx = new XSLX(mediaFiles);

      req['xslx'] = xslx;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'prepXSLX', message: 'error', error });
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
        [XSLX_CLASS.SAMPLE_STATION_INFORMATION]: getXSLXMediaValidators(),
        [XSLX_CLASS.GENERAL_SURVEY]: getXSLXMediaValidators(),
        [XSLX_CLASS.SITE_INCIDENTAL_OBSERVATIONS]: getXSLXMediaValidators()
      };

      req['mediaValidationRules'] = mediaValidationRules;

      // TODO fetch/generate validation rules from reference data service
      const contentValidationRules = {
        [XSLX_CLASS.SAMPLE_STATION_INFORMATION]: getXSLXCSVValidators(XSLX_CLASS.SAMPLE_STATION_INFORMATION),
        [XSLX_CLASS.GENERAL_SURVEY]: getXSLXCSVValidators(XSLX_CLASS.GENERAL_SURVEY),
        [XSLX_CLASS.SITE_INCIDENTAL_OBSERVATIONS]: getXSLXCSVValidators(XSLX_CLASS.SITE_INCIDENTAL_OBSERVATIONS)
      };

      req['contentValidationRules'] = contentValidationRules;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'getValidationRules', message: 'error', error });
      throw error;
    }
  };
}

function validateXSLX(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'validateXSLX', message: 'dwcArchive' });

    try {
      const xslx: XSLX = req['xslx'];

      const mediaValidationRules = req['mediaValidationRules'];

      const mediaState: IMediaState[] = xslx.isMediaValid(mediaValidationRules);

      if (mediaState.some((item) => !item.isValid)) {
        req['mediaState'] = mediaState;

        // The file itself is invalid, skip content validation
        return next();
      }

      const contentValidationRules = req['contentValidationRules'];

      const csvState: ICsvState[] = xslx.isContentValid(contentValidationRules);

      req['csvState'] = csvState;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'validateXSLX', message: 'error', error });
      throw error;
    }
  };
}
