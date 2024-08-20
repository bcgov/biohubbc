import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP409 } from '../../../../../../../errors/http-error';
import { getDeploymentSchema, postDeploymentSchema } from '../../../../../../../openapi/schemas/deployment';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../../services/bctw-service/bctw-deployment-service';
import { CritterbaseService, ICritterbaseUser } from '../../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../../services/deployment-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/deployments/{deploymentId}/index');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [
            PROJECT_PERMISSION.COORDINATOR,
            PROJECT_PERMISSION.COLLABORATOR,
            PROJECT_PERMISSION.OBSERVER
          ],
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
  getDeploymentById()
];

GET.apiDoc = {
  description: 'Returns information about a specific deployment.',
  tags: ['deployment', 'bctw'],
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
    },
    {
      in: 'path',
      name: 'deploymentId',
      description: 'SIMS deployment ID',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Responds with information about a deployment under this survey.',
      content: {
        'application/json': {
          schema: {
            oneOf: [getDeploymentSchema, { type: 'null' }]
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

export function getDeploymentById(): RequestHandler {
  return async (req, res) => {
    const deploymentId = Number(req.params.deploymentId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      const deploymentService = new DeploymentService(connection);
      const bctwDeploymentService = new BctwDeploymentService(user);

      // Fetch deployments from the deployment service for the given surveyId
      const surveyDeployment = await deploymentService.getDeploymentById(deploymentId);

      // Return early if there are no deployments
      if (!surveyDeployment) {
        // TODO: 400 error instead?
        return res.status(200).send();
      }

      // Fetch additional deployment details from BCTW service
      const bctwDeployments = await bctwDeploymentService.getDeploymentsByIds([surveyDeployment.bctw_deployment_id]);

      // For the SIMS survey deployment record, find the matching BCTW deployment record.
      // We expect exactly 1 matching record, otherwise we throw an error.
      // More than 1 matching active record indicates an error in the BCTW data.
      const matchingBctwDeployments = bctwDeployments.filter(
        (deployment) => deployment.deployment_id === surveyDeployment.bctw_deployment_id
      );

      if (matchingBctwDeployments.length > 1) {
        throw new HTTP409('Multiple active deployments found for the same deployment ID', [
          'This is an issue in the BC Telemetry Warehouse (BCTW) data. There should only be one active deployment record for a given deployment ID.',
          `SIMS deployment ID: ${surveyDeployment.deployment_id}`,
          `BCTW deployment ID: ${surveyDeployment.bctw_deployment_id}`
        ]);
      }

      if (matchingBctwDeployments.length === 0) {
        throw new HTTP409('No active deployments found for deployment ID', [
          'There should be no deployments recorded in SIMS that have no matching deployment record in BCTW.',
          `SIMS Deployment ID: ${surveyDeployment.deployment_id}`,
          `BCTW Deployment ID: ${surveyDeployment.bctw_deployment_id}`
        ]);
      }

      const surveyDeploymentWithBctwData = {
        // BCTW properties
        assignment_id: matchingBctwDeployments[0].assignment_id,
        collar_id: matchingBctwDeployments[0].collar_id,
        attachment_start: matchingBctwDeployments[0].attachment_start,
        attachment_end: matchingBctwDeployments[0].attachment_end,
        bctw_deployment_id: matchingBctwDeployments[0].deployment_id,
        device_id: matchingBctwDeployments[0].device_id,
        device_make: matchingBctwDeployments[0].device_make,
        device_model: matchingBctwDeployments[0].device_model,
        frequency: matchingBctwDeployments[0].frequency,
        frequency_unit: matchingBctwDeployments[0].frequency_unit,
        // SIMS properties
        deployment_id: surveyDeployment.deployment_id,
        critter_id: surveyDeployment.critter_id,
        critterbase_critter_id: surveyDeployment.critterbase_critter_id,
        critterbase_start_capture_id: surveyDeployment.critterbase_start_capture_id,
        critterbase_end_capture_id: surveyDeployment.critterbase_end_capture_id,
        critterbase_end_mortality_id: surveyDeployment.critterbase_end_mortality_id
      };

      return res.status(200).json(surveyDeploymentWithBctwData);
    } catch (error) {
      defaultLog.error({ label: 'getDeploymentById', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}

export const PUT: Operation = [
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

PUT.apiDoc = {
  description: 'Updates information about the start and end of a deployment.',
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
    },
    {
      in: 'path',
      name: 'deploymentId',
      description: 'SIMS deployment ID',
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
        schema: postDeploymentSchema
      }
    }
  },
  responses: {
    200: {
      description: 'Deployment updated OK.'
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
    const deploymentId = Number(req.params.deploymentId);

    const connection = getDBConnection(req.keycloak_token);

    const {
      critter_id,
      critterbase_start_capture_id,
      critterbase_end_capture_id,
      critterbase_end_mortality_id,
      attachment_end_date,
      attachment_end_time,
      ...bctwRequestObject
    } = req.body;

    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      const deploymentService = new DeploymentService(connection);
      const bctwDeploymentService = new BctwDeploymentService(user);
      const critterbaseService = new CritterbaseService(user);

      // Update the deployment in SIMS
      const bctw_deployment_id = await deploymentService.updateDeployment(deploymentId, {
        critter_id: critter_id,
        bctw_deployment_id: bctwRequestObject.bctw_deployment_id,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      });

      // TODO: Decide whether to explicitly record attachment start date, or just reference the capture. Might remove this line.
      const capture = await critterbaseService.getCaptureById(critterbase_start_capture_id);

      // Update the deployment in BCTW, which works by soft deleting and inserting a new deployment record (hence createDeployment)
      await bctwDeploymentService.updateDeployment({
        ...bctwRequestObject,
        attachment_start: capture.capture_date,
        attachment_end: dayjs(`${attachment_end_date} ${attachment_end_time}`), // TODO: ADD SEPARATE DATE AND TIME TO BCTW
        critter_id: capture.critter_id,
        deployment_id: bctw_deployment_id
      });

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateDeployment', message: 'error', error });
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
  tags: ['deploymenty', 'bctw'],
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
      name: 'deploymentId',
      description: 'SIMS deployment ID',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Delete deployment OK.'
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
    const deploymentId = Number(req.params.deploymentId);
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      const deploymentService = new DeploymentService(connection);
      const { bctw_deployment_id } = await deploymentService.deleteDeployment(surveyId, deploymentId);

      const bctwDeploymentService = new BctwDeploymentService(user);
      await bctwDeploymentService.deleteDeployment(bctw_deployment_id);

      await connection.commit();
      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteDeployment', message: 'error', error });
      await connection.rollback();

      return res.status(500).json((error as AxiosError).response);
    } finally {
      connection.release();
    }
  };
}
