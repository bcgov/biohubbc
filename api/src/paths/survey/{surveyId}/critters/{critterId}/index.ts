import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { CritterAttachmentService } from '../../../../../services/critter-attachment-service';
import { CritterbaseService, ICritterbaseUser } from '../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters/{critterId}');

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
  updateSurveyCritter()
];

PATCH.apiDoc = {
  description: 'Patches a SIMS survey critter in critterbase.',
  tags: ['critterbase'],
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
        type: 'number'
      },
      required: true
    },
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
    }
  ],
  requestBody: {
    description: 'Critterbase bulk patch request object',
    required: true,
    content: {
      'application/json': {
        schema: {
          title: 'Create critter request object',
          type: 'object',
          required: ['critter_id', 'animal_id', 'wlh_id', 'sex_qualitative_option_id', 'critter_comment'],
          additionalProperties: false,
          properties: {
            critter_id: {
              type: 'string',
              format: 'uuid'
            },
            animal_id: {
              type: 'string'
            },
            wlh_id: {
              type: 'string',
              nullable: true
            },
            itis_tsn: {
              type: 'integer',
              minimum: 0
            },
            sex_qualitative_option_id: {
              type: 'string',
              format: 'uuid',
              nullable: true
            },
            critter_comment: {
              type: 'string',
              nullable: true
            }
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Critter updated successfully.'
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

export function updateSurveyCritter(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const simsCritterId = Number(req.params.critterId);
    const critterbaseCritterId: string = req.body.critter_id;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyService = new SurveyCritterService(connection);

      await surveyService.updateCritter(surveyId, simsCritterId, {
        critter_id: critterbaseCritterId,
        animal_id: req.body.animal_id,
        wlh_id: req.body.wlh_id,
        sex_qualitative_option_id: req.body.sex_qualitative_option_id,
        critter_comment: req.body.critter_comment
      });

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'updateSurveyCritter', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

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
  getSurveyCritter()
];

GET.apiDoc = {
  description: 'Gets a specific critter by its integer Critter Id',
  tags: ['animal', 'critterbase'],
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
    },
    {
      in: 'query',
      name: 'expand',
      description: 'List of related resources to include in the response.',
      schema: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['attachments']
        }
      },
      required: false
    }
  ],
  responses: {
    200: {
      description: 'Responds with a critter',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['critter_id', 'critterbase_critter_id', 'survey_id'],
            additionalProperties: true, // Allow additional properties while critterbase portion of response is not defined
            properties: {
              critterbase_critter_id: {
                type: 'string',
                format: 'uuid'
              },
              critter_id: {
                type: 'integer',
                minimum: 1
              },
              survey_id: {
                type: 'integer',
                minimum: 1
              },
              attachments: {
                type: 'object',
                description:
                  'Attachments associated with the critter. Only included if requested via the expand query parameter.',
                required: ['capture_attachments'],
                properties: {
                  capture_attachments: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['attachment_id', 'attachment_type', 'attachment_url'],
                      additionalProperties: false,
                      properties: {
                        attachment_id: {
                          type: 'integer',
                          minimum: 1
                        },
                        attachment_type: {
                          type: 'string',
                          enum: ['photo', 'video']
                        },
                        attachment_url: {
                          type: 'string',
                          format: 'uri'
                        }
                      }
                    }
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
    500: {
      $ref: '#/components/responses/500'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function getSurveyCritter(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const critterId = Number(req.params.critterId);
    const expand = (req.query.expand as string[]) ?? [];

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      const surveyService = new SurveyCritterService(connection);
      const critterAttachmentService = new CritterAttachmentService(connection);
      const critterbaseService = new CritterbaseService(user);

      const surveyCritter = await surveyService.getCritterById(surveyId, critterId);

      if (!surveyCritter) {
        throw new HTTP400(`Critter with id ${critterId} not found.`);
      }

      const getAttachmentsPromise = expand.includes('attachments')
        ? critterAttachmentService.findAllCritterAttachments(surveyCritter.critter_id).then((response) => {
            return {
              attachments: {
                capture_attachments: response.captureAttachments
                // TODO: add mortality attachments
              }
            };
          })
        : Promise.resolve({});

      // Get the attachments from SIMS table and the Critter from critterbase
      const [attachments, critterbaseCritter] = await Promise.all([
        getAttachmentsPromise,
        critterbaseService.getCritter(surveyCritter.critterbase_critter_id)
      ]);

      await connection.commit();

      if (!critterbaseCritter || critterbaseCritter.length === 0) {
        throw new HTTP400(`Critterbase critter with id ${surveyCritter.critterbase_critter_id} not found.`);
      }

      const response = {
        ...attachments,
        ...critterbaseCritter,
        ...surveyCritter
      };

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyCritter', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
