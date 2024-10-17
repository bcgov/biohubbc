import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../services/bctw-service/bctw-deployment-service';
import { ICritterbaseUser } from '../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../services/deployment-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/deployments/delete');

export const POST: Operation = [
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
  deleteDeploymentsInSurvey()
];

POST.apiDoc = {
  description: 'Delete deployments from a survey.',
  tags: ['deployment', 'bctw'],
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
    description: 'Array of one or more deployment IDs to delete.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            deployment_ids: {
              type: 'array',
              items: {
                type: 'integer',
                minimum: 1
              },
              minItems: 1
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Delete OK.'
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
 * Delete deployments from a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function deleteDeploymentsInSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const deploymentIds: number[] = req.body.deployment_ids;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      const deletePromises = deploymentIds.map(async (deploymentId) => {
        const deploymentService = new DeploymentService(connection);
        const { bctw_deployment_id } = await deploymentService.deleteDeployment(surveyId, deploymentId);

        const bctwDeploymentService = new BctwDeploymentService(user);
        await bctwDeploymentService.deleteDeployment(bctw_deployment_id);
      });

      await Promise.all(deletePromises);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteDeploymentsInSurvey', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
