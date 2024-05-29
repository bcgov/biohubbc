import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { paginationRequestQueryParamSchema } from '../../../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { TechniqueService } from '../../../../../../services/technique-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/technique');

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
  getSurveyTechniques()
];

GET.apiDoc = {
  description: 'Get all survey techniques.',
  tags: ['technique'],
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
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'List of survey techniques.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['techniques', 'count'],
            properties: {
              techniques: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'name',
                    'description',
                    'distance_threshold',
                    'method_lookup_id',
                    'attractants',
                    'quantitative_attributes',
                    'qualitative_attributes'
                  ],
                  properties: {
                    method_technique_id: {
                      type: 'integer',
                      description: 'Identifier of the technique.'
                    },
                    name: {
                      type: 'string',
                      description: 'Name of the technique.'
                    },
                    description: {
                      type: 'string',
                      description: 'Description of the technique.',
                      nullable: true
                    },
                    distance_threshold: {
                      type: 'number',
                      description: 'Distance over which data were not measured.',
                      nullable: true
                    },
                    method_lookup_id: {
                      type: 'integer',
                      description: 'Foreign key reference to a method lookup value.'
                    },
                    attractants: {
                      type: 'array',
                      description: 'Attractants used to lure species.',
                      items: {
                        type: 'object',
                        properties: {
                          attractant_lookup_id: {
                            type: 'string',
                            description: 'Foreign key reference to a attractant lookup value.'
                          }
                        }
                      }
                    },
                    qualitative_attributes: {
                      type: 'array',
                      description: 'Qualitative attributes describing the technique.',
                      items: {
                        type: 'object',
                        properties: {
                          attractant_lookup_id: {
                            type: 'string',
                            description: 'Foreign key reference to a qualitative attribute lookup value.'
                          }
                        }
                      }
                    },
                    quantitative_attributes: {
                      type: 'array',
                      description: 'Quantitative attributes describing the technique.',
                      items: {
                        type: 'object',
                        properties: {
                          attractant_lookup_id: {
                            type: 'string',
                            description: 'Foreign key reference to a quantitative attribute lookup value.'
                          }
                        }
                      }
                    }
                  }
                }
              },
              count: {
                type: 'number',
                description: 'Count of method techniques in the respective survey.'
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

/**
 * Get all survey techniques.
 *
 * @returns {RequestHandler}
 */
export function getSurveyTechniques(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);

      const techniqueService = new TechniqueService(connection);
      const techniques = await techniqueService.getTechniquesForSurveyId(surveyId);

      const sampleSitesTotalCount = await techniqueService.getTechniquesCountForSurveyId(surveyId);

      await connection.commit();

      return res.status(200).json({
        techniques,
        count: sampleSitesTotalCount
      });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyTechniques', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
