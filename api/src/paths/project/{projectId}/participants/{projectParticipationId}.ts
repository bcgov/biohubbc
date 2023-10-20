import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, PROJECT_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { HTTP400, HTTP500 } from '../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { ProjectParticipationService } from '../../../../services/project-participation-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/participants/{projectParticipationId}');

export const PUT: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  putProjectParticipantRole()
];

PUT.apiDoc = {
  description: 'Update a project participant role.',
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
      name: 'projectParticipationId',
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
          required: ['roleId'],
          properties: {
            roleId: {
              type: 'integer',
              minimum: 1
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Update project participant role OK'
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

export function putProjectParticipantRole(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.params.projectId);
    const projectParticipationId = Number(req.params.projectParticipationId);
    const roleId = Number(req.body.roleId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const projectParticipationService = new ProjectParticipationService(connection);

      // Get project participant state before updates are made
      const projectParticipantsResponse1 = await projectParticipationService.getProjectParticipants(
        Number(req.params.projectId)
      );
      const projectHasLeadResponse1 = projectParticipationService.doAllProjectsHaveAProjectLead(
        projectParticipantsResponse1
      );

      // Delete the user's old participation record, returning the old record
      const result = await projectParticipationService.deleteProjectParticipationRecord(projectParticipationId);

      if (!result || !result.system_user_id) {
        // The delete result is missing necessary data, fail the request
        throw new HTTP500('Failed to update project participant role');
      }

      await projectParticipationService.postProjectParticipant(
        projectId,
        Number(result.system_user_id), // get the user's system id from the old participation record
        roleId
      );

      // If the project participant state before the changes was already invalid, then don't bother checking the state
      // after the changes. This situation should ideally never happen.
      if (projectHasLeadResponse1) {
        // Get project participant state after updates were made
        const projectParticipantsResponse2 = await projectParticipationService.getProjectParticipants(
          Number(req.params.projectId)
        );
        const projectHasLeadResponse2 = projectParticipationService.doAllProjectsHaveAProjectLead(
          projectParticipantsResponse2
        );

        // If any project that the user is on now no longer has a coordinator, then these updates must have been
        // responsible, and so should not be allowed. A project must always have at least 1 coordinator role.
        if (!projectHasLeadResponse2) {
          throw new HTTP400(
            `Cannot update project user. User is the only ${PROJECT_ROLE.COORDINATOR} for the project.`
          );
        }
      }

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'putProjectParticipantRole', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  deleteProjectParticipant()
];

DELETE.apiDoc = {
  description: 'Delete a project participant.',
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
      name: 'projectParticipationId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Delete project participant OK'
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

export function deleteProjectParticipant(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.params.projectId);
    const projectParticipationId = Number(req.params.projectParticipationId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const projectParticipationService = new ProjectParticipationService(connection);

      // Check coordinator roles before deleting user
      const projectParticipantsResponse1 = await projectParticipationService.getProjectParticipants(projectId);
      const projectHasLeadResponse1 = projectParticipationService.doAllProjectsHaveAProjectLead(
        projectParticipantsResponse1
      );

      const result = await projectParticipationService.deleteProjectParticipationRecord(projectParticipationId);

      if (!result || !result.system_user_id) {
        // The delete result is missing necessary data, fail the request
        throw new HTTP500('Failed to delete project participant');
      }

      // If coordinator roles are invalid skip check to prevent removal of only coordinator of project
      // (Project is already missing coordinator and is in a bad state)
      if (projectHasLeadResponse1) {
        const projectParticipantsResponse2 = await projectParticipationService.getProjectParticipants(projectId);
        const projectHasLeadResponse2 = projectParticipationService.doAllProjectsHaveAProjectLead(
          projectParticipantsResponse2
        );

        if (!projectHasLeadResponse2) {
          throw new HTTP400(
            `Cannot delete project user. User is the only ${PROJECT_ROLE.COORDINATOR} for the project.`
          );
        }
      }

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteProjectParticipant', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
