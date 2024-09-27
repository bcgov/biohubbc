import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { getDeploymentSchema } from '../../../../../../../openapi/schemas/deployment';
import { warningSchema } from '../../../../../../../openapi/schemas/warning';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../../services/bctw-service/bctw-deployment-service';
import { BctwDeviceService } from '../../../../../../../services/bctw-service/bctw-device-service';
import { getBctwUser } from '../../../../../../../services/bctw-service/bctw-service';
import {
  CritterbaseService,
  getCritterbaseUser,
  ICritterbaseUser
} from '../../../../../../../services/critterbase-service';
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
      description: 'Responds with information about a deployment under this survey.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['deployment', 'bad_deployment'],
            additionalProperties: false,
            properties: {
              deployment: {
                ...getDeploymentSchema,
                nullable: true
              },
              bad_deployment: {
                ...warningSchema,
                nullable: true
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
        // Return 400 if the provided deployment ID does not exist
        throw new HTTP400('Deployment ID does not exist.', [{ sims_deployment_id: deploymentId }]);
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
        defaultLog.warn({
          label: 'getDeploymentById',
          message: 'Multiple active deployments found for the same deployment ID, when only one should exist.',
          sims_deployment_id: surveyDeployment.deployment_id,
          bctw_deployment_id: surveyDeployment.bctw_deployment_id
        });

        const badDeployment = {
          name: 'BCTW Data Error',
          message: 'Multiple active deployments found for the same deployment ID, when only one should exist.',
          data: {
            sims_deployment_id: surveyDeployment.deployment_id,
            bctw_deployment_id: surveyDeployment.bctw_deployment_id
          }
        };

        // Don't continue processing this deployment
        return res.status(200).json({ deployment: null, bad_deployment: badDeployment });
      }

      if (matchingBctwDeployments.length === 0) {
        defaultLog.warn({
          label: 'getDeploymentById',
          message: 'No active deployments found for deployment ID, when one should exist.',
          sims_deployment_id: surveyDeployment.deployment_id,
          bctw_deployment_id: surveyDeployment.bctw_deployment_id
        });

        const badDeployment = {
          name: 'BCTW Data Error',
          message: 'No active deployments found for deployment ID, when one should exist.',
          data: {
            sims_deployment_id: surveyDeployment.deployment_id,
            bctw_deployment_id: surveyDeployment.bctw_deployment_id
          }
        };

        // Don't continue processing this deployment
        return res.status(200).json({ deployment: null, bad_deployment: badDeployment });
      }

      const surveyDeploymentWithBctwData = {
        // BCTW properties
        assignment_id: matchingBctwDeployments[0].assignment_id,
        collar_id: matchingBctwDeployments[0].collar_id,
        attachment_start_date: matchingBctwDeployments[0].attachment_start
          ? dayjs(matchingBctwDeployments[0].attachment_start).format('YYYY-MM-DD')
          : null,
        attachment_start_time: matchingBctwDeployments[0].attachment_start
          ? dayjs(matchingBctwDeployments[0].attachment_start).format('HH:mm:ss')
          : null,
        attachment_end_date: matchingBctwDeployments[0].attachment_end
          ? dayjs(matchingBctwDeployments[0].attachment_end).format('YYYY-MM-DD')
          : null,
        attachment_end_time: matchingBctwDeployments[0].attachment_end
          ? dayjs(matchingBctwDeployments[0].attachment_end).format('HH:mm:ss')
          : null,
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

      return res.status(200).json({ deployment: surveyDeploymentWithBctwData, bad_deployment: null });
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
        schema: {
          title: 'Deploy device request object',
          type: 'object',
          additionalProperties: false,
          required: [
            'critter_id',
            'device_id',
            'attachment_end_date',
            'attachment_end_time',
            'device_make',
            'device_model',
            'frequency',
            'frequency_unit',
            'critterbase_start_capture_id',
            'critterbase_end_capture_id',
            'critterbase_end_mortality_id'
          ],
          properties: {
            critter_id: {
              type: 'integer',
              minimum: 1
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
            },
            device_id: {
              type: 'integer',
              minimum: 1
            },
            device_make: {
              type: 'number',
              nullable: true
            },
            device_model: {
              type: 'string',
              nullable: true
            },
            frequency: {
              type: 'number'
            },
            frequency_unit: {
              type: 'number',
              nullable: true
            },
            critterbase_start_capture_id: {
              type: 'string',
              description: 'Critterbase capture record when the deployment started',
              format: 'uuid',
              nullable: true
            },
            critterbase_end_capture_id: {
              type: 'string',
              description: 'Critterbase capture record when the deployment ended',
              format: 'uuid',
              nullable: true
            },
            critterbase_end_mortality_id: {
              type: 'string',
              description: 'Critterbase mortality record when the deployment ended',
              format: 'uuid',
              nullable: true
            }
          }
        }
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
      attachment_end_date,
      attachment_end_time,
      // device_id, // Do not allow the device_id to be updated
      device_make,
      device_model,
      frequency,
      frequency_unit,
      critterbase_start_capture_id,
      critterbase_end_capture_id,
      critterbase_end_mortality_id
    } = req.body;

    try {
      await connection.open();

      // Update the deployment in SIMS
      const deploymentService = new DeploymentService(connection);
      const bctw_deployment_id = await deploymentService.updateDeployment({
        deployment_id: deploymentId,
        critter_id: critter_id,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      });

      // TODO: Decide whether to explicitly record attachment start date, or just reference the capture. Might remove this line.
      const critterbaseService = new CritterbaseService(getCritterbaseUser(req));
      const capture = await critterbaseService.getCaptureById(critterbase_start_capture_id);

      // Create attachment end date from provided end date (if not null) and end time (if not null).
      const attachmentEnd = attachment_end_date
        ? attachment_end_time
          ? dayjs(`${attachment_end_date} ${attachment_end_time}`).toISOString()
          : dayjs(`${attachment_end_date}`).toISOString()
        : null;

      // Update the deployment (collar_animal_assignment) in BCTW
      const bctwDeploymentService = new BctwDeploymentService(getBctwUser(req));
      // Returns an array though we only expect one record
      const bctwDeploymentRecords = await bctwDeploymentService.updateDeployment({
        deployment_id: bctw_deployment_id,
        attachment_start: capture.capture_date,
        attachment_end: attachmentEnd // TODO: ADD SEPARATE DATE AND TIME TO BCTW
      });

      // Update the collar details in BCTW
      const bctwDeviceService = new BctwDeviceService(getBctwUser(req));
      await bctwDeviceService.updateCollar({
        collar_id: bctwDeploymentRecords[0].collar_id,
        device_make: device_make,
        device_model: device_model,
        frequency: frequency,
        frequency_unit: frequency_unit
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
