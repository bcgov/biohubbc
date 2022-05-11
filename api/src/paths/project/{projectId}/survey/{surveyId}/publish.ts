import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../database/db';
import { HTTP400, HTTP500 } from '../../../../../errors/custom-error';
import { queries } from '../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/publish');

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),

  publishSurveyAndOccurrences()
];

PUT.apiDoc = {
  description: 'Publish or unpublish a survey.',
  tags: ['survey'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Publish or unpublish put request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Publish request object',
          type: 'object',
          required: ['publish'],
          properties: {
            publish: {
              title: 'publish?',
              type: 'boolean'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Survey publish request completed successfully.',
      content: {
        'application/json': {
          schema: {
            // TODO is there any return value? or is it just an HTTP status with no content?
            title: 'Survey Response Object',
            type: 'object',
            required: ['id'],
            properties: {
              id: {
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

/**
 * Publish survey and occurrences.
 *
 * @returns {RequestHandler}
 */
export function publishSurveyAndOccurrences(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const surveyId = Number(req.params.surveyId);

      if (!surveyId) {
        throw new HTTP400('Missing required path parameter: surveyId');
      }

      if (!req.body) {
        throw new HTTP400('Missing request body');
      }

      const publish: boolean = req.body.publish;

      if (publish === undefined) {
        throw new HTTP400('Missing publish flag in request body');
      }

      await connection.open();

      await publishSurvey(surveyId, publish, connection);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'publishSurveyAndOccurrences', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Update a survey, marking it as published/unpublished.
 *
 * @returns {RequestHandler}
 */
export const publishSurvey = async (surveyId: number, publish: boolean, connection: IDBConnection) => {
  console.log('publish survey parameters : ', surveyId, publish);
  const sqlStatement = queries.survey.updateSurveyPublishStatusSQL(surveyId, publish);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build survey publish SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;
  console.log('result is: ', result);

  if (!result) {
    throw new HTTP500('Failed to update survey publish status');
  }
};
