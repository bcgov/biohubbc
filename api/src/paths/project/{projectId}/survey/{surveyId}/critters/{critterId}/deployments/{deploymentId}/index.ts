import { AxiosError } from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../../../../services/bctw-service/bctw-deployment-service';
import { ICritterbaseUser } from '../../../../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../../../../services/deployment-service';
import { getLogger } from '../../../../../../../../../utils/logger';

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
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    const deploymentId = String(req.params.bctwDeploymentId);
    const critterId = Number(req.params.critterId);

    const connection = getDBConnection(req['keycloak_token']);

    const bctwDeploymentService = new BctwDeploymentService(user);
    const deploymentService = new DeploymentService(connection);

    try {
      await connection.open();

      await deploymentService.removeDeployment(critterId, deploymentId);

      await bctwDeploymentService.deleteDeployment(deploymentId);

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
  updateDeployment()
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
      name: 'surveyId',
      schema: {
        type: 'integer'
      },
      required: true
    },
    {
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'integer'
      }
    },
    {
      in: 'path',
      name: 'bctwDeploymentId',
      description: 'BCTW deployment Id, not the primary key of the deployment table.',
      schema: {
        type: 'integer'
      }
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
              nullable: true
            },
            attachment_end_time: {
              type: 'string',
              description: 'End time of the deployment.',
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

export function updateDeployment(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    const critterId = Number(req.params.critterId);
    const bctwDeploymentId = req.params.bctwDeploymentId;

    const connection = getDBConnection(req['keycloak_token']);

    const bctwDeploymentService = new BctwDeploymentService(user);
    const deploymentService = new DeploymentService(connection);

    const {
      deployment_id,
      critterbase_start_capture_id,
      critterbase_end_capture_id,
      critterbase_end_mortality_id,
      ...bctwUpdateObject
    } = req.body;

    try {
      await connection.open();

      // Update the deployment in SIMS
      await deploymentService.updateDeployment({
        critter_id: critterId,
        bctw_deployment_id: bctwDeploymentId,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      });

      // TODO: BCTW call will fail because there is no attachment start or attachment_id.
      // Extract start and end from capture?

      // Update the deployment in BCTW
      await bctwDeploymentService.updateDeployment(bctwUpdateObject);

      await connection.commit();

      return res.status(200).json({ message: 'Deployment updated.' });
    } catch (error) {
      defaultLog.error({ label: 'updateDeployment', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
