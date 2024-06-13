import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/http-error';
import { paginationRequestQueryParamSchema } from '../../../../../../openapi/schemas/pagination';
import { techniqueDetailsSchema, techniqueViewSchema } from '../../../../../../openapi/schemas/technique';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { AttractantService } from '../../../../../../services/attractants-service';
import { TechniqueAttributeService } from '../../../../../../services/technique-attributes-service';
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
              items: techniqueDetailsSchema
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

/**
 * Create one or more Survey techniques
 *
 * @returns
 */
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
      const attractantsService = new AttractantService(connection);
      const techniqueAttributeService = new TechniqueAttributeService(connection);

      const promises = [];

      // Create the technique
      const techniques = await techniqueService.insertTechniquesForSurvey(surveyId, req.body.techniques);

      // Insert additional technique information
      for (const technique of techniques) {
        const { attractants, attributes } = technique;

        // Insert attractants
        if (technique.attractants.length) {
          promises.push(attractantsService.insertTechniqueAttractants(attractants, surveyId));
        }

        // Insert qualitative attributes
        if (technique.attributes.qualitative_attributes.length) {
          promises.push(
            techniqueAttributeService.insertQualitativeAttributesForTechnique(
              technique.method_technique_id,
              attributes.qualitative_attributes
            )
          );
        }

        // Insert quantitative attributes
        if (technique.attributes.quantitative_attributes.length) {
          promises.push(
            techniqueAttributeService.insertQuantitativeAttributesForTechnique(
              technique.method_technique_id,
              attributes.quantitative_attributes
            )
          );
        }
      }

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
                items: techniqueViewSchema
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

      const sampleSitesTotalCount = await techniqueService.getTechniquesCountForSurveyId(surveyId);

      console.log(techniques);

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
