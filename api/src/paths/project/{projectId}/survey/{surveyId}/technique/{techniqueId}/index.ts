import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { ITechniquePostData } from '../../../../../../../repositories/technique-repository';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { AttractantService } from '../../../../../../../services/attractants-service';
import { TechniqueAttributeService } from '../../../../../../../services/technique-attributes-service';
import { TechniqueService } from '../../../../../../../services/technique-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/technique/{techniqueId}/index');

export const DELETE: Operation = [
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
  deleteTechnique()
];

DELETE.apiDoc = {
  description: 'Delete a technique from a Survey.',
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
    {
      in: 'path',
      name: 'techniqueId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Boolean true value representing successful deletion.',
      content: {
        'application/json': {
          schema: {
            title: 'Technique delete response',
            type: 'boolean'
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
 * Delete a technique from a Survey
 *
 * @returns {RequestHandler}
 */
export function deleteTechnique(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }

    if (!req.params.techniqueId) {
      throw new HTTP400('Missing required param `techniqueId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const techniqueId = Number(req.params.techniqueId);
      const surveyId = Number(req.params.surveyId);

      const techniqueService = new TechniqueService(connection);

      // Delete the technique
      const method_technique_id = await techniqueService.deleteTechnique(surveyId, techniqueId);

      await connection.commit();

      return res.status(200).json(Boolean(method_technique_id));
    } catch (error) {
      defaultLog.error({ label: 'getSurveyTechniques', message: 'error', error });
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
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR],
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
  updateTechnique()
];

PUT.apiDoc = {
  description: 'Update a technique',
  tags: ['project', 'survey'],
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
      name: 'techniqueId',
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
          additionalProperties: false,
          required: ['technique'],
          properties: {
            technique: {
              type: 'object',
              required: ['name', 'description', 'method_lookup_id', 'distance_threshold', 'attractants', 'attributes'],
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
                      method_technique_attractant_id: {
                        type: 'integer',
                        description: 'Primary key for the attractant.',
                        nullable: true
                      },
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
                          'method_lookup_attribute_qualitative_id',
                          'method_lookup_attribute_qualitative_option_id'
                        ],
                        additionalProperties: false,
                        properties: {
                          method_technique_attribute_qualitative_id: {
                            type: 'integer',
                            description: 'Primary key of the attribute.',
                            nullable: true
                          },
                          method_lookup_attribute_qualitative_id: {
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
                        required: [
                          'method_technique_attribute_quantitative_id',
                          'method_lookup_attribute_quantitative_id',
                          'value'
                        ],
                        additionalProperties: false,
                        properties: {
                          method_technique_attribute_quantitative_id: {
                            type: 'integer',
                            description: 'Primary key of the attribute.',
                            nullable: true
                          },
                          method_lookup_attribute_quantitative_id: {
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
  },
  responses: {
    201: {
      description: 'Sample site added OK.'
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

export function updateTechnique(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.techniqueId) {
      throw new HTTP400('Missing required path param `techniqueId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const techniqueService = new TechniqueService(connection);
      const attractantsService = new AttractantService(connection);
      const techniqueAttributeService = new TechniqueAttributeService(connection);

      const surveyId = Number(req.params.surveyId);
      const techniqueId = Number(req.params.techniqueId);

      const technique: ITechniquePostData = req.body.technique;

      const { attributes, attractants, ...techniqueRow } = technique;

      // Update the technique table
      await techniqueService.updateTechnique(surveyId, techniqueId, techniqueRow);

      const promises = [];

      // Update attractants
      promises.push(attractantsService.updateTechniqueAttractants(techniqueId, attractants, surveyId));

      // Update qualitative attributes. This step deletes attributes and inserts new attributes.
      promises.push(
        techniqueAttributeService.updateDeleteQualitativeAttributesForTechnique(
          surveyId,
          techniqueId,
          attributes.qualitative_attributes
        )
      );

      // Update quantitative attributes. This step deletes attributes and inserts new attributes.
      promises.push(
        techniqueAttributeService.updateDeleteQuantitativeAttributesForTechnique(
          surveyId,
          techniqueId,
          attributes.quantitative_attributes
        )
      );

      await Promise.all(promises);

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'updateTechnique', message: 'error', error });
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
  getTechniqueById()
];

GET.apiDoc = {
  description: 'Get a technique by ID.',
  tags: ['survey'],
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
  responses: {
    200: {
      description: 'A survey sample site',
      content: {
        'application/json': {
          schema: {
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
                  additionalProperties: false,
                  required: ['method_technique_attractant_id', 'attractant_lookup_id'],
                  properties: {
                    method_technique_attractant_id: {
                      type: 'number',
                      description: 'Primary key of the attractant'
                    },
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
                  required: [
                    'method_technique_attribute_qualitative_id',
                    'method_lookup_attribute_qualitative_id',
                    'method_lookup_attribute_qualitative_option_id'
                  ],
                  additionalProperties: false,
                  properties: {
                    method_technique_attribute_qualitative_id: {
                      type: 'number',
                      description: 'Primary key identifying the attribute.'
                    },
                    method_lookup_attribute_qualitative_id: {
                      type: 'string',
                      description: 'Foreign key reference to a qualitative attribute lookup value.'
                    },
                    method_lookup_attribute_qualitative_option_id: {
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
                  required: [
                    'method_technique_attribute_quantitative_id',
                    'method_lookup_attribute_quantitative_id',
                    'value'
                  ],
                  additionalProperties: false,
                  properties: {
                    method_technique_attribute_quantitative_id: {
                      type: 'number',
                      description: 'Primary key identifying the attribute.'
                    },
                    method_lookup_attribute_quantitative_id: {
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
 * Get a single survey sample site by Id
 *
 * @returns {RequestHandler}
 */
export function getTechniqueById(): RequestHandler {
  return async (req, res) => {
    if (!req.params.surveyId) {
      throw new HTTP400('Missing required param `surveyId`');
    }
    if (!req.params.techniqueId) {
      throw new HTTP400('Missing required param `techniqueId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyId = Number(req.params.surveyId);
      const techniqueId = Number(req.params.techniqueId);

      const techniqueService = new TechniqueService(connection);
      const sampleSite = await techniqueService.getTechniqueById(surveyId, techniqueId);

      await connection.commit();

      return res.status(200).json(sampleSite);
    } catch (error) {
      defaultLog.error({ label: 'getTechniqueById', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
