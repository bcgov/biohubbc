import AdmZip from 'adm-zip';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../constants/roles';
import { SUBMISSION_STATUS_TYPE } from '../../constants/status';
import { getDBConnection } from '../../database/db';
import {
  getOccurrenceSubmission,
  getOccurrenceSubmissionInputS3Key,
  getS3File,
  insertSubmissionStatus,
  sendResponse,
  updateSurveyOccurrenceSubmissionWithOutputKey
} from '../../paths/dwc/validate';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { uploadBufferToS3 } from '../../utils/file-utils';
import { getLogger } from '../../utils/logger';
import { TransformationSchemaParser } from '../../utils/media/xlsx/transformation/transformation-schema-parser';
import { XLSXTransformation } from '../../utils/media/xlsx/transformation/xlsx-transformation';
import { XLSXCSV } from '../../utils/media/xlsx/xlsx-file';
import { getTemplateMethodologySpecies, prepXLSX } from './validate';

const defaultLog = getLogger('paths/xlsx/transform');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.body.project_id),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getOccurrenceSubmission(),
  getOccurrenceSubmissionInputS3Key(),
  getS3File(),
  prepXLSX(),
  persistParseErrors(),
  getTransformationSchema(),
  getTransformationRules(),
  transformXLSX(),
  persistTransformationResults(),
  sendResponse()
];

POST.apiDoc = {
  description: 'Transforms an XLSX survey observation submission file into a Darwin Core Archive file',
  tags: ['survey', 'observation', 'xlsx'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Request body',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['project_id', 'occurrence_submission_id'],
          properties: {
            project_id: {
              type: 'number'
            },
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
      description: 'Transform XLSX survey observation submission OK',
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

export function persistParseErrors(): RequestHandler {
  return async (req, res, next) => {
    const parseError = req['parseError'];

    if (!parseError) {
      // no errors to persist, skip to next step
      return next();
    }

    // file is not parsable, don't continue to next step and return early
    // TODO add new status for "Transformation Failed" and insert new status record?
    return res.status(200).json({ status: 'failed', reason: 'Unable to parse submission' });
  };
}

export function getTransformationSchema(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getTransformationSchema', message: 'xlsx transform' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const templateMethodologySpeciesRecord = await getTemplateMethodologySpecies(
        req.body.occurrence_submission_id,
        connection
      );

      const transformationSchema = templateMethodologySpeciesRecord?.transform;

      if (!transformationSchema) {
        // TODO handle errors if no transformation schema is found?
        // No schema to validate the template, insert error?
        // See `xlsx/validate/getValidationSchema()`
        return res.status(200).json({
          status: 'failed',
          reason: 'Unable to fetch an appropriate transformation schema for your submission'
        });
      }

      req['transformationSchema'] = transformationSchema;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'getTransformationSchema', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function getTransformationRules(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getTransformationRules', message: 'xlsx transform' });

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
    defaultLog.debug({ label: 'transformXLSX', message: 'xlsx transform' });

    try {
      const xlsxCsv: XLSXCSV = req['xlsx'];

      const transformationSchemaParser: TransformationSchemaParser = req['transformationSchemaParser'];

      const xlsxTransformation = new XLSXTransformation(transformationSchemaParser, xlsxCsv);

      const transformedData = xlsxTransformation.transform();

      const worksheets = xlsxTransformation.dataToSheet(transformedData);

      const fileBuffers = Object.entries(worksheets).map(([fileName, worksheet]) => {
        return {
          name: fileName,
          buffer: xlsxCsv.worksheetToBuffer(worksheet)
        };
      });

      req['fileBuffers'] = fileBuffers;

      next();
    } catch (error) {
      defaultLog.debug({ label: 'transformXLSX', message: 'error', error });
      throw error;
    }
  };
}

export function persistTransformationResults(): RequestHandler {
  return async (req, res, next) => {
    try {
      defaultLog.debug({ label: 'persistTransformationResults', message: 'xlsx transform' });

      const fileBuffers: { name: string; buffer: Buffer }[] = req['fileBuffers'];

      // Build the archive zip file
      const dwcArchiveZip = new AdmZip();
      fileBuffers.forEach((file) => dwcArchiveZip.addFile(`${file.name}.csv`, file.buffer));

      // Build output s3Key based on the original input s3Key
      const s3Key: string = req['s3Key'];

      // Remove the filename from original s3Key
      // project/1/survey/1/submission/file_name.txt -> project/1/survey/1/submission
      const outputS3KeyPrefix = s3Key.split('/').slice(0, -1).join('/');

      const xlsxCsv: XLSXCSV = req['xlsx'];
      const outputFileName = `${xlsxCsv.rawFile.name}.zip`;

      const outputS3Key = `${outputS3KeyPrefix}/${outputFileName}`;

      // Upload transformed archive to s3
      await uploadBufferToS3(dwcArchiveZip.toBuffer(), 'application/zip', outputS3Key);

      const connection = getDBConnection(req['keycloak_token']);

      try {
        await connection.open();

        // Update occurrence submission record to include the transformed output file name and s3 key
        await updateSurveyOccurrenceSubmissionWithOutputKey(
          req.body.occurrence_submission_id,
          outputFileName,
          outputS3Key,
          connection
        );

        await insertSubmissionStatus(
          req.body.occurrence_submission_id,
          SUBMISSION_STATUS_TYPE.TEMPLATE_TRANSFORMED,
          connection
        );

        await connection.commit();

        next();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      defaultLog.debug({ label: 'persistTransformationResults', message: 'error', error });
      throw error;
    }
  };
}
