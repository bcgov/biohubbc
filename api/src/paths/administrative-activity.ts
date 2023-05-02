import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getAPIUserDBConnection } from '../database/db';
import { HTTP400, HTTP500 } from '../errors/http-error';
import { getUserIdentifier } from '../utils/keycloak-utils';
import { getLogger } from '../utils/logger';
import { AdministrativeActivitiesService } from '../services/administrative-activities-service';

const defaultLog = getLogger('paths/administrative-activity-request');

export const POST: Operation = [createAdministrativeActivity()];

export const GET: Operation = [getAdministrativeActivityStanding()];

POST.apiDoc = {
  description: 'Create a new Administrative Activity.',
  tags: ['admin'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Administrative Activity post request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Administrative Activity request object',
          type: 'object',
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Administrative activity post response object.',
      content: {
        'application/json': {
          schema: {
            title: 'Administrative Activity Response Object',
            type: 'object',
            required: ['id', 'date'],
            properties: {
              id: {
                type: 'number'
              },
              date: {
                description: 'The date this administrative activity was made',
                oneOf: [{ type: 'object' }, { type: 'string', format: 'date' }]
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

GET.apiDoc = {
  description: 'Has one or more pending Administrative Activities.',
  tags: ['access request'],
  security: [
    {
      Bearer: []
    }
  ],
  requestBody: {
    description: 'Administrative Activity get request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Administrative Activity request object',
          type: 'object',
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Administrative Activity standing response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['has_pending_acccess_request', 'has_one_or_more_project_roles'],
            properties: {
              has_pending_acccess_request: {
                type: 'boolean'
              },
              has_one_or_more_project_roles: {
                type: 'boolean'
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
 * Creates a new access request record.
 *
 * @returns {RequestHandler}
 */
export function createAdministrativeActivity(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      if (!systemUserId) {
        throw new HTTP500('Failed to identify system user ID');
      }

      const administrativeActivitiesService = new AdministrativeActivitiesService(connection);

      const accessRequestData = req?.body;
      const response = await administrativeActivitiesService.postAdministrativeActivity(systemUserId, accessRequestData);

      await connection.commit();

      if (!response) {
        throw new HTTP500('Failed to submit administrative activity');
      }

      // await administrativeActivitiesService.sendAccessRequestEmail();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'administrativeActivity', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Get all projects.
 *
 * @returns {RequestHandler}
 */
export function getAdministrativeActivityStanding(): RequestHandler {
  return async (req, res) => {
    const connection = getAPIUserDBConnection();

    try {
      const userIdentifier = getUserIdentifier(req['keycloak_token']);

      if (!userIdentifier) {
        throw new HTTP400('Missing required userIdentifier');
      }

      await connection.open();

      const administrativeActivitiesService = new AdministrativeActivitiesService(connection);
      
      const response = await administrativeActivitiesService.getAdministrativeActivityStanding(userIdentifier);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getAdministrativeActivityStanding', message: 'error', error });

      throw error;
    } finally {
      connection.release();
    }
  };
}
