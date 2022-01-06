import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../database/db';
import { HTTP400 } from '../../../../errors/custom-error';
import { queries } from '../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/participants/get');

export const GET: Operation = [
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
  getParticipants()
];

GET.apiDoc = {
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
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'List of project participants.',
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
                    project_participation_id: {
                      type: 'number'
                    },
                    project_id: {
                      type: 'number'
                    },
                    system_user_id: {
                      type: 'number'
                    },
                    project_role_id: {
                      type: 'number'
                    },
                    project_role_name: {
                      type: 'string'
                    },
                    user_identifier: {
                      type: 'string'
                    },
                    user_identity_source_id: {
                      type: 'number'
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
 * Get all project participants.
 *
 * @returns {RequestHandler}
 */
export function getParticipants(): RequestHandler {
  return async (req, res) => {
    if (!req.params.projectId) {
      throw new HTTP400('Missing required param `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const projectId = Number(req.params.projectId);

      await connection.open();

      const result = await getProjectParticipants(projectId, connection);

      await connection.commit();

      return res.status(200).json({ participants: result });
    } catch (error) {
      defaultLog.error({ label: 'getAllProjectParticipantsSQL', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Execute SQL to fetch all project participants.
 *
 * @param {number} projectId the project id
 * @param {IDBConnection} connection an open db connection
 * @return {*}  {Promise<object[]>}
 */
export const getProjectParticipants = async (projectId: number, connection: IDBConnection): Promise<object[]> => {
  const sqlStatement = queries.projectParticipation.getAllProjectParticipantsSQL(projectId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rows) {
    throw new HTTP400('Failed to get project participants');
  }

  return (response && response.rows) || [];
};
