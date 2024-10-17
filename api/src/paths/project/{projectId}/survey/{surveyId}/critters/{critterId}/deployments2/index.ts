import dayjs from 'dayjs';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../../../services/bctw-service/bctw-deployment-service';
import { BctwService, getBctwUser } from '../../../../../../../../services/bctw-service/bctw-service';
import { CritterbaseService } from '../../../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../../../services/deployment-services/deployment-service';
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
  description: 'Creates a new deployment.',
  tags: ['deployment', 'critterbase'],
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
    }
  ],
  requestBody: {
    description: 'Object with device information and associated captures to create a deployment',
    content: {
      'application/json': {
        schema: {
          title: 'Deploy device request object',
          type: 'object',
          additionalProperties: false,
          required: [
            'device_id',
            'frequency',
            'frequency_unit',
            'device_make',
            'device_model',
            'critterbase_start_capture_id',
            'critterbase_end_capture_id',
            'critterbase_end_mortality_id',
            'attachment_end_date',
            'attachment_end_time'
          ],
          properties: {
            device_id: {
              type: 'integer',
              description: 'The ID of the device.',
              minimum: 1
            },
            frequency: {
              type: 'integer',
              description: 'The frequency of the device.',
              minimum: 1,
              nullable: true
            },
            frequency_unit: {
              type: 'integer',
              description: 'The ID of a frequency unit code.',
              minimum: 1,
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
      description: 'Deployment created OK.'
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
    const surveyId = Number(req.params.surveyId);
    const critterId = Number(req.params.critterId);

    const {
      device_id,
      frequency,
      frequency_unit,
      attachment_end_date,
      attachment_end_time,
      critterbase_start_capture_id,
      critterbase_end_capture_id,
      critterbase_end_mortality_id
    } = req.body;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const user = getBctwUser(req);

      const bctwService = new BctwService(user);
      const bctwDeploymentService = new BctwDeploymentService(user);
      const deploymentService = new DeploymentService(connection);
      const critterbaseService = new CritterbaseService(user);

      await deploymentService.createDeployment({
        critter_id: surveyCritterId,
        bctw_deployment_id: newDeploymentId,
        critterbase_start_capture_id,
        critterbase_end_capture_id,
        critterbase_end_mortality_id
      });

      // Retrieve the capture to get the capture date for BCTW
      const critterbaseCritter = await critterbaseService.getCaptureById(critterbase_start_capture_id);

      // Create attachment end date from provided end date (if not null) and end time (if not null).
      const attachmentEnd = attachment_end_date
        ? attachment_end_time
          ? dayjs(`${attachment_end_date} ${attachment_end_time}`).toISOString()
          : dayjs(`${attachment_end_date}`).toISOString()
        : null;

      // Get BCTW code values
      const [deviceMakeCodes, frequencyUnitCodes] = await Promise.all([
        bctwService.getCode('device_make'),
        bctwService.getCode('frequency_unit')
      ]);
      // The BCTW API expects the device make and frequency unit as codes, not IDs.
      const device_make_code = deviceMakeCodes.find((code) => code.id === device_make)?.code;
      const frequency_unit_code = frequencyUnitCodes.find((code) => code.id === frequency_unit)?.code;

      const deployment = await bctwDeploymentService.createDeployment({
        deployment_id: newDeploymentId,
        device_id: device_id,
        critter_id: critterbaseCritter.critter_id,
        frequency: frequency,
        frequency_unit: frequency_unit_code,
        device_make: device_make_code,
        device_model: device_model,
        attachment_start: critterbaseCritter.capture_date,
        attachment_end: attachmentEnd // TODO: ADD SEPARATE DATE AND TIME TO BCTW
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
