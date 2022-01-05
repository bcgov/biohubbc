import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400, HTTP500 } from '../../../../../errors/custom-error';
import { addProjectParticipant } from '../../../../../paths-helpers/project-participation';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../utils/logger';
import { deleteProjectParticipationRecord } from './delete';
import { doAllProjectsHaveAProjectLead } from '../../../../user/{userId}/delete';
import { getProjectParticipants } from '../get';

const defaultLog = getLogger('/api/project/{projectId}/participants/{projectParticipationId}/update');

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
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'projectParticipationId',
      schema: {
        type: 'number'
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
              type: 'number'
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
    defaultLog.debug({ label: 'updateProjectParticipantRole', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.projectParticipationId) {
      throw new HTTP400('Missing required path param `projectParticipationId`');
    }

    if (!req.body.roleId) {
      throw new HTTP400('Missing required body param `roleId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      //Check project lead roles before updating user
      const projectParticipantsResponse1 = await getProjectParticipants(Number(req.params.projectId), connection);
      const projectHasLeadResponse1 = doAllProjectsHaveAProjectLead(projectParticipantsResponse1);

      // Delete the user's old participation record, returning the old record
      const result = await deleteProjectParticipationRecord(Number(req.params.projectParticipationId), connection);

      if (!result || !result.system_user_id) {
        // The delete result is missing necesary data, fail the request
        throw new HTTP500('Failed to update project participant role');
      }

      await addProjectParticipant(
        Number(req.params.projectId),
        Number(result.system_user_id), // get the user's system id from the old participation record
        Number(req.body.roleId),
        connection
      );

      //if Project Lead roles are invalide skip check to prevent removal of only Project Lead of project
      //(Project is already missing Project Lead and is in a bad state)
      if (projectHasLeadResponse1) {
        const projectParticipantsResponse2 = await getProjectParticipants(Number(req.params.projectId), connection);
        const projectHasLeadResponse2 = doAllProjectsHaveAProjectLead(projectParticipantsResponse2);

        if (!projectHasLeadResponse2) {
          throw new HTTP400('Cannot update project user. User is the only Project Lead for the project.');
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
