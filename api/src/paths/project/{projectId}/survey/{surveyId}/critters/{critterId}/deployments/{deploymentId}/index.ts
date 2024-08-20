import dayjs from 'dayjs';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../../../../services/bctw-service/bctw-deployment-service';
import { CritterbaseService, ICritterbaseUser } from '../../../../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../../../../services/deployment-service';
import { getLogger } from '../../../../../../../../../utils/logger';

const defaultLog = getLogger(
  'paths/project/{projectId}/survey/{surveyId}/critters/{critterId}/deployments/{bctwDeploymentId}'
);

export const PATCH: Operation = [
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
  patchDeployment()
];

PATCH.apiDoc = {
  description: 'Updates information about the start and end of a deployment.',
  tags: ['critterbase'],
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
    },
    {
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'deploymentId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Specifies a deployment id and the new timerange to update it with.',
    content: {
      'application/json': {
        schema: {
          title: 'Deploy device request object',
          type: 'object',
          additionalProperties: false,
          required: [
            'deployment_id',
            'bctw_deployment_id',
            'critterbase_start_capture_id',
            'critterbase_end_capture_id',
            'critterbase_end_mortality_id',
            'attachment_end_date',
            'attachment_end_time'
          ],
          properties: {
            deployment_id: {
              type: 'integer',
              description: 'Id of the deployment in SIMS',
              minimum: 1
            },
            bctw_deployment_id: {
              type: 'string',
              description: 'Id of the deployment in BCTW',
              format: 'uuid'
            },
            critterbase_start_capture_id: {
              type: 'string',
              description: 'Critterbase capture record for when the deployment start',
              format: 'uuid',
              nullable: true
            },
            critterbase_end_capture_id: {
              type: 'string',
              description: 'Critterbase capture record for when the deployment ended',
              format: 'uuid',
              nullable: true
            },
            critterbase_end_mortality_id: {
              type: 'string',
              description: 'Critterbase mortality record for when the deployment ended',
              format: 'uuid',
              nullable: true
            },
            attachment_end_date: {
              type: 'string',
              description: 'End date of the deployment, without time.',
              example: '2021-01-01',
              pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}$',
              nullable: true
            },
            attachment_end_time: {
              type: 'string',
              description: 'End time of the deployment.',
              example: '12:00:00',
              pattern: '^[0-9]{2}:[0-9]{2}:[0-9]{2}$',
              nullable: true
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Responds with count of rows created or updated in SIMS DB Deployments.',
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

export function patchDeployment(): RequestHandler {
  return async (req, res) => {
    const critterId = Number(req.params.critterId);
    const deploymentId = Number(req.params.deploymentId);

    const connection = getDBConnection(req.keycloak_token);

    const {
      deployment_id,
      bctw_deployment_id,
      critterbase_start_capture_id,
      critterbase_end_capture_id,
      critterbase_end_mortality_id,
      attachment_end_date,
      attachment_end_time
    } = req.body;

    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      const bctwDeploymentService = new BctwDeploymentService(user);
      const deploymentService = new DeploymentService(connection);
      const critterbaseService = new CritterbaseService(user);

      await deploymentService.updateDeployment(deploymentId, {
        critter_id: critterId,
        bctw_deployment_id: bctw_deployment_id,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      });

      const capture = await critterbaseService.getCaptureById(critterbase_start_capture_id);

      // Update the deployment in BCTW, which works by soft deleting and inserting a new deployment record
      await bctwDeploymentService.updateDeployment({
        deployment_id,
        attachment_start: capture.capture_date,
        attachment_end: dayjs(`${attachment_end_date} ${attachment_end_time}`).toISOString() // TODO: ADD SEPARATE DATE AND TIME TO BCTW
      });

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'patchDeployment', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
