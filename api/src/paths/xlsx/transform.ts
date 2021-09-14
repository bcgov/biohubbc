import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, IDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/CustomError';
import {
  getValidationSchemaSQL,
  insertOccurrenceSubmissionMessageSQL,
  insertOccurrenceSubmissionStatusSQL
} from '../../queries/survey/survey-occurrence-queries';
import { getLogger } from '../../utils/logger';
import { ICsvState } from '../../utils/media/csv/csv-file';
import { IMediaState } from '../../utils/media/media-file';
import { TransformationSchemaParser } from '../../utils/media/xlsx/transformation/transformation-schema-parser';
import { XLSXCSV } from '../../utils/media/xlsx/xlsx-file';
import { logRequest } from '../../utils/path-utils';
import {
  generateHeaderErrorMessage,
  generateRowErrorMessage,
  getSubmissionFileFromS3,
  getSubmissionS3Key
} from '../dwc/validate';
import { prepXLSX } from './validate';

const defaultLog = getLogger('paths/xlsx/transform');

export const POST: Operation = [
  logRequest('paths/xlsx/transform', 'POST'),
  getSubmissionS3Key(),
  getSubmissionFileFromS3(),
  prepXLSX(),
  persistParseErrors(),
  getTransformationSchema(),
  getTransformationRules(),
  transformXLSX(),
  persistTransformationResults()
];

POST.apiDoc = {
  description: 'Transforms an XLSX survey observation submission file into a Darwin Core Archive file',
  tags: ['survey', 'observation', 'xlsx'],
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
      description: 'Transform XLSX survey observation submission OK'
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

export function persistParseErrors(): RequestHandler {
  return async (req, res, next) => {
    const parseError = req['parseError'];

    if (!parseError) {
      // no errors to persist, skip to next step
      return next();
    }

    // file is not parsable, don't continue to next step and return early
    return res.status(200).json();
  };
}

export function getTransformationSchema(): RequestHandler {
  return async (req, res, next) => {
    req['transformationSchema'] = {};

    next();
  };
}

export function getTransformationRules(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getTransformationRules', message: 's3File' });

    try {
      const transformationSchema: JSON = req['transformationSchema'];

      const transformationSchemaParser = new TransformationSchemaParser(transformationSchema);

      req['transformationSchemaParser'] = transformationSchemaParser;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'getTransformationRules', message: 'error', error });
      throw error;
    }
  };
}

function transformXLSX(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'validateXLSX', message: 'xlsx' });

    try {
      const xlsxCsv: XLSXCSV = req['xlsx'];

      const mediaValidationRules = req['mediaValidationRules'];

      const mediaState: IMediaState = xlsxCsv.isMediaValid(mediaValidationRules);

      if (!mediaState.isValid) {
        req['mediaState'] = mediaState;

        // The file itself is invalid, skip content validation
        return next();
      }

      const contentValidationRules = req['contentValidationRules'];

      const csvState: ICsvState[] = xlsxCsv.isContentValid(contentValidationRules);

      req['csvState'] = csvState;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'validateDWCArchive', message: 'error', error });
      throw error;
    }
  };
}

export function persistTransformationResults(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'persistTransformationResults', message: 'validationResults' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const mediaState: IMediaState[] = req['mediaState'];
      const csvState: ICsvState[] = req['csvState'];

      await connection.open();

      let submissionStatusType = 'Template Transformed';
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
            insertSubmissionMessage(submissionStatusId, 'Error', `${fileError}`, 'Miscellaneous', connection)
          );
        });
      });

      csvState?.forEach((csvStateItem) => {
        csvStateItem.headerErrors?.forEach((headerError) => {
          promises.push(
            insertSubmissionMessage(
              submissionStatusId,
              'Error',
              generateHeaderErrorMessage(csvStateItem.fileName, headerError),
              headerError.errorCode,
              connection
            )
          );
        });

        csvStateItem.rowErrors?.forEach((rowError) => {
          promises.push(
            insertSubmissionMessage(
              submissionStatusId,
              'Error',
              generateRowErrorMessage(csvStateItem.fileName, rowError),
              rowError.errorCode,
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
      defaultLog.debug({ label: 'persistTransformationResults', message: 'error', error });
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
  const sqlStatement = insertOccurrenceSubmissionStatusSQL(occurrenceSubmissionId, submissionStatusType);

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
  errorCode: string,
  connection: IDBConnection
): Promise<void> => {
  const sqlStatement = insertOccurrenceSubmissionMessageSQL(
    submissionStatusId,
    submissionMessageType,
    message,
    errorCode
  );

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to insert survey submission message data');
  }
};

/**
 * Get a validation schema from the template table.
 *
 * @param {number} occurrenceSubmissionId
 * @param {IDBConnection} connection
 * @return {*}  {Promise<any>}
 */
export const getValidationSchemaJSON = async (
  occurrenceSubmissionId: number,
  connection: IDBConnection
): Promise<any> => {
  const sqlStatement = getValidationSchemaSQL(occurrenceSubmissionId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return (response && response.rows && response.rows[0]).validation || null;
};
