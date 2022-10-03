import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../constants/roles';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { getLogger } from '../../utils/logger';
import { getSubmissionOutputS3Key, scrapeAndUploadOccurrences } from '../dwc/scrape-occurrences';
import {
  getOccurrenceSubmission,
  getOccurrenceSubmissionInputS3Key,
  getS3File,
  getValidationRules,
  persistParseErrors,
  persistValidationResults,
  prepDWCArchive
} from '../dwc/validate';
import {
  getTransformationRules,
  getTransformationSchema,
  persistTransformationResults,
  transformXLSX
} from './transform';
import { getValidationSchema, prepXLSX, validateXLSX } from './validate';

const defaultLog = getLogger('paths/xlsx/process');

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
  //general set up
  getOccurrenceSubmission(),
  getOccurrenceSubmissionInputS3Key(),
  getS3File(),
  prepXLSX(),
  persistParseErrors(),
  sendResponse(),

  //xlsx validate
  getValidationSchema(),
  getValidationRules(),
  validateXLSX(),
  persistValidationResults({ initialSubmissionStatusType: 'Template Validated' }),

  //xlsx transform functions
  getTransformationSchema(),
  getTransformationRules(),
  transformXLSX(),
  persistTransformationResults(),

  //scrape functions
  getOccurrenceSubmission(),
  getSubmissionOutputS3Key(),
  getS3File(),
  prepDWCArchive(),
  scrapeAndUploadOccurrences()
];

POST.apiDoc = {
  description:
    'Validates, transforms and scrapes an XLSX survey observation submission file into a Darwin Core Archive file, and scrapes the occurences from the DwC archive',
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

export function sendResponse(): RequestHandler {
  console.log('_____________________ SEND RESPONSE _____________________');
  return async (_req, res, next) => {
    res.status(200).json({ status: 'success' });
    defaultLog.info({ label: 'xlsx process', message: `success sent` });
    next();
  };
}
