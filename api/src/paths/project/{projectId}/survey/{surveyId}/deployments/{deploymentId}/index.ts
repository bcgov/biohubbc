import { AxiosError } from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { getDeploymentSchema, postDeploymentSchema } from '../../../../../../../openapi/schemas/deployment';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../../services/bctw-service/bctw-deployment-service';
import { CritterbaseService, ICritterbaseUser } from '../../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../../services/deployment-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/deployments/{deploymentId}');

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
  description: 'Returns information about a specific deployment',
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
        type: 'integer'
      },
      required: true
    },
    {
      in: 'path',
      name: 'deploymentId',
      schema: {
        type: 'integer'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Responds with information about a deployment',
      content: {
        'application/json': {
          schema: getDeploymentSchema
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

export function getDeploymentById(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    const deploymentId = Number(req.params.deploymentId);

    const connection = getDBConnection(req['keycloak_token']);

    const deploymentService = new DeploymentService(connection);
    const bctwDeploymentService = new BctwDeploymentService(user);

    try {
      await connection.open();

      // Fetch deployments from the deployment service for the given surveyId
      const surveyDeployment = await deploymentService.getDeploymentById(deploymentId);

      // Return early if there are no deployments
      if (!surveyDeployment) {
        // TODO: 400 error instead?
        return res.status(200).json({});
      }

      // Fetch additional deployment details from BCTW service
      const bctwDeployments = await bctwDeploymentService.getDeploymentsByIds([surveyDeployment.bctw_deployment_id]);

      // Merge survey and BCTW deployment information
      // Bctw might return multiple records for a deployment Id, so use reduce
      const result = bctwDeployments.reduce((acc, bctwDeployment) => {
        return {
          ...acc,
          assignment_id: bctwDeployment.assignment_id,
          collar_id: bctwDeployment.collar_id,
          critter_id: surveyDeployment.critter_id,
          critterbase_critter_id: surveyDeployment?.critterbase_critter_id,
          attachment_start: bctwDeployment.attachment_start,
          attachment_end: bctwDeployment.attachment_end,
          deployment_id: surveyDeployment?.deployment_id,
          device_id: bctwDeployment.device_id,
          bctw_deployment_id: surveyDeployment?.bctw_deployment_id,
          critterbase_start_capture_id: surveyDeployment?.critterbase_start_capture_id,
          critterbase_end_capture_id: surveyDeployment?.critterbase_end_capture_id,
          critterbase_end_mortality_id: surveyDeployment?.critterbase_end_mortality_id
        };
      }, {});

      return res.status(200).json(result);
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
      }
    },
    {
      in: 'path',
      name: 'deploymentId',
      description: 'Integer deployment Id in SIMS',
      schema: {
        type: 'integer'
      }
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

    const deploymentId = Number(req.params.deploymentId);

    const connection = getDBConnection(req['keycloak_token']);

    const bctwDeploymentService = new BctwDeploymentService(user);
    const deploymentService = new DeploymentService(connection);
    const critterbaseService = new CritterbaseService(user);

    const {
      deployment_id,
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

      // Update the deployment in SIMS
      const bctw_deployment_id = await deploymentService.updateDeployment(deploymentId, {
        critter_id: critter_id,
        bctw_deployment_id: bctwRequestObject.bctw_deployment_id,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      });

      console.log(bctw_deployment_id);

      // TODO: Decide whether to explicitly record attachment start date, or just reference the capture. Might remove this line.
      const capture = await critterbaseService.getCaptureById(critterbase_start_capture_id);

      // Update the deployment in BCTW, which works by soft deleting and inserting a new deployment record (hence createDeployment)
      await bctwDeploymentService.updateDeployment({
        ...bctwRequestObject,
        attachment_start: capture.capture_date,
        attachment_end: attachment_end_date, // TODO: ADD SEPARATE DATE AND TIME TO BCTW
        // Include the critter guid, taken from the capture for convenience
        critter_id: capture.critter_id,
        deployment_id: bctw_deployment_id
      });

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
      name: 'deploymentId',
      schema: {
        type: 'integer',
        minimum: 1
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

    const deploymentId = Number(req.params.deploymentId);
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req['keycloak_token']);

    const bctwDeploymentService = new BctwDeploymentService(user);
    const deploymentService = new DeploymentService(connection);

    try {
      await connection.open();

      const { bctw_deployment_id } = await deploymentService.endDeployment(surveyId, deploymentId);

      await bctwDeploymentService.deleteDeployment(bctw_deployment_id);

      await connection.commit();
      return res.status(200).json({ message: 'Succesfully deleted deployment.' });
    } catch (error) {
      defaultLog.error({ label: 'deleteDeployment', message: 'error', error });
      await connection.rollback();

      return res.status(500).json((error as AxiosError).response);
    } finally {
      connection.release();
    }
  };
}
