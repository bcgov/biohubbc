import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, IDBConnection } from '../../database/db';
import { HTTP400, HTTP500 } from '../../errors/CustomError';
import {
  getSurveyOccurrenceSubmissionSQL,
  insertSurveySubmissionMessageSQL,
  insertSurveySubmissionStatusSQL
} from '../../queries/survey/survey-occurrence-queries';
import { getFileFromS3 } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';
import { ICsvState } from '../../utils/media/csv/csv-file';
import { DWCArchive, DWC_CLASS } from '../../utils/media/csv/dwc/dwc-archive-file';
import { getDWCCSVValidators, getDWCMediaValidators } from '../../utils/media/csv/dwc/dwc-archive-validator';
import { IMediaState } from '../../utils/media/media-file';
import { parseUnknownMedia } from '../../utils/media/media-utils';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('paths/dwc/validate');

export const POST: Operation = [
  logRequest('paths/dwc/validate', 'POST'),
  getSubmissionS3Key(),
  getSubmissionFileFromS3(),
  prepDWCArchive(),
  getValidationRules(),
  validateDWCArchive(),
  persistValidationResults()
];

POST.apiDoc = {
  description: 'Validates a Darwin Core (DWC) Archive survey observation submission.',
  tags: ['survey', 'observation', 'dwc'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  requestBody: {
    description: 'Request body',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['occurrence_submission_id'],
          properties: {
            occurrence_submission_id: {
              description: 'A survey occurrence submission ID',
              type: 'number',
              example: 1
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Validate Darwin Core (DWC) Archive survey observation submission OK'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/401'
    },
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

function getSubmissionS3Key(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getSubmissionS3Key', message: 'params', files: req.body });

    const connection = getDBConnection(req['keycloak_token']);

    const occurrenceSubmissionId = req.body.occurrence_submission_id;

    if (!occurrenceSubmissionId) {
      throw new HTTP400('Missing required body param `occurrence_submission_id`.');
    }

    try {
      const sqlStatement = getSurveyOccurrenceSubmissionSQL(occurrenceSubmissionId);

      if (!sqlStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      if (!response || !response.rows.length) {
        throw new HTTP400('Failed to get survey occurrence submission');
      }

      const s3Key = response.rows[0].key;

      req['s3Key'] = s3Key;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'getSubmissionS3Key', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

function getSubmissionFileFromS3(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getSubmissionFileFromS3', message: 'params', files: req.body });

    try {
      const s3Key = req['s3Key'];

      const s3File = await getFileFromS3(s3Key);

      if (!s3File) {


        throw new HTTP500('Failed to get occurrence submission file');
      }

      req['s3File'] = s3File;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'getSubmissionFileFromS3', message: 'error', error });
      throw error;
    }
  };
}

function prepDWCArchive(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'prepDWCArchive', message: 's3File' });

    try {
      const s3File = req['s3File'];

      const mediaFiles = parseUnknownMedia(s3File);

      const dwcArchive = new DWCArchive(mediaFiles);

      req['dwcArchive'] = dwcArchive;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'prepDWCArchive', message: 'error', error });
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
        [DWC_CLASS.EVENT]: getDWCMediaValidators(DWC_CLASS.EVENT),
        [DWC_CLASS.OCCURRENCE]: getDWCMediaValidators(DWC_CLASS.OCCURRENCE),
        [DWC_CLASS.MEASUREMENTORFACT]: getDWCMediaValidators(DWC_CLASS.MEASUREMENTORFACT),
        [DWC_CLASS.RESOURCERELATIONSHIP]: getDWCMediaValidators(DWC_CLASS.RESOURCERELATIONSHIP),
        [DWC_CLASS.TAXON]: getDWCMediaValidators(DWC_CLASS.TAXON),
        [DWC_CLASS.META]: getDWCMediaValidators(DWC_CLASS.META)
      };

      req['mediaValidationRules'] = mediaValidationRules;

      // TODO fetch/generate validation rules from reference data service
      const contentValidationRules = {
        [DWC_CLASS.EVENT]: getDWCCSVValidators(DWC_CLASS.EVENT),
        [DWC_CLASS.OCCURRENCE]: getDWCCSVValidators(DWC_CLASS.OCCURRENCE),
        [DWC_CLASS.MEASUREMENTORFACT]: getDWCCSVValidators(DWC_CLASS.MEASUREMENTORFACT),
        [DWC_CLASS.RESOURCERELATIONSHIP]: getDWCCSVValidators(DWC_CLASS.RESOURCERELATIONSHIP),
        [DWC_CLASS.TAXON]: getDWCCSVValidators(DWC_CLASS.TAXON),
        [DWC_CLASS.META]: getDWCCSVValidators(DWC_CLASS.META)
      };

      req['contentValidationRules'] = contentValidationRules;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'getValidationRules', message: 'error', error });
      throw error;
    }
  };
}

function validateDWCArchive(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'validateDWCArchive', message: 'dwcArchive' });

    try {
      const dwcArchive: DWCArchive = req['dwcArchive'];

      const mediaValidationRules = req['mediaValidationRules'];

      const mediaState: IMediaState[] = dwcArchive.isMediaValid(mediaValidationRules);

      if (mediaState.some((item) => !item.isValid)) {
        req['mediaState'] = mediaState;

        // The file itself is invalid, skip content validation
        return next();
      }

      const contentValidationRules = req['contentValidationRules'];

      const csvState: ICsvState[] = dwcArchive.isContentValid(contentValidationRules);

      req['csvState'] = csvState;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'validateDWCArchive', message: 'error', error });
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

      let submissionStatusType = 'Darwin Core Validated';
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

/**
 * Insert a record into the submission_status table.
 *
 * @param {number} occurrenceSubmissionId
 * @param {string} submissionStatusType
 * @param {IDBConnection} connection
 * @return {*}  {Promise<number>}
 */
export const insertSubmissionStatus = async (
  occurrenceSubmissionId: number,
  submissionStatusType: string,
  connection: IDBConnection
): Promise<number> => {
  const sqlStatement = insertSurveySubmissionStatusSQL(occurrenceSubmissionId, submissionStatusType);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert survey submission status data');
  }

  return result.id;
};

/**
 * Insert a record into the submission_message table.
 *
 * @param {number} submissionStatusId
 * @param {string} submissionMessageType
 * @param {string} message
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const insertSubmissionMessage = async (
  submissionStatusId: number,
  submissionMessageType: string,
  message: string,
  connection: IDBConnection
): Promise<void> => {
  const sqlStatement = insertSurveySubmissionMessageSQL(submissionStatusId, submissionMessageType, message);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to insert survey submission message data');
  }
};
