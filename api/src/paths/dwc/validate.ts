import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, IDBConnection } from '../../database/db';
import { HTTP400, HTTP500 } from '../../errors/CustomError';
import {
  getSurveyOccurrenceSubmissionSQL,
  insertOccurrenceSubmissionMessageSQL,
  insertOccurrenceSubmissionStatusSQL,
  updateSurveyOccurrenceSubmissionSQL
} from '../../queries/survey/survey-occurrence-queries';
import { getFileFromS3 } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';
import { ICsvState, IHeaderError, IRowError } from '../../utils/media/csv/csv-file';
import { DWCArchive } from '../../utils/media/dwc/dwc-archive-file';
import { ArchiveFile, IMediaState } from '../../utils/media/media-file';
import { parseUnknownMedia } from '../../utils/media/media-utils';
import { ValidationSchemaParser } from '../../utils/media/validation/validation-schema-parser';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('paths/dwc/validate');

export const POST: Operation = [
  logRequest('paths/dwc/validate', 'POST'),
  getOccurrenceSubmission(),
  getOccurrenceSubmissionInputS3Key(),
  getS3File(),
  prepDWCArchive(),
  persistParseErrors(),
  getValidationSchema(),
  getValidationRules(),
  validateDWCArchive(),
  persistValidationResults({ initialSubmissionStatusType: 'Darwin Core Validated' }),
  updateOccurrenceSubmission(),
  sendResponse()
];

export const getValidateAPIDoc = (basicDescription: string, successDescription: string, tags: string[]) => {
  return {
    description: basicDescription,
    tags: tags,
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
        description: successDescription,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string'
                },
                reason: {
                  type: 'string'
                }
              }
            }
          }
        }
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
};

POST.apiDoc = {
  ...getValidateAPIDoc(
    'Validates a Darwin Core (DWC) Archive survey observation submission.',
    'Validate Darwin Core (DWC) Archive survey observation submission OK',
    ['survey', 'observation', 'dwc']
  )
};

export function getOccurrenceSubmission(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getOccurrenceSubmission', message: 'params', files: req.body });

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

      req['occurrence_submission'] = response.rows[0];

      next();
    } catch (error) {
      defaultLog.error({ label: 'getOccurrenceSubmission', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function getOccurrenceSubmissionInputS3Key(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getSubmissionS3Key', message: 'params', files: req.body });
    const occurrence_submission = req['occurrence_submission'];

    req['s3Key'] = occurrence_submission.input_key;

    next();
  };
}

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

export function persistParseErrors(): RequestHandler {
  return async (req, res, next) => {
    const parseError = req['parseError'];

    if (!parseError) {
      // no errors to persist, skip to next step
      return next();
    }

    defaultLog.debug({ label: 'persistParseErrors', message: 'parseError', parseError });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const submissionStatusId = await insertSubmissionStatus(
        req.body.occurrence_submission_id,
        'Rejected',
        connection
      );

      await insertSubmissionMessage(submissionStatusId, 'Error', parseError, 'Miscellaneous', connection);

      await connection.commit();

      // archive is not parsable, don't continue to next step and return early
      return res.status(200).json({ status: 'failed' });
    } catch (error) {
      defaultLog.error({ label: 'persistParseErrors', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

function getValidationSchema(): RequestHandler {
  return async (req, res, next) => {
    req['validationSchema'] = {};

    next();
  };
}

export function getValidationRules(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getValidationRules', message: 's3File' });

    try {
      const validationSchema: JSON = req['validationSchema'];

      const validationSchemaParser = new ValidationSchemaParser(validationSchema);

      req['validationSchemaParser'] = validationSchemaParser;

      next();
    } catch (error) {
      defaultLog.error({ label: 'getValidationRules', message: 'error', error });
      throw error;
    }
  };
}

function validateDWCArchive(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'validateDWCArchive', message: 'dwcArchive' });

    try {
      const dwcArchive: DWCArchive = req['dwcArchive'];

      const validationSchemaParser: ValidationSchemaParser = req['validationSchemaParser'];

      const mediaState: IMediaState = dwcArchive.isMediaValid(validationSchemaParser);

      req['mediaState'] = mediaState;

      if (!mediaState.isValid) {
        // The file itself is invalid, skip remaining validation
        return next();
      }

      const csvState: ICsvState[] = dwcArchive.isContentValid(validationSchemaParser);

      req['csvState'] = csvState;

      next();
    } catch (error) {
      defaultLog.error({ label: 'validateDWCArchive', message: 'error', error });
      throw error;
    }
  };
}

export function generateHeaderErrorMessage(fileName: string, headerError: IHeaderError): string {
  return `${fileName} - ${headerError.message} - Column: ${headerError.col}`;
}

export function generateRowErrorMessage(fileName: string, rowError: IRowError): string {
  return `${fileName} - ${rowError.message} - Column: ${rowError.col} - Row: ${rowError.row}`;
}

export function persistValidationResults(statusTypeObject: any): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'persistValidationResults', message: 'validationResults' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const mediaState: IMediaState = req['mediaState'];
      const csvState: ICsvState[] = req['csvState'];

      await connection.open();

      let submissionStatusType = statusTypeObject.initialSubmissionStatusType;
      if (!mediaState.isValid || csvState?.some((item) => !item.isValid)) {
        // At least 1 error exists
        submissionStatusType = 'Rejected';
      }

      const submissionStatusId = await insertSubmissionStatus(
        req.body.occurrence_submission_id,
        submissionStatusType,
        connection
      );

      const promises: Promise<any>[] = [];

      mediaState.fileErrors?.forEach((fileError) => {
        promises.push(
          insertSubmissionMessage(submissionStatusId, 'Error', `${fileError}`, 'Miscellaneous', connection)
        );
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

      if (!mediaState.isValid || csvState?.some((item) => !item.isValid)) {
        // At least 1 error exists, skip remaining steps
        return res.status(200).json({ status: 'failed' });
      }

      return next();
    } catch (error) {
      defaultLog.error({ label: 'persistValidationResults', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

function updateOccurrenceSubmission(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'updateOccurrenceSubmission', message: 'Update output file name and output key' });

    const dwcArchive: DWCArchive = req['dwcArchive'];
    const inputFileName = dwcArchive.rawFile.name;
    const s3Key: string = req['s3Key'];

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      // Update occurrence submission record to include the DWC output file name and s3 key (which in this case are the
      // same as the input file name and s3 key, as it is already a DWC zip)
      await updateSurveyOccurrenceSubmissionWithOutputKey(
        req.body.occurrence_submission_id,
        inputFileName,
        s3Key,
        connection
      );

      await connection.commit();

      next();
    } catch (error) {
      defaultLog.debug({ label: 'updateOccurrenceSubmission', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function sendResponse(): RequestHandler {
  return async (req, res) => {
    return res.status(200).json({ status: 'success' });
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
 * Update existing `occurrence_submission` record with outputKey and outputFileName.
 *
 * @param {number} submissionId
 * @param {string} outputFileName
 * @param {string} outputKey
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const updateSurveyOccurrenceSubmissionWithOutputKey = async (
  submissionId: number,
  outputFileName: string,
  outputKey: string,
  connection: IDBConnection
): Promise<any> => {
  const updateSqlStatement = updateSurveyOccurrenceSubmissionSQL({ submissionId, outputFileName, outputKey });

  if (!updateSqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const updateResponse = await connection.query(updateSqlStatement.text, updateSqlStatement.values);

  if (!updateResponse || !updateResponse.rowCount) {
    throw new HTTP400('Failed to update survey occurrence submission record');
  }

  return updateResponse;
};
