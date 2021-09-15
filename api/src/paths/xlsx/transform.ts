import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getSubmissionFileFromS3, getSubmissionS3Key } from '../../paths/dwc/validate';
import { getLogger } from '../../utils/logger';
import { TransformationSchemaParser } from '../../utils/media/xlsx/transformation/transformation-schema-parser';
import { XLSXCSV } from '../../utils/media/xlsx/xlsx-file';
import { logRequest } from '../../utils/path-utils';
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
    defaultLog.debug({ label: 'transformXLSX', message: 'xlsx' });

    try {
      const xlsxCsv: XLSXCSV = req['xlsx'];

      const transformationSchemaParser: TransformationSchemaParser = req['transformationSchemaParser'];

      const response = xlsxCsv.transform(transformationSchemaParser);

      console.log('===========================================');
      console.log(response);
      console.log('===========================================');

      return res.status(200).json(response);

      // next();
    } catch (error) {
      defaultLog.debug({ label: 'transformXLSX', message: 'error', error });
      throw error;
    }
  };
}

export function persistTransformationResults(): RequestHandler {
  return async (req, res) => {
    res.status(200).json();
  };
}
