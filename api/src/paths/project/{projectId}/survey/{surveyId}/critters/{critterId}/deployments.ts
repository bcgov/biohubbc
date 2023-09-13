import { AxiosError } from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { v4 } from 'uuid';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { BctwService } from '../../../../../../../services/bctw-service';
import { ICritterbaseUser } from '../../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters');
export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          projectId: Number(req.params.projectId),
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
    'Creates a new critter in critterbase, and if successful, adds the a link to the critter_id under this survey.',
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
    description: 'Critterbase bulk creation request object',
    content: {
      'application/json': {
        schema: {
          title: 'Deploy device request object',
          type: 'object',
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
    200: {
      description: 'Responds with count of rows created in SIMS DB Deployments.',
      content: {
        'application/json': {
          schema: {
            title: 'Number of rows affected',
            type: 'number'
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

export function deployDevice(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const surveyId = Number(req.params.critterId);
    const connection = getDBConnection(req['keycloak_token']);
    const surveyCritterService = new SurveyCritterService(connection);
    const bctw = new BctwService(user);
    try {
      await connection.open();
      const override_deployment_id = v4();
      req.body.deployment_id = override_deployment_id;
      const surveyEntry = await surveyCritterService.addDeployment(surveyId, req.body.deployment_id);
      await bctw.deployDevice(req.body);
      await connection.commit();
      return res.status(200).json(surveyEntry);
    } catch (error) {
      defaultLog.error({ label: 'addDeployment', message: 'error', error });
      console.log(JSON.stringify((error as Error).message));
      await connection.rollback();
      return res.status(500).json((error as AxiosError).response);
    } finally {
      connection.release();
    }
  };
}
