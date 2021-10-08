import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../../constants/status';
import { getDBConnection, IDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/CustomError';
import { getS3File } from '../../paths-handlers/file';
import {
  getOccurrenceSubmission,
  getOccurrenceSubmissionInputS3Key,
  getValidationRules,
  insertSubmissionMessage,
  insertSubmissionStatus,
  persistValidationResults,
  sendSuccessResponse
} from '../../paths-handlers/occurrence-submission';
import { prepXLSX } from '../../paths-handlers/xlsx';
import { getTemplateMethodologySpeciesSQL } from '../../queries/survey/survey-occurrence-queries';
import { getLogger } from '../../utils/logger';
import { ICsvState } from '../../utils/media/csv/csv-file';
import { IMediaState } from '../../utils/media/media-file';
import { ValidationSchemaParser } from '../../utils/media/validation/validation-schema-parser';
import { XLSXCSV } from '../../utils/media/xlsx/xlsx-file';
import { logRequest } from '../../utils/path-utils';
import { getValidateAPIDoc, persistParseErrors } from '../dwc/validate';

const defaultLog = getLogger('paths/xlsx/validate');

export const POST: Operation = [
  logRequest('paths/xlsx/validate', 'POST'),
  getOccurrenceSubmission(),
  getOccurrenceSubmissionInputS3Key(),
  getS3File(),
  prepXLSX(),
  persistParseErrors(),
  getValidationSchema(),
  getValidationRules(),
  validateXLSX(),
  persistValidationResults(),
  sendSuccessResponse()
];

POST.apiDoc = {
  ...getValidateAPIDoc(
    'Validates an XLSX survey observation submission.',
    'Validate XLSX survey observation submission OK',
    ['survey', 'observation', 'xlsx']
  )
};

export function getValidationSchema(): RequestHandler {
  return async (req, res, next) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const templateMethodologySpeciesRecord = await getTemplateMethodologySpecies(
        req.body.occurrence_submission_id,
        connection
      );

      const validationSchema = templateMethodologySpeciesRecord?.validation;

      if (!validationSchema) {
        // no schema to validate the template, generate error

        const submissionStatusId = await insertSubmissionStatus(
          req.body.occurrence_submission_id,
          SUBMISSION_STATUS_TYPE.SYSTEM_ERROR,
          connection
        );

        await insertSubmissionMessage(
          submissionStatusId,
          SUBMISSION_MESSAGE_TYPE.ERROR,
          `Unable to fetch an appropriate validation schema for your submission`,
          'Missing Validation Schema',
          connection
        );

        await connection.commit();

        return res.status(200).json({ status: 'failed' });
      }

      req['validationSchema'] = validationSchema;

      next();
    } catch (error) {
      defaultLog.error({ label: 'getValidationSchema', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function validateXLSX(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'validateXLSX', message: 'xlsx' });

    try {
      const xlsxCsv: XLSXCSV = req['xlsxCsv'];

      const validationSchemaParser: ValidationSchemaParser = req['validationSchemaParser'];

      const mediaState: IMediaState = xlsxCsv.isMediaValid(validationSchemaParser);

      req['mediaState'] = mediaState;

      if (!mediaState.isValid) {
        // The file itself is invalid, skip remaining validation
        return next();
      }

      const csvState: ICsvState[] = xlsxCsv.isContentValid(validationSchemaParser);

      req['csvState'] = csvState;

      next();
    } catch (error) {
      defaultLog.error({ label: 'validateXLSX', message: 'error', error });
      throw error;
    }
  };
}

/**
 * Get a template_methodology_species record from the template table.
 *
 * @param {number} occurrenceSubmissionId
 * @param {IDBConnection} connection
 * @return {*}  {Promise<any>}
 */
export const getTemplateMethodologySpecies = async (
  occurrenceSubmissionId: number,
  connection: IDBConnection
): Promise<any> => {
  const sqlStatement = getTemplateMethodologySpeciesSQL(occurrenceSubmissionId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  return (response && response.rows && response.rows[0]) || null;
};
