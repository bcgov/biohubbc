import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { TelemetryDeploymentService } from '../../../../../../../services/telemetry-services/telemetry-deployment-service';
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
  description: 'Get a deployment.',
  tags: ['deployment'],
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
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Responds with information about a deployment.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['deployment'],
            additionalProperties: false,
            properties: {
              deployment: {
                title: 'Deployment',
                type: 'object',
                additionalProperties: false,
                required: [
                  'deployment2_id',
                  'survey_id',
                  'critter_id',
                  'device_id',
                  'frequency',
                  'frequency_unit_id',
                  'attachment_start_date',
                  'attachment_start_time',
                  'attachment_end_date',
                  'attachment_end_time',
                  'critterbase_start_capture_id',
                  'critterbase_end_capture_id',
                  'critterbase_end_mortality_id',
                  // device data
                  'device_make_id',
                  'model',
                  // critter data
                  'critterbase_critter_id'
                ],
                properties: {
                  deployment2_id: {
                    type: 'integer',
                    description: 'Id of the deployment in the Survey.'
                  },
                  survey_id: {
                    type: 'integer',
                    minimum: 1
                  },
                  critter_id: {
                    type: 'integer',
                    minimum: 1,
                    description: 'Id of the critter in the Survey'
                  },
                  device_id: {
                    type: 'integer',
                    description: 'Id of the device, as reported by users. Not unique.'
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
                    description: 'start date of the deployment.',
                    example: '2021-01-01'
                  },
                  attachment_start_time: {
                    type: 'string',
                    description: 'start time of the deployment.',
                    example: '12:00:00',
                    nullable: true
                  },
                  attachment_end_date: {
                    type: 'string',
                    description: 'End date of the deployment.',
                    example: '2021-01-01',
                    nullable: true
                  },
                  attachment_end_time: {
                    type: 'string',
                    description: 'End time of the deployment.',
                    example: '12:00:00',
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
                  },
                  // device data
                  device_make_id: {
                    type: 'integer',
                    minimum: 1,
                    nullable: true
                  },
                  model: {
                    type: 'string',
                    nullable: true
                  },
                  // critter data
                  critterbase_critter_id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Id of the critter in Critterbase.'
                  }
                }
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

/**
 * Gets a deployment.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getDeploymentById(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const deploymentId = Number(req.params.deploymentId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const deploymentService = new TelemetryDeploymentService(connection);

      const deployment = await deploymentService.getDeploymentById(surveyId, deploymentId);

      await connection.commit();

      return res.status(200).json({ deployment: deployment });
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
  description: 'Update a deployment.',
  tags: ['deployment'],
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
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Deployment data to update.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: [
            'critter_id',
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
            critter_id: {
              type: 'integer',
              minimum: 1
            },
            device_id: {
              type: 'integer',
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
              description: 'Start date of the deployment (without time component).',
              example: '2021-01-01'
            },
            attachment_start_time: {
              type: 'string',
              description: 'Start time of the deployment.',
              example: '12:00:00',
              nullable: true
            },
            attachment_end_date: {
              type: 'string',
              description: 'End date of the deployment (without time component).',
              example: '2021-01-01',
              nullable: true
            },
            attachment_end_time: {
              type: 'string',
              description: 'End time of the deployment.',
              example: '12:00:00',
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
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Deployment patched OK.'
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

/**
 * Updates a deployment.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function updateDeployment(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const deploymentId = Number(req.params.deploymentId);

    const critterId = req.body.critter_id;
    const deviceId = req.body.device_id;
    const frequency = req.body.frequency;
    const frequencyUnitId = req.body.frequency_unit_id;
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

      const deploymentService = new TelemetryDeploymentService(connection);

      await deploymentService.updateDeployment(surveyId, deploymentId, {
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
  description: 'Deletes a deployment.',
  tags: ['deployment'],
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

/**
 * Deletes a deployment.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function deleteDeployment(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const deploymentId = Number(req.params.deploymentId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const deploymentService = new TelemetryDeploymentService(connection);

      await deploymentService.deleteDeployment(surveyId, deploymentId);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteDeployment', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
