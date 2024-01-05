import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { ISurveyParticipationPostData } from '../../../../../../repositories/survey-participation-repository';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { SurveyParticipationService } from '../../../../../../services/survey-participation-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/participants');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveyParticipants()
];

GET.apiDoc = {
  description: 'Get all survey participants.',
  tags: ['survey'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'List of survey participants.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              participants: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    survey_participation_id: {
                      type: 'number'
                    },
                    survey_id: {
                      type: 'number'
                    },
                    system_user_id: {
                      type: 'number'
                    },
                    survey_job_id: {
                      type: 'number'
                    },
                    survey_job_name: {
                      type: 'string'
                    }
                  }
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

/**
 * Get all survey participants.
 *
 * @returns {RequestHandler}
 */
export function getSurveyParticipants(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const surveyId = Number(req.params.surveyId);

      await connection.open();

      const surveyParticipationService = new SurveyParticipationService(connection);

      const result = await surveyParticipationService.getSurveyParticipants(surveyId);

      await connection.commit();

      return res.status(200).json({ participants: result });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyParticipants', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  createSurveyParticipants()
];

POST.apiDoc = {
  description: 'Get all project participants.',
  tags: ['project'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            participants: {
              type: 'array',
              items: {
                type: 'object',
                nullable: true,
                required: ['system_user_id', 'survey_job_name'],
                properties: {
                  system_user_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  survey_job_name: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project participants added OK.'
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

export function createSurveyParticipants(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    if (!surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }

    if (!req.body.participants?.length) {
      throw new HTTP400('Missing required body param `participants`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const participants: ISurveyParticipationPostData[] = req.body.participants;

      await connection.open();

      const surveyParticipationService = new SurveyParticipationService(connection);

      const promises: Promise<void>[] = participants.map((participant) => {
        return surveyParticipationService.insertSurveyParticipant(
          surveyId,
          participant.system_user_id,
          participant.survey_job_name
        );
      });

      await Promise.all(promises);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'insertProjectParticipants', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
