import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { v4 } from 'uuid';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { BctwService } from '../../../../../../../../services/bctw-service';
import { ICritterbaseUser } from '../../../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../../../../utils/logger';
const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters/{critterId}/deployments');
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
  deployDevice()
];

POST.apiDoc = {
  description:
    'Deploys a device, creating a record of the insertion in the SIMS deployment table. Will also upsert a collar in BCTW as well as insert a new deployment under the resultant collar_id.',
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
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'number'
      }
    }
  ],
  requestBody: {
    description: 'Specifies a critter, device, and timespan to complete deployment.',
    content: {
      'application/json': {
        schema: {
          title: 'Deploy device request object',
          type: 'object',
          additionalProperties: false,
          properties: {
            critter_id: {
              type: 'string',
              format: 'uuid'
            },
            attachment_start: {
              type: 'string'
            },
            attachment_end: {
              type: 'string'
            },
            device_id: {
              type: 'integer'
            },
            frequency: {
              type: 'number'
            },
            frequency_unit: {
              type: 'string'
            },
            device_make: {
              type: 'string'
            },
            device_model: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Responds with count of rows created in SIMS DB Deployments.',
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
  description:
    'Allows you to update the deployment timespan for a device. Effectively ends a deployment if the attachment end is filled in, but should not delete anything.',
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
              type: 'string',
              format: 'uuid'
            },
            attachment_start: {
              type: 'string'
            },
            attachment_end: {
              type: 'string',
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

export function deployDevice(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req.system_user?.user_guid,
      username: req.system_user?.user_identifier
    };

    const critterId = Number(req.params.critterId);
    const newDeploymentId = v4(); // New deployment ID
    const newDeploymentDevice = {
      ...req.body,
      deploymentId: newDeploymentId
    };

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyCritterService = new SurveyCritterService(connection);
      await surveyCritterService.upsertDeployment(critterId, newDeploymentId);

      const bctwService = new BctwService(user);
      await bctwService.deployDevice(newDeploymentDevice);

      await connection.commit();
      return res.status(201).json({ message: 'Deployment created.' });
    } catch (error) {
      defaultLog.error({ label: 'addDeployment', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}

export function updateDeployment(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req.system_user?.user_guid,
      username: req.system_user?.user_identifier
    };
    const critterId = Number(req.params.critterId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyCritterService = new SurveyCritterService(connection);
      const bctw = new BctwService(user);

      await surveyCritterService.upsertDeployment(critterId, req.body.deployment_id);
      await bctw.updateDeployment(req.body);
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
