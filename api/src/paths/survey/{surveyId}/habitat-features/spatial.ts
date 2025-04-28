import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { GeoJSONPoint } from '../../../../openapi/schemas/geoJson';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { SurveyHabitatFeatureService } from '../../../../services/habitat-feature-services/survey-habitat-feature-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/habitat-features/spatial');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR, SURVEY_ROLE.VIEWER],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveyHabitatFeaturesGeometry()
];

GET.apiDoc = {
  description: 'Get habitat feature spatial data, for a survey.',
  tags: ['habitat-features'],
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
      description: 'Survey habitat features spatial response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            nullable: true,
            required: ['surveyHabitatFeaturesGeometry', 'supplementaryData'],
            properties: {
              surveyHabitatFeaturesGeometry: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['survey_habitat_feature_id', 'geometry'],
                  properties: {
                    survey_habitat_feature_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    geometry: GeoJSONPoint
                  }
                }
              },
              supplementaryData: {
                type: 'object',
                additionalProperties: false,
                required: ['count'],
                properties: {
                  count: {
                    description: 'The total count of survey habitat features for the survey.',
                    type: 'integer',
                    minimum: 0
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
 * Get habitat feature spatial data, for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyHabitatFeaturesGeometry(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'getSurveyHabitatFeaturesGeometry', surveyId });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyHabitatFeatureService = new SurveyHabitatFeatureService(connection);

      const response = await surveyHabitatFeatureService.getSurveyHabitatFeaturesGeometry(surveyId);

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyHabitatFeaturesGeometry', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
