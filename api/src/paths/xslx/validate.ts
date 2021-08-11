import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
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
  insertSubmissionMessage,
  insertSubmissionStatus
} from '../dwc/validate';

const defaultLog = getLogger('paths/xslx/validate');

export const POST: Operation = [
  logRequest('paths/xslx/validate', 'POST'),
  getSubmissionS3Key(),
  getSubmissionFileFromS3(),
  prepXSLX(),
  getValidationRules(),
  validateXSLX(),
  persistValidationResults()
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

function persistValidationResults(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'persistValidationResults', message: 'validationResults' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const mediaState: IMediaState[] = req['mediaState'];
      const csvState: ICsvState[] = req['csvState'];

      await connection.open();

      let submissionStatusType = 'Template Validated';
      if (mediaState?.some((item) => !item.isValid) || csvState?.some((item) => !item.isValid)) {
        // At least 1 error exists
        submissionStatusType = 'Rejected';
      }

      const submissionStatusId = await insertSubmissionStatus(
        req.body.occurrence_submission_id,
        submissionStatusType,
        connection
      );

      const promises: Promise<any>[] = [];

      mediaState?.forEach((mediaStateItem) => {
        mediaStateItem.fileErrors?.forEach((fileError) => {
          promises.push(
            insertSubmissionMessage(
              submissionStatusId,
              'Error',
              `${mediaStateItem.fileName} - ${fileError}`,
              connection
            )
          );
        });
      });

      csvState?.forEach((csvStateItem) => {
        csvStateItem.headerErrors?.forEach((headerError) => {
          promises.push(
            insertSubmissionMessage(
              submissionStatusId,
              'Error',
              `${csvStateItem.fileName} - ${headerError.type} - ${headerError.code} - ${headerError.col} - ${headerError.message}`,
              connection
            )
          );
        });

        csvStateItem.rowErrors?.forEach((rowError) => {
          promises.push(
            insertSubmissionMessage(
              submissionStatusId,
              'Error',
              `${csvStateItem.fileName} - ${rowError.type} - ${rowError.code} - ${rowError.row} - ${rowError.message}`,
              connection
            )
          );
        });
      });

      await Promise.all(promises);

      await connection.commit();

      // TODO return something to indicate if any errors had been found, or not?
      return res.status(200).json();
    } catch (error) {
      defaultLog.debug({ label: 'persistValidationResults', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
