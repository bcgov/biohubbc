'use strict';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import {
  insertSurveyOccurrenceSubmissionSQL,
  updateSurveyOccurrenceSubmissionWithKeySQL,
  getTemplateMethodologySpeciesIdSQLStatement
} from '../../../../../../../queries/survey/survey-occurrence-queries';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';
import { logRequest } from '../../../../../../../utils/path-utils';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/submission/upload');

export const POST: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/observation/submission/upload', 'POST'),
  uploadMedia()
];

POST.apiDoc = {
  description: 'Upload survey observation submission file.',
  tags: ['attachments'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      required: true
    }
  ],
  requestBody: {
    description: 'Survey observation submission file to upload',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            media: {
              description: 'A survey observation submission file.',
              type: 'string',
              format: 'binary'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Upload OK'
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

/**
 * Uploads a media file to S3 and inserts a matching record in the `occurrence_submission` table.
 *
 * @return {*}  {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res) => {
    const rawMediaArray: Express.Multer.File[] = req.files as Express.Multer.File[];

    if (!rawMediaArray || !rawMediaArray.length) {
      // no media objects included, skipping media upload step
      throw new HTTP400('Missing upload data');
    }

    defaultLog.debug({
      label: 'uploadMedia',
      message: 'files',
      files: rawMediaArray.map((item) => {
        return { ...item, buffer: 'Too big to print' };
      })
    });

    if (rawMediaArray.length !== 1) {
      // no media objects included
      throw new HTTP400('Too many files uploaded, expected 1');
    }

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param: projectId');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param: surveyId');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const rawMediaFile = rawMediaArray[0];

      await connection.open();

      // Scan file for viruses using ClamAV
      const virusScanResult = await scanFileForVirus(rawMediaFile);

      if (!virusScanResult) {
        throw new HTTP400('File contains virus');
      }

      const templateMethodologyId = await getTemplateMethodologySpeciesIdStatement(
        Number(req.params.surveyId),
        rawMediaFile.originalname,
        connection
      );

      const response = await insertSurveyOccurrenceSubmission(
        Number(req.params.surveyId),
        'BioHub',
        rawMediaFile.originalname,
        templateMethodologyId,
        connection
      );

      const submissionId = response.rows[0].id;

      const key = generateS3FileKey({
        projectId: Number(req.params.projectId),
        surveyId: Number(req.params.surveyId),
        folder: `submissions/${submissionId}`,
        fileName: rawMediaFile.originalname
      });

      // Query to update the record with the key before uploading the file
      await updateSurveyOccurrenceSubmissionWithKey(submissionId, key, connection);

      await connection.commit();

      const metadata = {
        filename: rawMediaFile.originalname,
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      await uploadFileToS3(rawMediaFile, key, metadata);

      return res.status(200).send({ submissionId });
    } catch (error) {
      defaultLog.debug({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Inserts a new record into the `occurrence_submission` table.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} key
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const insertSurveyOccurrenceSubmission = async (
  surveyId: number,
  source: string,
  file_name: string,
  templateMethodologyId: number | null,
  connection: IDBConnection
): Promise<any> => {
  const insertSqlStatement = insertSurveyOccurrenceSubmissionSQL(surveyId, source, file_name, templateMethodologyId);

  if (!insertSqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const insertResponse = await connection.query(insertSqlStatement.text, insertSqlStatement.values);

  if (!insertResponse || !insertResponse.rowCount) {
    throw new HTTP400('Failed to insert survey occurrence submission record');
  }

  return insertResponse;
};

/**
 * Inserts a new record into the `occurrence_submission` table.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} key
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const getTemplateMethodologySpeciesIdStatement = async (
  surveyId: number,
  file_name: string,
  connection: IDBConnection
): Promise<number | null> => {
  let templateName;

  switch (file_name) {
    case 'Moose_SRB_or_Composition_Survey_Skeena.xlsx':
      templateName = 'Moose SRB or Composition Survey Skeena';
      break;
    case 'Moose_SRB_or_Composition_Survey_Omineca.xlsx':
      templateName = 'Moose SRB or Composition Survey Skeena';
      break;
    case 'Moose_SRB_or_Composition_Survey_Cariboo.xlsx':
      templateName = 'Moose SRB or Composition Survey Skeena';
      break;
    case 'Moose_SRB_or_Composition_Survey_Okanagan.xlsx':
      templateName = 'Moose SRB or Composition Survey Skeena';
      break;
    case 'Moose_SRB_or_Composition_Survey_Kootenay.xlsx':
      templateName = 'Moose SRB or Composition Survey Kootenay';
      break;
    case 'Moose_Recruitment_Survey.xlsx':
      templateName = 'Moose Recruitment Survey';
      break;
  }

  if (!templateName) {
    return null;
  }

  const getIdSqlStatement = getTemplateMethodologySpeciesIdSQLStatement(surveyId, templateName);

  if (!getIdSqlStatement) {
    throw new HTTP400('Failed to build SQL get template methodology species id sql statement');
  }
  const getIdResponse = await connection.query(getIdSqlStatement.text, getIdSqlStatement.values);

  if (!getIdResponse) {
    throw new HTTP400('Failed to query template methodology species table');
  }

  return getIdResponse?.rows?.[0]?.template_methodology_species_id || null;
};

/**
 * Update existing `occurrence_submission` record with key.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} key
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const updateSurveyOccurrenceSubmissionWithKey = async (
  submissionId: number,
  key: string,
  connection: IDBConnection
): Promise<any> => {
  const updateSqlStatement = updateSurveyOccurrenceSubmissionWithKeySQL(submissionId, key);

  if (!updateSqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const updateResponse = await connection.query(updateSqlStatement.text, updateSqlStatement.values);

  if (!updateResponse || !updateResponse.rowCount) {
    throw new HTTP400('Failed to update survey occurrence submission record');
  }

  return updateResponse;
};
