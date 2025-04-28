import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_PERMISSION, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { SurveyHabitatFeatureService } from '../../../../services/habitat-feature-services/survey-habitat-feature-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/habitat-features/delete');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [SURVEY_PERMISSION.COORDINATOR, SURVEY_PERMISSION.COLLABORATOR],
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
  deleteSurveyHabitatFeatures()
];

POST.apiDoc = {
  description: 'Delete existing survey habitat feature records, for a survey.',
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
    description: 'Survey habitat feature record IDs to delete',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['surveyHabitatFeatureIds'],
          properties: {
            surveyHabitatFeatureIds: {
              description: 'An array of survey habitat feature record IDs to delete',
              type: 'array',
              items: {
                type: 'integer',
                minimum: 1
              },
              minItems: 1
            }
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Delete OK'
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
 * Delete existing survey habitat feature records, for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function deleteSurveyHabitatFeatures(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const surveyHabitatFeatureIds: number[] = req.body.surveyHabitatFeatureIds;

    defaultLog.debug({ label: 'deleteSurveyHabitatFeatures', surveyId, surveyHabitatFeatureIds });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyHabitatFeatureService = new SurveyHabitatFeatureService(connection);

      await surveyHabitatFeatureService.deleteSurveyHabitatFeatures(surveyId, surveyHabitatFeatureIds);

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveyHabitatFeatures', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
