import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/custom-error';
import { PostSummaryDetails } from '../../../../../../../models/summaryresults-create';
import { generateHeaderErrorMessage, generateRowErrorMessage } from '../../../../../../../paths/dwc/validate';
import { getTemplateMethodologySpeciesRecord, validateXLSX } from '../../../../../../../paths/xlsx/validate';
import { queries } from '../../../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { generateS3FileKey, scanFileForVirus, uploadFileToS3 } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';
import { ICsvState } from '../../../../../../../utils/media/csv/csv-file';
import { IMediaState, MediaFile } from '../../../../../../../utils/media/media-file';
import { parseUnknownMedia } from '../../../../../../../utils/media/media-utils';
import { ValidationSchemaParser } from '../../../../../../../utils/media/validation/validation-schema-parser';
import { XLSXCSV } from '../../../../../../../utils/media/xlsx/xlsx-file';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/summary/upload');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
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
      Bearer: []
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
      description: 'Upload OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              summarySubmissionId: {
                type: 'number'
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

export enum SUMMARY_CLASS {
  STUDY_AREA = 'study area',
  POPULATION_UNIT = 'population unit',
  BLOCK_SAMPLE_UNIT_ID = 'block/sample unit',
  PARAMETER = 'parameter',
  STRATUM = 'stratum',
  OBSERVED = 'observed',
  ESTIMATED = 'estimated',
  SIGHTABILITY_MODEL = 'sightability model',
  SIGHTABILITY_CORRECTION_FACTOR = 'sightability correction factor',
  SE = 'se',
  COEFFICIENT_VARIATION = 'coefficient of variation (%)',
  CONFIDENCE_LEVEL = 'confidence level (%)',
  LOWER_CONFIDENCE_LEVEL = 'lower cl',
  UPPER_CONFIDENCE_LEVEL = 'upper cl',
  TOTAL_SURVEY_AREA = 'total survey area (km2)',
  AREA_FLOWN = 'area flown (km2)',
  TOTAL_KILOMETERS_SURVEYED = 'total kilometers surveyed (km)',
  BEST_PARAMETER_VALUE_FLAG = 'best parameter value flag',
  OUTLIER_BLOCKS_REMOVED = 'outlier blocks removed',
  TOTAL_MARKED_ANIMALS_OBSERVED = 'total marked animals observed',
  MARKER_ANIMALS_AVAILABLE = 'marked animals available',
  PARAMETER_COMMENTS = 'parameter comments'
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

      const template_id = xlsxCsv.workbook.rawWorkbook.Custprops.sims_template_id;
      const csm_id = xlsxCsv.workbook.rawWorkbook.Custprops.sims_csm_id;

      if (!template_id || !csm_id) {
        req['parseError'] = 'Failed to parse submission, template identification properties are missing';
      }

      req['xlsx'] = xlsxCsv;

      next();
    } catch (error) {
      defaultLog.error({ label: 'prepXLSX', message: 'error', error });
      throw error;
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
  const insertSqlStatement = queries.survey.insertSurveySummarySubmissionSQL(surveyId, source, file_name);

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
  const updateSqlStatement = queries.survey.updateSurveySummarySubmissionWithKeySQL(submissionId, key);

  if (!updateSqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const updateResponse = await connection.query(updateSqlStatement.text, updateSqlStatement.values);

  if (!updateResponse || !updateResponse.rowCount) {
    throw new HTTP400('Failed to update survey summary submission record');
  }

  return updateResponse;
};

export function persistSummaryParseErrors(): RequestHandler {
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
      return res.status(200).send();
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
    
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const xlsxCsv = req['xlsx'];
      const template_id = xlsxCsv.workbook.rawWorkbook.Custprops.sims_template_id;
      const field_method_id = xlsxCsv.workbook.rawWorkbook.Custprops.sims_csm_id;

      const templateMethodologySpeciesRecord = await getTemplateMethodologySpeciesRecord(
        Number(field_method_id),
        Number(template_id),
        connection
      );

      const validationSchema = templateMethodologySpeciesRecord?.validation;
      const validationSchemaParser = new ValidationSchemaParser(validationSchema);

      req['validationSchemaParser'] = validationSchemaParser;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'getValidationRules', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function persistSummaryValidationResults(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'persistValidationResults', message: 'validationResults' });

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
      defaultLog.error({ label: 'persistValidationResults', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function parseAndUploadSummarySubmissionInput(): RequestHandler {
  return async (req, res, next) => {
    const xlsxCsv: XLSXCSV = req['xlsx'];

    const summarySubmissionId = req['summarySubmissionId'];

    const connection = getDBConnection(req['keycloak_token']);

    const worksheets = xlsxCsv.workbook.worksheets;

    try {
      await connection.open();

      const promises: Promise<any>[] = [];

      for (const worksheet of Object.values(worksheets)) {
        if (worksheet.name === 'Look Up Tables') {
          continue;
        }
        const rowObjects = worksheet.getRowObjects();

        for (const rowObject of Object.values(rowObjects)) {
          const summaryObject = new PostSummaryDetails();

          for (const columnName in rowObject) {
            const columnValue = rowObject[columnName];
            switch (columnName.toLowerCase()) {
              case SUMMARY_CLASS.STUDY_AREA:
                summaryObject.study_area_id = columnValue;
                break;
              case SUMMARY_CLASS.POPULATION_UNIT:
                summaryObject.population_unit = columnValue;
                break;
              case SUMMARY_CLASS.BLOCK_SAMPLE_UNIT_ID:
                summaryObject.block_sample_unit_id = columnValue;
                break;
              case SUMMARY_CLASS.PARAMETER:
                summaryObject.parameter = columnValue;
                break;
              case SUMMARY_CLASS.STRATUM:
                summaryObject.stratum = columnValue;
                break;
              case SUMMARY_CLASS.OBSERVED:
                summaryObject.observed = columnValue;
                break;
              case SUMMARY_CLASS.ESTIMATED:
                summaryObject.estimated = columnValue;
                break;
              case SUMMARY_CLASS.SIGHTABILITY_MODEL:
                summaryObject.sightability_model = columnValue;
                break;
              case SUMMARY_CLASS.SIGHTABILITY_CORRECTION_FACTOR:
                summaryObject.sightability_correction_factor = columnValue;
                break;
              case SUMMARY_CLASS.SE:
                summaryObject.standard_error = columnValue;
                break;
              case SUMMARY_CLASS.COEFFICIENT_VARIATION:
                summaryObject.coefficient_variation = columnValue;
                break;
              case SUMMARY_CLASS.CONFIDENCE_LEVEL:
                summaryObject.confidence_level_percent = columnValue;
                break;
              case SUMMARY_CLASS.LOWER_CONFIDENCE_LEVEL:
                summaryObject.confidence_limit_lower = columnValue;
                break;
              case SUMMARY_CLASS.UPPER_CONFIDENCE_LEVEL:
                summaryObject.confidence_limit_upper = columnValue;
                break;
              case SUMMARY_CLASS.TOTAL_SURVEY_AREA:
                summaryObject.total_area_survey_sqm = columnValue;
                break;
              case SUMMARY_CLASS.AREA_FLOWN:
                summaryObject.area_flown = columnValue;
                break;
              case SUMMARY_CLASS.TOTAL_KILOMETERS_SURVEYED:
                summaryObject.total_kilometers_surveyed = columnValue;
                break;
              case SUMMARY_CLASS.BEST_PARAMETER_VALUE_FLAG:
                summaryObject.best_parameter_flag = columnValue;
                break;
              case SUMMARY_CLASS.OUTLIER_BLOCKS_REMOVED:
                summaryObject.outlier_blocks_removed = columnValue;
                break;
              case SUMMARY_CLASS.TOTAL_MARKED_ANIMALS_OBSERVED:
                summaryObject.total_marked_animals_observed = columnValue;
                break;
              case SUMMARY_CLASS.MARKER_ANIMALS_AVAILABLE:
                summaryObject.marked_animals_available = columnValue;
                break;
              case SUMMARY_CLASS.PARAMETER_COMMENTS:
                summaryObject.parameter_comments = columnValue;
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
  const sqlStatement = queries.survey.insertSurveySummaryDetailsSQL(summarySubmissionId, scrapedSummaryDetail);

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
  const sqlStatement = queries.survey.insertSurveySummarySubmissionMessageSQL(
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
    throw new HTTP400('Failed to insert summary submission message data');
  }
};
