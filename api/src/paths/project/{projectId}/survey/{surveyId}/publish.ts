import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../database/db';
import { HTTP400, HTTP403, HTTP500 } from '../../../../../errors/CustomError';
import { surveyIdResponseObject } from '../../../../../openapi/schemas/survey';
import {
  deleteSurveyOccurrencesSQL,
  getLatestSurveyOccurrenceSubmissionSQL
} from '../../../../../queries/survey/survey-occurrence-queries';
import { updateSurveyPublishStatusSQL } from '../../../../../queries/survey/survey-update-queries';
import { AuthorizationScheme, authorizeRequest } from '../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/publish');

export const PUT: Operation = [authorize(), publishSurveyAndOccurrences()];

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
            ...(surveyIdResponseObject as object)
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

export function authorize(): RequestHandler {
  return async (req, res, next) => {
    const authorizationScheme = {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    } as AuthorizationScheme;

    req['authorization_scheme'] = authorizationScheme;

    const isAuthorized = await authorizeRequest(req);

    if (!isAuthorized) {
      throw new HTTP403('Access Denied');
    }

    next();
  };
}

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

      if (!publish) {
        await deleteOccurrences(surveyId, connection);
      }

      await publishSurvey(surveyId, publish, connection);

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
 * Delete all occurrences for a survey.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 */
export const deleteOccurrences = async (surveyId: number, connection: IDBConnection) => {
  const occurrenceSubmission = await getSurveyOccurrenceSubmission(surveyId, connection);

  const sqlStatement = deleteSurveyOccurrencesSQL(occurrenceSubmission.id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build delete survey occurrences SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP500('Failed to delete survey occurrences');
  }
};

/**
 * Update a survey, marking it as published/unpublished.
 *
 * @returns {RequestHandler}
 */
export const publishSurvey = async (surveyId: number, publish: boolean, connection: IDBConnection) => {
  const sqlStatement = updateSurveyPublishStatusSQL(surveyId, publish);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build survey publish SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result) {
    throw new HTTP500('Failed to update survey publish status');
  }
};

/**
 * Get the latest survey occurrence submission.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 * @return {*}
 */
export const getSurveyOccurrenceSubmission = async (surveyId: number, connection: IDBConnection) => {
  const sqlStatement = getLatestSurveyOccurrenceSubmissionSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build get survey occurrence submission SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rows.length) {
    throw new HTTP500('Failed to get survey occurrence submissions');
  }

  return response.rows[0];
};
