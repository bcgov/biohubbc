import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
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
            'frequency_unit_id',
            'attachment_start_date',
            'attachment_start_time',
            'attachment_end_date',
            'attachment_end_time',
            'critterbase_start_capture_id',
            'critterbase_end_capture_id',
            'critterbase_end_mortality_id'
          ],
          properties: {
            device_id: {
              type: 'integer',
              description: 'The ID of the device.',
              minimum: 1
            },
            frequency: {
              type: 'integer',
              description:
                'The frequency of the device. Property "frequency_unit_id" must also be provided if this is provided.',
              minimum: 1,
              nullable: true
            },
            frequency_unit_id: {
              type: 'integer',
              description:
                'The ID of a frequency unit code. Property "frequency" must also be provided if this is provided.',
              minimum: 1,
              nullable: true
            },
            attachment_start_date: {
              type: 'string',
              description: 'Start date of the deployment (without time component).'
            },
            attachment_start_time: {
              type: 'string',
              description: 'Start time of the deployment.',
              nullable: true
            },
            attachment_end_date: {
              type: 'string',
              description: 'End date of the deployment (without time component).',
              nullable: true
            },
            attachment_end_time: {
              type: 'string',
              description: 'End time of the deployment.',
              nullable: true
            },
            critterbase_start_capture_id: {
              type: 'string',
              description:
                'Critterbase capture event. The capture event during which the device was attached to the animal.',
              format: 'uuid'
            },
            critterbase_end_capture_id: {
              type: 'string',
              description:
                'Critterbase capture event. The capture event during which the device was removed from the animal. Only one of critterbase_end_capture_id or critterbase_end_mortality_id can be provided.',
              format: 'uuid',
              nullable: true
            },
            critterbase_end_mortality_id: {
              type: 'string',
              description:
                'Critterbase mortality event. The mortality event during which the device was removed from the animal. Only one of critterbase_end_capture_id or critterbase_end_mortality_id can be provided.',
              format: 'uuid',
              nullable: true
            }
          },
          oneOf: [
            {
              // Both frequency and frequency_unit_id are required if either is present
              properties: {
                frequency: {
                  type: 'number',
                  nullable: false
                },
                frequency_unit_id: {
                  type: 'integer',
                  nullable: false
                }
              },
              required: ['frequency', 'frequency_unit_id']
            },
            {
              // Frequency and frequency_unit_id are both optional if neither is present
              properties: {
                frequency: {
                  type: 'number',
                  nullable: true
                },
                frequency_unit_id: {
                  type: 'integer',
                  nullable: true
                }
              },
              required: ['frequency', 'frequency_unit_id']
            }
          ],
          anyOf: [
            {
              // Either critterbase_end_capture_id or critterbase_end_mortality_id is required
              properties: {
                critterbase_end_capture_id: {
                  type: 'string',
                  format: 'uuid',
                  nullable: true
                },
                critterbase_end_mortality_id: {
                  type: 'string',
                  format: 'uuid',
                  nullable: false
                }
              },
              required: ['critterbase_end_capture_id', 'critterbase_end_mortality_id']
            },
            {
              // Either critterbase_end_capture_id or critterbase_end_mortality_id is required
              properties: {
                critterbase_end_capture_id: {
                  type: 'string',
                  format: 'uuid',
                  nullable: false
                },
                critterbase_end_mortality_id: {
                  type: 'string',
                  format: 'uuid',
                  nullable: true
                }
              },
              required: ['critterbase_end_capture_id', 'critterbase_end_mortality_id']
            }
          ]
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

    const deviceId = Number(req.body.device_id);
    const frequency = Number(req.body.frequency);
    const frequencyUnitId = Number(req.body.frequency_unit_id);
    const attachmentStartDate = req.body.attachment_start_date;
    const attachmentStartTime = req.body.attachment_start_time;
    const attachmentEndDate = req.body.attachment_end_date;
    const attachmentEndTime = req.body.attachment_end_time;
    const critterbaseStartCaptureId = req.body.critterbase_start_capture_id;
    const critterbaseEndCaptureId = req.body.critterbase_end_capture_id;
    const critterbaseEndMortalityId = req.body.critterbase_end_mortality_id;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const deploymentService = new DeploymentService(connection);

      // TODO - verify that the incoming 'critterbase...Id' values exist and are associated to the critter_id.

      await deploymentService.createDeployment({
        survey_id: surveyId,
        critter_id: critterId,
        device_id: deviceId,
        frequency: frequency,
        frequency_unit_id: frequencyUnitId,
        attachment_start_date: attachmentStartDate,
        attachment_start_time: attachmentStartTime,
        attachment_end_date: attachmentEndDate,
        attachment_end_time: attachmentEndTime,
        critterbase_start_capture_id: critterbaseStartCaptureId,
        critterbase_end_capture_id: critterbaseEndCaptureId,
        critterbase_end_mortality_id: critterbaseEndMortalityId
      });

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'createDeployment', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
