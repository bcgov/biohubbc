import { getDBConnection } from '../../database/db';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { uploadDWCArchiveOccurrences } from '../../paths/project/{projectId}/survey/{surveyId}/publish';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';
import { getSubmissionFileFromS3, getSubmissionS3Key, prepDWCArchive } from './validate';

const defaultLog = getLogger('paths/dwc/scrape-occurrences');

export const POST: Operation = [
  logRequest('paths/dwc/scrape-occurrences', 'POST'),
  getSubmissionS3Key(),
  getSubmissionFileFromS3(),
  prepDWCArchive(),
  uploadOccurrences()
];

POST.apiDoc = {
  description: 'Scrape information from file into occurrence table.',
  tags: ['scrape', 'occurrence'],
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
      description: 'Successfully scraped occurrence information.'
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

export function uploadOccurrences(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'uploadOccurrences', message: 'params', files: req.body });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      await uploadDWCArchiveOccurrences(Number(req.body.occurrence_submission_id), req['dwcArchive'], connection);

      await connection.commit();
    } catch (error) {
      defaultLog.debug({ label: 'uploadOccurrences', message: 'error', error });
      throw error;
    }
  };
}
