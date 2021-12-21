import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../database/db';
import { HTTP400, HTTP500 } from '../../../../../errors/CustomError';
import { deleteProjectParticipationSQL } from '../../../../../queries/project-participation/project-participation-queries';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../utils/logger';
import { ChecksIfOnlyProjectLead } from '../../../../user/{userId}/delete';
import { getProjectParticipants } from '../get';

const defaultLog = getLogger('/api/project/{projectId}/participants/{projectParticipationId}/delete');

export const DELETE: Operation = [
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
    defaultLog.debug({ label: 'deleteProjectParticipant', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.projectParticipationId) {
      throw new HTTP400('Missing required path param `projectParticipationId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const result = await deleteProjectParticipationRecord(Number(req.params.projectParticipationId), connection);

      if (!result || !result.system_user_id) {
        // The delete result is missing necesary data, fail the request
        throw new HTTP500('Failed to delete project participant');
      }

      const projectParticipantsResponse = await getProjectParticipants(Number(req.params.projectId), connection);

      const onlyProjectLeadResponse = ChecksIfOnlyProjectLead(projectParticipantsResponse, result.system_user_id);

      if (onlyProjectLeadResponse) {
        throw new HTTP400('Cannot delete project user. User is the only Project Lead for the project');
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

export const deleteProjectParticipationRecord = async (
  projectParticipationId: number,
  connection: IDBConnection
): Promise<any> => {
  const sqlStatement = deleteProjectParticipationSQL(projectParticipationId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL delete statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP500('Failed to delete project team member');
  }

  return response.rows[0];
};
