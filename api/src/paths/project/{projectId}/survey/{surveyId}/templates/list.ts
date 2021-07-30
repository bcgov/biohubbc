'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import { GetTemplateObservationsData } from '../../../../../../models/template-observations';
import { getLatestSurveyOccurrenceSubmissionSQL } from '../../../../../../queries/survey/survey-occurrence-queries';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/templates/list');

export const GET: Operation = [getTemplateObservations()];

GET.apiDoc = {
  description: 'Fetches a list of template observations for a survey.',
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
      schema: {
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Survey get response file description array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'number'
                },
                fileName: {
                  description: 'The file name of the attachment',
                  type: 'string'
                },
                lastModified: {
                  description: 'The date the object was last modified',
                  type: 'string'
                },
                size: {
                  type: 'number'
                }
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

export function getTemplateObservations(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get template observations list', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getTemplateObservationsSQLStatement = getLatestSurveyOccurrenceSubmissionSQL(Number(req.params.surveyId));

      if (!getTemplateObservationsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const templateObservationsData = await connection.query(
        getTemplateObservationsSQLStatement.text,
        getTemplateObservationsSQLStatement.values
      );

      await connection.commit();

      const getTemplateObservationsData =
        (templateObservationsData &&
          templateObservationsData.rows &&
          new GetTemplateObservationsData(templateObservationsData.rows)) ||
        null;

      return res.status(200).json(getTemplateObservationsData);
    } catch (error) {
      defaultLog.debug({ label: 'getTemplateObservations', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
