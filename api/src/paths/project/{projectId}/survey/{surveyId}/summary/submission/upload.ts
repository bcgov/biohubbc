'use strict';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import { PostSummaryDetails } from '../../../../../../../models/summaryresults-create';
import {
  generateHeaderErrorMessage,
  generateRowErrorMessage
} from '../../../../../../../paths-handlers/occurrence-submission';
import { prepXLSX } from '../../../../../../../paths-handlers/xlsx';
import { validateXLSX } from '../../../../../../../paths/xlsx/validate';
import {
  insertSurveySummaryDetailsSQL,
  insertSurveySummarySubmissionMessageSQL,
  insertSurveySummarySubmissionSQL,
  updateSurveySummarySubmissionWithKeySQL
} from '../../../../../../../queries/survey/survey-summary-queries';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';
import { ICsvState } from '../../../../../../../utils/media/csv/csv-file';
import { IMediaState } from '../../../../../../../utils/media/media-file';
import { ValidationSchemaParser } from '../../../../../../../utils/media/validation/validation-schema-parser';
import { XLSXCSV } from '../../../../../../../utils/media/xlsx/xlsx-file';
import { logRequest } from '../../../../../../../utils/path-utils';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/summary/upload');

export const POST: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/summary/upload', 'POST'),
  uploadMedia(),
  prepXLSX(),
  persistSummaryParseErrors(),
  getValidationRules(),
  validateXLSX(),
  persistSummaryValidationResults(),
  parseAndUploadSummarySubmissionInput(),
  returnSummarySubmissionId()
];

POST.apiDoc = {
  description: 'Upload survey summary results file.',
  tags: ['results'],
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
    description: 'Survey summary results file to upload',
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          properties: {
            media: {
              description: 'A survey summary file.',
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

export enum SUMMARY_CLASS {
  STUDY_AREA = 'survey area',
  SUMMARY_STATISTIC = 'statistic',
  STRATUM = 'stratum',
  OBSERVED = 'observed',
  ESTIMATE = 'estimate',
  STANDARD_ERROR = 'se',
  COEFFICIENT_VARIATION = 'cv',
  CONFIDENCE_LEVEL = 'conf.level',
  LOWER_CONFIDENCE_LIMIT = 'lcl',
  UPPER_CONFIDENCE_LIMIT = 'ucl',
  SIGHTABILITY_MODEL = 'sightability.model',
  AREA = 'area',
  AREA_FLOWN = 'area.flown',
  OUTLIER_BLOCKS_REMOVED = 'outlier.blocks.removed',
  ANALYSIS_METHOD = 'analysis.method'
}

/**
 * Uploads a media file to S3 and inserts a matching record in the `summary_submission` table.
 *
 * @return {*}  {RequestHandler}
 */
export function uploadMedia(): RequestHandler {
  return async (req, res, next) => {
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
        throw new HTTP400('Malicious content detected, upload cancelled');
      }

      const response = await insertSurveySummarySubmission(
        Number(req.params.surveyId),
        'BioHub',
        rawMediaFile.originalname,
        connection
      );

      const summarySubmissionId = response.rows[0].id;

      const key = generateS3FileKey({
        projectId: Number(req.params.projectId),
        surveyId: Number(req.params.surveyId),
        folder: `summaryresults/${summarySubmissionId}`,
        fileName: rawMediaFile.originalname
      });

      await updateSurveySummarySubmissionWithKey(summarySubmissionId, key, connection);

      await connection.commit();

      const metadata = {
        filename: rawMediaFile.originalname,
        username: (req['auth_payload'] && req['auth_payload'].preferred_username) || '',
        email: (req['auth_payload'] && req['auth_payload'].email) || ''
      };

      await uploadFileToS3(rawMediaFile, key, metadata);

      req['s3File'] = rawMediaFile;

      req['summarySubmissionId'] = summarySubmissionId;
      next();
    } catch (error) {
      defaultLog.error({ label: 'uploadMedia', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Inserts a new record into the `survey_summary_submission` table.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} file_name
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const insertSurveySummarySubmission = async (
  surveyId: number,
  source: string,
  file_name: string,
  connection: IDBConnection
): Promise<any> => {
  const insertSqlStatement = insertSurveySummarySubmissionSQL(surveyId, source, file_name);

  if (!insertSqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const insertResponse = await connection.query(insertSqlStatement.text, insertSqlStatement.values);

  if (!insertResponse || !insertResponse.rowCount) {
    throw new HTTP400('Failed to insert survey summary submission record');
  }

  return insertResponse;
};

/**
 * Update existing `survey_summary_submission` record with key.
 *
 * @param {number} submissionId
 * @param {string} key
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const updateSurveySummarySubmissionWithKey = async (
  submissionId: number,
  key: string,
  connection: IDBConnection
): Promise<any> => {
  const updateSqlStatement = updateSurveySummarySubmissionWithKeySQL(submissionId, key);

  if (!updateSqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const updateResponse = await connection.query(updateSqlStatement.text, updateSqlStatement.values);

  if (!updateResponse || !updateResponse.rowCount) {
    throw new HTTP400('Failed to update survey summary submission record');
  }

  return updateResponse;
};

function persistSummaryParseErrors(): RequestHandler {
  return async (req, res, next) => {
    const parseError = req['parseError'];

    defaultLog.debug({ label: 'persistSummaryParseErrors', message: 'parseError', parseError });

    if (!parseError) {
      // no errors to persist, skip to next step
      return next();
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const summarySubmissionId = req['summarySubmissionId'];
      await insertSummarySubmissionMessage(summarySubmissionId, 'Error', parseError, 'Miscellaneous', connection);

      await connection.commit();

      // archive is not parsable, don't continue to next step and return early
      return res.status(200).json();
    } catch (error) {
      defaultLog.error({ label: 'persistParseErrors', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function getValidationRules(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getValidationRules', message: 's3File' });

    try {
      const validationSchema = {
        name: '',
        description: '',
        defaultFile: {
          description: '',
          columns: [
            {
              name: 'Observed',
              description: '',
              validations: [
                {
                  column_numeric_validator: {
                    name: '',
                    description: ''
                  }
                }
              ]
            },
            {
              name: 'Estimate',
              description: '',
              validations: [
                {
                  column_numeric_validator: {
                    name: '',
                    description: ''
                  }
                }
              ]
            },
            {
              name: 'SE',
              description: '',
              validations: [
                {
                  column_numeric_validator: {
                    name: '',
                    description: ''
                  }
                }
              ]
            },
            {
              name: 'CV',
              description: '',
              validations: [
                {
                  column_numeric_validator: {
                    name: '',
                    description: ''
                  }
                }
              ]
            },
            {
              name: 'Conf.Level',
              description: '',
              validations: [
                {
                  column_numeric_validator: {
                    name: '',
                    description: ''
                  }
                }
              ]
            },
            {
              name: 'LCL',
              description: '',
              validations: [
                {
                  column_numeric_validator: {
                    name: '',
                    description: ''
                  }
                }
              ]
            },
            {
              name: 'UCL',
              description: '',
              validations: [
                {
                  column_numeric_validator: {
                    name: '',
                    description: ''
                  }
                }
              ]
            },
            {
              name: 'Area',
              description: '',
              validations: [
                {
                  column_numeric_validator: {
                    name: '',
                    description: ''
                  }
                }
              ]
            },
            {
              name: 'Area.Flown',
              description: '',
              validations: [
                {
                  column_numeric_validator: {
                    name: '',
                    description: ''
                  }
                }
              ]
            }
          ],
          validations: [
            {
              file_duplicate_columns_validator: {}
            },
            {
              file_required_columns_validator: {
                required_columns: [
                  'Survey Area',
                  'Statistic',
                  'Stratum',
                  'Observed',
                  'Estimate',
                  'SE',
                  'CV',
                  'Conf.Level',
                  'LCL',
                  'UCL',
                  'Sightability.Model',
                  'Area',
                  'Area.Flown',
                  'Outlier.Blocks.Removed',
                  'Analysis.Method'
                ]
              }
            }
          ]
        },
        validations: [
          {
            mimetype_validator: {
              reg_exps: ['text\\/csv', 'application\\/vnd.*']
            }
          }
        ]
      };

      const validationSchemaParser = new ValidationSchemaParser(validationSchema);

      req['validationSchemaParser'] = validationSchemaParser;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'getValidationRules', message: 'error', error });
      throw error;
    }
  };
}

function persistSummaryValidationResults(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'persistSummaryValidationResults', message: 'validationResults' });

    const mediaState: IMediaState = req['mediaState'];
    const csvState: ICsvState[] = req['csvState'];

    if (mediaState.isValid && csvState?.every((item) => item.isValid)) {
      return next();
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const summarySubmissionId = req['summarySubmissionId'];

      const promises: Promise<any>[] = [];

      mediaState.fileErrors?.forEach((fileError) => {
        promises.push(
          insertSummarySubmissionMessage(summarySubmissionId, 'Error', `${fileError}`, 'Miscellaneous', connection)
        );
      });

      csvState?.forEach((csvStateItem) => {
        csvStateItem.headerErrors?.forEach((headerError) => {
          promises.push(
            insertSummarySubmissionMessage(
              summarySubmissionId,
              'Error',
              generateHeaderErrorMessage(csvStateItem.fileName, headerError),
              headerError.errorCode,
              connection
            )
          );
        });

        csvStateItem.rowErrors?.forEach((rowError) => {
          promises.push(
            insertSummarySubmissionMessage(
              summarySubmissionId,
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

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'persistSummaryValidationResults', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function parseAndUploadSummarySubmissionInput(): RequestHandler {
  return async (req, res, next) => {
    const xlsxCsv: XLSXCSV = req['xlsxCsv'];

    const summarySubmissionId = req['summarySubmissionId'];

    const connection = getDBConnection(req['keycloak_token']);

    const worksheets = xlsxCsv.workbook.worksheets;

    try {
      await connection.open();

      const promises: Promise<any>[] = [];

      for (const worksheet of Object.values(worksheets)) {
        const rowObjects = worksheet.getRowObjects();

        for (const rowObject of Object.values(rowObjects)) {
          const summaryObject = new PostSummaryDetails();

          for (const columnName in rowObject) {
            const columnValue = rowObject[columnName];

            switch (columnName.toLowerCase()) {
              case SUMMARY_CLASS.STUDY_AREA:
                summaryObject.study_area_id = columnValue;
                break;
              case SUMMARY_CLASS.SUMMARY_STATISTIC:
                summaryObject.parameter = columnValue;
                break;
              case SUMMARY_CLASS.STRATUM:
                summaryObject.stratum = columnValue;
                break;
              case SUMMARY_CLASS.OBSERVED:
                summaryObject.parameter_value = columnValue;
                break;
              case SUMMARY_CLASS.ESTIMATE:
                summaryObject.parameter_estimate = columnValue;
                break;
              case SUMMARY_CLASS.STANDARD_ERROR:
                summaryObject.standard_error = columnValue;
                break;
              case SUMMARY_CLASS.COEFFICIENT_VARIATION:
                summaryObject.coefficient_variation = columnValue;
                break;
              case SUMMARY_CLASS.CONFIDENCE_LEVEL:
                summaryObject.confidence_level_percent = columnValue;
                break;
              case SUMMARY_CLASS.UPPER_CONFIDENCE_LIMIT:
                summaryObject.confidence_limit_upper = columnValue;
                break;
              case SUMMARY_CLASS.LOWER_CONFIDENCE_LIMIT:
                summaryObject.confidence_limit_lower = columnValue;
                break;
              case SUMMARY_CLASS.SIGHTABILITY_MODEL:
                summaryObject.sightability_model = columnValue;
                break;
              case SUMMARY_CLASS.AREA:
                summaryObject.total_area_survey_sqm = columnValue;
                break;
              case SUMMARY_CLASS.AREA_FLOWN:
                summaryObject.kilometres_surveyed = columnValue;
                break;
              case SUMMARY_CLASS.OUTLIER_BLOCKS_REMOVED:
                summaryObject.outlier_blocks_removed = columnValue;
                break;
              case SUMMARY_CLASS.ANALYSIS_METHOD:
                summaryObject.analysis_method = columnValue;
                break;
              default:
                break;
            }
          }
          promises.push(uploadScrapedSummarySubmission(summarySubmissionId, summaryObject, connection));
        }
      }

      await Promise.all(promises);

      await connection.commit();
      next();
    } catch (error) {
      defaultLog.error({ label: 'parseAndUploadSummaryDetails', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

function returnSummarySubmissionId(): RequestHandler {
  return async (req, res) => {
    const summarySubmissionId = req['summarySubmissionId'];

    return res.status(200).json({ summarySubmissionId });
  };
}

/**
 * Upload scraped summary submission data.
 *
 * @param {number} summarySubmissionId
 * @param {any} scrapedSummaryDetail
 * @param {IDBConnection} connection
 * @return {*}
 */
export const uploadScrapedSummarySubmission = async (
  summarySubmissionId: number,
  scrapedSummaryDetail: any,
  connection: IDBConnection
) => {
  const sqlStatement = insertSurveySummaryDetailsSQL(summarySubmissionId, scrapedSummaryDetail);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL post statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to insert summary details data');
  }
};

/**
 * Insert a record into the survey_summary_submission_message table.
 *
 * @param {number} submissionStatusId
 * @param {string} submissionMessageType
 * @param {string} message
 * @param {string} errorCode
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const insertSummarySubmissionMessage = async (
  submissionStatusId: number,
  submissionMessageType: string,
  message: string,
  errorCode: string,
  connection: IDBConnection
): Promise<void> => {
  const sqlStatement = insertSurveySummarySubmissionMessageSQL(
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
