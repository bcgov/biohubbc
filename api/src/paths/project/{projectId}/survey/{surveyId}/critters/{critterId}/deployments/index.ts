import dayjs from 'dayjs';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { v4 } from 'uuid';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { postDeploymentSchema } from '../../../../../../../../openapi/schemas/deployment';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../../../services/bctw-service/bctw-deployment-service';
import { getBctwUser } from '../../../../../../../../services/bctw-service/bctw-service';
import { CritterbaseService } from '../../../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../../../services/deployment-service';
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
  createDeployment()
];

POST.apiDoc = {
  description:
    'Creates a deployment in SIMS and BCTW. Upserts a collar in BCTW and inserts a new deployment of the resulting collar_id.',
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
        type: 'integer',
        minimum: 1
      }
    },
    {
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'integer',
        minimum: 1
      }
    }
  ],
  requestBody: {
    description: 'Object with device information and associated captures to create a deployment',
    content: {
      'application/json': {
        schema: postDeploymentSchema
      }
    }
  },
  responses: {
    201: {
      description: 'Responds with the created BCTW deployment uuid.',
      content: {
        'application/json': {
          schema: {
            title: 'Deployment response object',
            type: 'object',
            additionalProperties: false,
            properties: {
              deploymentId: {
                type: 'string',
                format: 'uuid',
                description: 'The generated deployment Id, indicating that the deployment was succesfully created.'
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

export function createDeployment(): RequestHandler {
  return async (req, res) => {
    const surveyCritterId = Number(req.params.critterId);

    // Create deployment Id for joining SIMS and BCTW deployment information
    const newDeploymentId = v4();

    const {
      critterbase_start_capture_id,
      critterbase_end_capture_id,
      critterbase_end_mortality_id,
      attachment_end_date,
      attachment_end_time,
      ...bctwRequestObject
    } = req.body;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const user = getBctwUser(req);

      const bctwService = new BctwDeploymentService(user);
      const deploymentService = new DeploymentService(connection);
      const critterbaseService = new CritterbaseService(user);

      await deploymentService.insertDeployment({
        critter_id: surveyCritterId,
        bctw_deployment_id: newDeploymentId,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      });

      // Retrieve the capture to get the capture date for BCTW
      const capture = await critterbaseService.getCaptureById(critterbase_start_capture_id);

      const deployment = await bctwService.createDeployment({
        ...bctwRequestObject,
        attachment_start: capture.capture_date,
        attachment_end: dayjs(`${attachment_end_date} ${attachment_end_time}`), // TODO: ADD SEPARATE DATE AND TIME TO BCTW
        deployment_id: newDeploymentId,
        critter_id: capture.critter_id
      });

      await connection.commit();

      return res.status(201).json({ deploymentId: deployment.deployment_id });
    } catch (error) {
      defaultLog.error({ label: 'createDeployment', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
