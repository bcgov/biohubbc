import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getDBConnection } from '../../database/db';
import { PostSurveyFilter } from '../../repositories/survey-filter-repository';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { SurveyFilterService } from '../../services/survey-filter-service';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/user/{userId}/survey-filter');

export const POST: Operation = [
  authorizeRequestHandler(() => {
    return {
      or: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  createSurveyFilter()
];

POST.apiDoc = {
  description: 'Add a new system user with role.',
  tags: ['filters'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Add system user request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          title: 'User survey filter Object',
          type: 'object',
          additionalProperties: false,
          required: ['name', 'conditions', 'description'],
          properties: {
            name: {
              type: 'string',
              description: 'The name of the survey filter'
            },
            description: {
              type: 'string',
              description: 'The description of the survey filter',
              nullable: true
            },
            conditions: {
              type: 'object',
              description: 'The filter object.',
              additionalProperties: false,
              properties: {
                keyword: { type: 'string' },
                itis_tsn: { type: 'integer' },
                system_user_id: { type: 'integer' }
              }
            }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Add survey filters OK.'
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    403: {
      $ref: '#/components/responses/403'
    },
    409: {
      $ref: '#/components/responses/409'
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
 * Add a system user by its user identifier and role.
 *
 * @returns {RequestHandler}
 */
export function createSurveyFilter(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const surveyFilterService = new SurveyFilterService(connection);

      const surveyFilter = { ...req.body, system_user_id: systemUserId } as PostSurveyFilter;

      await surveyFilterService.createSurveyFilter(surveyFilter);

      await connection.commit();

      return res.status(201).send();
    } catch (error) {
      defaultLog.error({ label: 'createSurveyFilter', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      or: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  findSurveyFiltersBySystemUserId()
];

GET.apiDoc = {
  description: 'Find filters for the user making the request.',
  tags: ['filters'],
  security: [
    {
      Bearer: []
    }
  ],
  responses: {
    200: {
      description: 'Find survey filters response',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['filters'],
            properties: {
              filters: {
                type: 'array',
                items: {
                  title: 'Find survey filters response object',
                  type: 'object',
                  additionalProperties: false,
                  required: ['survey_filter_id', 'name', 'conditions', 'description', 'system_user_id'],
                  properties: {
                    survey_filter_id: { type: 'integer', description: 'The primary key of the filter record' },
                    name: {
                      type: 'string',
                      description: 'The name of the survey filter'
                    },
                    system_user_id: {
                      type: 'integer',
                      description: 'The user associated with the filter'
                    },
                    description: {
                      type: 'string',
                      description: 'The description of the filter',
                      nullable: true
                    },
                    conditions: {
                      type: 'object',
                      description: 'The filter object.',
                      additionalProperties: false,
                      properties: {
                        keyword: { type: 'string' },
                        itis_tsn: { type: 'integer' },
                        system_user_id: { type: 'integer' }
                      }
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
      $ref: '#/components/responses/403'
    },
    409: {
      $ref: '#/components/responses/409'
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
 * Find filters for the user making the request
 *
 * @returns {RequestHandler}
 */
export function findSurveyFiltersBySystemUserId(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const surveyFilterService = new SurveyFilterService(connection);

      const filters = await surveyFilterService.findSurveyFilters(systemUserId);

      await connection.commit();

      console;

      return res.status(200).json({ filters });
    } catch (error) {
      defaultLog.error({ label: 'createSurveyFilter', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
