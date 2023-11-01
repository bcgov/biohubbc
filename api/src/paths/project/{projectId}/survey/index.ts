import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { SurveyService } from '../../../../services/survey-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/index');

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
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectPermission'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveys()
];

GET.apiDoc = {
  description: 'Fetches a subset of survey fields for all surveys under a project.',
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
    }
  ],
  responses: {
    200: {
      description: 'Survey list response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              required: ['surveyData', 'surveySupplementaryData'],
              properties: {
                surveyData: {
                  type: 'object',
                  required: ['survey_id', 'name', 'start_date', 'end_date', 'focal_species', 'focal_species_names'],
                  properties: {
                    survey_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    name: {
                      type: 'string',
                      maxLength: 300
                    },
                    start_date: {
                      type: 'string',
                      format: 'date',
                      description: 'ISO 8601 date string'
                    },
                    end_date: {
                      type: 'string',
                      format: 'date',
                      description: 'ISO 8601 date string',
                      nullable: true
                    },
                    focal_species: {
                      type: 'array',
                      items: {
                        type: 'integer'
                      }
                    },
                    focal_species_names: {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    }
                  }
                },
                surveySupplementaryData: {
                  type: 'object',
                  required: ['publishStatus'],
                  properties: {
                    publishStatus: {
                      type: 'string',
                      enum: ['NO_DATA', 'UNSUBMITTED', 'SUBMITTED']
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
      $ref: '#/components/responses/401'
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
 * Get a subset of survey fields for all surveys under a project.
 *
 * @returns {RequestHandler}
 */
export function getSurveys(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const surveyService = new SurveyService(connection);

      const surveys = await surveyService.getSurveysBasicFieldsByProjectId(Number(req.params.projectId));

      const response = await Promise.all(
        surveys.map(async (survey) => {
          const surveyPublishStatus = await surveyService.surveyPublishStatus(survey.survey_id);

          return {
            surveyData: survey,
            surveySupplementaryData: { publishStatus: surveyPublishStatus }
          };
        })
      );

      await connection.commit();

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
