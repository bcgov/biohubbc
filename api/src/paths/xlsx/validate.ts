import { getDBConnection, IDBConnection } from '../../database/db';
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
  insertSubmissionMessage,
  insertSubmissionStatus,
  persistParseErrors,
  persistValidationResults
} from '../dwc/validate';
import { HTTP400 } from '../../errors/CustomError';
import { getValidationSchemaSQL } from '../../queries/survey/survey-occurrence-queries';

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

      req['xlsx'] = xlsxCsv;

      next();
    } catch (error) {
      defaultLog.error({ label: 'prepXLSX', message: 'error', error });
      throw error;
    }
  };
}

export function getValidationSchema(): RequestHandler {
  return async (req, res, next) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const validationSchema = await getValidationSchemaJSON(req.body.occurrence_submission_id, connection);

      if (!validationSchema) {
        // no schema to validate the template, generate error

        const submissionStatusId = await insertSubmissionStatus(
          req.body.occurrence_submission_id,
          'System Error',
          connection
        );

        await insertSubmissionMessage(
          submissionStatusId,
          'Error',
          `Unable to fetch an appropriate validation schema for your submission`,
          'Missing Validation Schema',
          connection
        );

        await connection.commit();

        return res.status(200).json();
      }

      req['validationSchema'] = validationSchema;

      next();
    } catch (error) {
      defaultLog.error({ label: 'getValidationSchema', message: 'error', error });
      connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function validateXLSX(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'validateXLSX', message: 'dwcArchive' });

    try {
      const xlsxCsv: XLSXCSV = req['xlsx'];

      const validationSchemaParser: ValidationSchemaParser = req['validationSchemaParser'];

      const mediaState: IMediaState = xlsxCsv.isMediaValid(validationSchemaParser);

      req['mediaState'] = mediaState;

      if (!mediaState.isValid) {
        // The file itself is invalid, skip remaining validation
        return next();
      }

      const csvState: ICsvState[] = xlsxCsv.isContentValid(validationSchemaParser);

      console.log('csvState is: ', csvState);

      req['csvState'] = csvState;

      next();
    } catch (error) {
      defaultLog.error({ label: 'validateXLSX', message: 'error', error });
      throw error;
    }
  };
}

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
