import { AxiosError } from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../../../services/bctw-service/bctw-deployment-service';
import { ICritterbaseUser } from '../../../../../../../../services/critterbase-service';
import { getLogger } from '../../../../../../../../utils/logger';

const defaultLog = getLogger(
  'paths/project/{projectId}/survey/{surveyId}/critters/{critterId}/deployments/{bctwDeploymentId}'
);
export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
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
  deleteDeployment()
];

DELETE.apiDoc = {
  description: 'Deletes the deployment record in SIMS, and soft deletes the record in BCTW.',
  tags: ['bctw'],
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
    },
    {
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'bctwDeploymentId',
      schema: {
        type: 'string',
        format: 'uuid'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Removed deployment successfully.',
      content: {
        'application/json': {
          schema: {
            title: 'Deployment response object',
            type: 'object',
            additionalProperties: false,
            properties: {
              message: {
                type: 'string'
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
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function deleteDeployment(): RequestHandler {
  return async (req, res) => {
    const deploymentId = String(req.params.bctwDeploymentId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      const bctwService = new BctwDeploymentService(user);
      await bctwService.deleteDeployment(deploymentId);

      await connection.commit();
      return res.status(200).json({ message: 'Deployment deleted.' });
    } catch (error) {
      defaultLog.error({ label: 'deleteDeployment', message: 'error', error });
      await connection.rollback();

      return res.status(500).json((error as AxiosError).response);
    } finally {
      connection.release();
    }
  };
}
