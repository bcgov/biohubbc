import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, PROJECT_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400, HTTP500 } from '../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { ProjectService } from '../../../../../services/project-service';
import { getLogger } from '../../../../../utils/logger';
import { doAllProjectsHaveAProjectLead } from '../../../../user/{userId}/delete';

const defaultLog = getLogger('/api/project/{projectId}/participants/{projectParticipationId}/update');

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
  updateProjectParticipantRole()
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

export function updateProjectParticipantRole(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.params.projectId);
    const projectParticipationId = Number(req.params.projectParticipationId);
    const roleId = Number(req.body.roleId);

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const projectService = new ProjectService(connection);

      // Check coordinator roles before updating user
      const projectParticipantsResponse1 = await projectService.getProjectParticipants(Number(req.params.projectId));
      const projectHasLeadResponse1 = doAllProjectsHaveAProjectLead(projectParticipantsResponse1);

      // Delete the user's old participation record, returning the old record
      const result = await projectService.deleteProjectParticipationRecord(projectParticipationId);

      if (!result || !result.system_user_id) {
        // The delete result is missing necessary data, fail the request
        throw new HTTP500('Failed to update project participant role');
      }

      await projectService.addProjectParticipant(
        projectId,
        Number(result.system_user_id), // get the user's system id from the old participation record
        roleId
      );

      // If coordinator roles are invalid skip check to prevent removal of only coordinator of project
      // (Project is already missing coordinator and is in a bad state)
      if (projectHasLeadResponse1) {
        const projectParticipantsResponse2 = await projectService.getProjectParticipants(Number(req.params.projectId));
        const projectHasLeadResponse2 = doAllProjectsHaveAProjectLead(projectParticipantsResponse2);

        if (!projectHasLeadResponse2) {
          throw new HTTP400(
            `Cannot update project user. User is the only ${PROJECT_ROLE.COORDINATOR} for the project.`
          );
        }
      }

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateProjectParticipantRole', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
