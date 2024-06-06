import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { paginationRequestQueryParamSchema } from '../../../../../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { TechniqueService } from '../../../../../../services/technique-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/technique/index');

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
  createTechniques()
];

POST.apiDoc = {
  description: 'Insert new survey technique.',
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
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['techniques'],
          additionalProperties: false,
          properties: {
            techniques: {
              type: 'array',
              items: {
                type: 'object',
                required: [
                  'name',
                  'description',
                  'method_lookup_id',
                  'distance_threshold',
                  'attractants',
                  'attributes'
                ],
                additionalProperties: false,
                properties: {
                  name: {
                    type: 'string',
                    description: 'Name of the technique.'
                  },
                  description: {
                    type: 'string',
                    description: 'Description of the technique.'
                  },
                  method_lookup_id: {
                    type: 'integer',
                    description: 'The ID of a known method type.',
                    minimum: 1
                  },
                  distance_threshold: {
                    type: 'number',
                    description: 'Maximum detection distance (meters).',
                    nullable: true
                  },
                  attractants: {
                    type: 'array',
                    description: 'Attractants used to lure species during the technique.',
                    items: {
                      type: 'object',
                      required: ['attractant_lookup_id'],
                      additionalProperties: false,
                      properties: {
                        attractant_lookup_id: {
                          type: 'integer',
                          description: 'The ID of a known attractant type.'
                        }
                      }
                    }
                  },
                  attributes: {
                    type: 'object',
                    description: 'Attributes of the technique.',
                    required: ['qualitative_attributes', 'quantitative_attributes'],
                    additionalProperties: false,
                    properties: {
                      qualitative_attributes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: [
                            'method_technique_attribute_qualitative_id',
                            'method_lookup_attribute_qualitative_option_id'
                          ],
                          additionalProperties: false,
                          properties: {
                            method_technique_attribute_qualitative_id: {
                              type: 'string',
                              format: 'uuid',
                              description: 'The ID of a known qualitative attribute.'
                            },
                            method_lookup_attribute_qualitative_option_id: {
                              type: 'string',
                              format: 'uuid',
                              description: 'The ID of a known qualitative attribute option.'
                            }
                          }
                        }
                      },
                      quantitative_attributes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['method_technique_attribute_quantitative_id', 'value'],
                          additionalProperties: false,
                          properties: {
                            method_technique_attribute_quantitative_id: {
                              type: 'string',
                              format: 'uuid',
                              description: 'The ID of a known quantitative attribute.'
                            },
                            value: {
                              type: 'number',
                              description: 'The value of the quantitative attribute.'
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
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Technique created OK.'
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

export function createTechniques(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);

      const techniqueService = new TechniqueService(connection);

      const promises = [];

      console.log(req.body.techniques);

      // Insert techniques
      const techniques = await techniqueService.insertTechniquesForSurvey(surveyId, req.body.techniques);

      // Insert attractants for each technique
      techniques.map((technique) =>
        promises.push(
          techniqueService.insertTechniqueAttractants(
            technique.method_technique_id,
            technique.attractants.map((id) => id.attractant_lookup_id),
            surveyId
          )
        )
      );

      // Insert technique attributes

      await connection.commit();

      return res.status(200).send(techniques);
    } catch (error) {
      defaultLog.error({ label: 'insertTechniques', message: 'error', error });
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
  getTechniques()
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
            additionalProperties: false,
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
                    'method_technique_id',
                    'attractants',
                    'qualitative_attributes',
                    'quantitative_attributes'
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
                        // additionalProperties: false,
                        properties: {
                          attractant_lookup_id: {
                            type: 'number',
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
                        required: ['attractant_lookup_id', 'method_lookup_attribute_qualitative_option_id'],
                        additionalProperties: false,
                        properties: {
                          method_technique_attribute_qualitative_id: {
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
                        required: ['method_lookup_attribute_quantitative_id', 'value'],
                        additionalProperties: false,
                        properties: {
                          method_technique_attribute_quantitative_id: {
                            type: 'string',
                            description: 'Foreign key reference to a quantitative attribute lookup value.'
                          },
                          value: {
                            type: 'number',
                            description: 'Value of the attribute'
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
export function getTechniques(): RequestHandler {
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

      console.log(techniques);

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
