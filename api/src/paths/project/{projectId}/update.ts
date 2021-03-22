import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { WRITE_ROLES } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import {
  projectPutBody,
  projectIdResponseBody,
  getProjectForViewRequestBody,
  projectViewGetResponseBody
} from '../../../openapi/schemas/project';
import { getLogger } from '../../../utils/logger';
import { logRequest } from '../../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}');

export const GET: Operation = [logRequest('paths/project/{projectId}/update', 'GET'), getProjectForUpdate()];

export const PUT: Operation = [logRequest('paths/project/{projectId}/update', 'PUT'), updateProject()];

GET.apiDoc = {
  description: 'Get a project, for update purposes.',
  tags: ['project'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    description: 'Project get request object.',
    content: {
      'application/json': {
        schema: {
          ...(getProjectForViewRequestBody as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            ...(projectViewGetResponseBody as object)
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
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

PUT.apiDoc = {
  description: 'Update a project.',
  tags: ['project'],
  security: [
    {
      Bearer: WRITE_ROLES
    }
  ],
  requestBody: {
    description: 'Project put request object.',
    content: {
      'application/json': {
        schema: {
          ...(projectPutBody as object)
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Project with matching projectId.',
      content: {
        'application/json': {
          schema: {
            // TODO update with an object that represents the real response
            ...(projectIdResponseBody as object)
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
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

/**
 * Get a project, for update purposes.
 *
 * @returns {RequestHandler}
 */
function getProjectForUpdate(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      // Get each section out of the request body, allowing any of them to be null
      // For each section that is not null
      // - parse the data through a model to sanitize it
      // - perform whatever update logic is needed

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'getProject', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Update a project.
 *
 * @returns {RequestHandler}
 */
function updateProject(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      // Get each section out of the request body, allowing any of them to be null
      // For each section that is not null
      // - parse the data through a model to sanitize it
      // - perform whatever update logic is needed

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'getProject', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
