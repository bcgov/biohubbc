import { RequestHandler } from 'express';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { getDBConnection, IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/CustomError';
import {
  getSurveyOccurrenceSubmissionSQL,
  insertOccurrenceSubmissionMessageSQL,
  insertOccurrenceSubmissionStatusSQL
} from '../queries/survey/survey-occurrence-queries';
import { getLogger } from '../utils/logger';
import { ICsvState, IHeaderError, IRowError } from '../utils/media/csv/csv-file';
import { IMediaState } from '../utils/media/media-file';
import { ValidationSchemaParser } from '../utils/media/validation/validation-schema-parser';

const defaultLog = getLogger('paths-request-handlers/occurrence-submission');

/**
 * Fetch an occurrence-submission record.
 *
 * Reads:
 *  - req.body.occurrence_submission_id
 *
 * @export
 * @throws {HTTP400} If `occurrence_submission_id` is falsy or no occurrence submission record is fetched from the
 * database.
 * @return {*}  {RequestHandler}
 */
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

/**
 * Parse the key from an occurrence submission record and add it to the req.
 *
 * Writes:
 * - req.s3Key
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getOccurrenceSubmissionInputS3Key(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getSubmissionS3Key', message: 'params', files: req.body });
    const occurrence_submission = req['occurrence_submission'];

    req['s3Key'] = occurrence_submission.input_key;

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

export function persistValidationResults(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'persistValidationResults', message: 'validationResults' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const mediaState: IMediaState = req['mediaState'];
      const csvState: ICsvState[] = req['csvState'];

      await connection.open();

      let submissionStatusType = SUBMISSION_STATUS_TYPE.DARWIN_CORE_VALIDATED;
      if (req['xlsxCsv']) {
        submissionStatusType = SUBMISSION_STATUS_TYPE.TEMPLATE_VALIDATED;
      }

      if (!mediaState.isValid || csvState?.some((item) => !item.isValid)) {
        // At least 1 error exists
        submissionStatusType = SUBMISSION_STATUS_TYPE.REJECTED;
      }

      const submissionStatusId = await insertSubmissionStatus(
        req.body.occurrence_submission_id,
        submissionStatusType,
        connection
      );

      const promises: Promise<any>[] = [];

      mediaState.fileErrors?.forEach((fileError) => {
        promises.push(
          insertSubmissionMessage(
            submissionStatusId,
            SUBMISSION_MESSAGE_TYPE.ERROR,
            `${fileError}`,
            'Miscellaneous',
            connection
          )
        );
      });

      csvState?.forEach((csvStateItem) => {
        csvStateItem.headerErrors?.forEach((headerError) => {
          promises.push(
            insertSubmissionMessage(
              submissionStatusId,
              SUBMISSION_MESSAGE_TYPE.ERROR,
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
              SUBMISSION_MESSAGE_TYPE.ERROR,
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

/**
 * Send a 200 response, with `status=success`
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function sendSuccessResponse(): RequestHandler {
  return async (req, res) => {
    return res.status(200).json({ status: 'success' });
  };
}

/**
 * Generate an error message from an `IHeaderError`.
 *
 * @export
 * @param {string} fileName
 * @param {IHeaderError} headerError
 * @return {*}  {string} Error message
 */
export function generateHeaderErrorMessage(fileName: string, headerError: IHeaderError): string {
  return `${fileName} - ${headerError.message} - Column: ${headerError.col}`;
}

/**
 * Generate an error message from an `IRowError`.
 *
 * @export
 * @param {string} fileName
 * @param {IRowError} rowError
 * @return {*}  {string} Error message
 */
export function generateRowErrorMessage(fileName: string, rowError: IRowError): string {
  return `${fileName} - ${rowError.message} - Column: ${rowError.col} - Row: ${rowError.row}`;
}

/**
 * Insert a record into the submission_status table.
 *
 * @param {number} occurrenceSubmissionId
 * @param {SUBMISSION_STATUS_TYPE} submissionStatusType
 * @param {IDBConnection} connection
 * @throws {HTTP400} If it fails to build SQL insert statement or insert query updates no rows.
 * @return {*}  {Promise<number>}
 */
export const insertSubmissionStatus = async (
  occurrenceSubmissionId: number,
  submissionStatusType: SUBMISSION_STATUS_TYPE,
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
 * @param {SUBMISSION_MESSAGE_TYPE} submissionMessageType
 * @param {string} message
 * @param {IDBConnection} connection
 * @throws {HTTP400} If it fails to build SQL insert statement.
 * @return {*}  {Promise<void>}
 */
export const insertSubmissionMessage = async (
  submissionStatusId: number,
  submissionMessageType: SUBMISSION_MESSAGE_TYPE,
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
