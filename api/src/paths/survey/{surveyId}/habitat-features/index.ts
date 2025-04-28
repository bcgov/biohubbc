import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../../../openapi/schemas/pagination';
import {
  InsertHabitatFeatureSchema,
  SurveyHabitatFeaturesSupplementaryDataSchema,
  SurveyHabitatFeaturesWithTaxonsSchema
} from '../../../../openapi/schemas/survey-habitat-feature';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';

import { InsertSurveyHabitatFeature } from '../../../../repositories/habitat-feature-repository/survey-habitat-feature-repository.interface';
import { SurveyHabitatFeatureService } from '../../../../services/habitat-feature-services/survey-habitat-feature-service';
import { getLogger } from '../../../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../../../utils/pagination';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/habitat-features');

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
  postSurveyHabitatFeatures()
];

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
  getSurveyHabitatFeatures()
];

POST.apiDoc = {
  description: 'Insert habitat features for the survey.',
  tags: ['habitat-feature'],
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
    description: 'Create survey habitat feature records request data',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            surveyHabitatFeatures: {
              description: 'Survey habitat feature records.',
              type: 'array',
              items: InsertHabitatFeatureSchema,
              minItems: 1
            }
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Create OK'
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

GET.apiDoc = {
  description: 'Get paginated survey habitat feature records for a survey.',
  tags: ['habitat-feature'],
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
      description: 'Survey habitat features get response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['surveyHabitatFeatures', 'supplementaryData', 'pagination'],
            properties: {
              surveyHabitatFeatures: SurveyHabitatFeaturesWithTaxonsSchema,
              supplementaryData: SurveyHabitatFeaturesSupplementaryDataSchema,
              pagination: paginationResponseSchema
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
 * Creates new survey habitat feature records for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function postSurveyHabitatFeatures(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'postSurveyHabitatFeatures', surveyId });

    const insertSurveyHabitatFeatureObjects: InsertSurveyHabitatFeature[] = req.body.surveyHabitatFeatures;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyHabitatFeatureService = new SurveyHabitatFeatureService(connection);

      await surveyHabitatFeatureService.insertSurveyHabitatFeatures(surveyId, insertSurveyHabitatFeatureObjects);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'postSurveyHabitatFeatures', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Get paginated survey habitat feature records for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyHabitatFeatures(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'getSurveyHabitatFeatures', surveyId });

    const paginationOptions = makePaginationOptionsFromRequest(req);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyHabitatFeatureService = new SurveyHabitatFeatureService(connection);

      const surveyHabitatFeaturesResponse =
        await surveyHabitatFeatureService.getSurveyHabitatFeaturesWithSupplementaryData(
          surveyId,
          ensureCompletePaginationOptions(paginationOptions)
        );

      await connection.commit();

      const response = {
        surveyHabitatFeatures: surveyHabitatFeaturesResponse.surveyHabitatFeatures,
        supplementaryData: surveyHabitatFeaturesResponse.supplementaryData,
        pagination: makePaginationResponse(surveyHabitatFeaturesResponse.supplementaryData.count, paginationOptions)
      };

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyHabitatFeatures', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
