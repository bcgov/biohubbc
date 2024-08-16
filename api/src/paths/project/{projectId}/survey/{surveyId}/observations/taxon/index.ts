import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../../services/observation-service';
import { PlatformService } from '../../../../../../../services/platform-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/taxon');

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
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveyObservedSpecies()
];

GET.apiDoc = {
  description: 'Get observed species for a survey',
  tags: ['observation'],
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
      description: 'Survey observed species get response.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            description: 'Array of objects describing observed species in the survey',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                tsn: { type: 'number', description: 'The TSN of the observed species' },
                commonNames: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Common names of the observed species'
                },
                scientificName: { type: 'string', description: 'Scientific name of the observed species' }
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
 * Fetch species that were observed in the survey
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyObservedSpecies(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    defaultLog.debug({ label: 'getSurveyObservedSpecies', surveyId });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);
      const platformService = new PlatformService(connection);

      const observedSpecies = await observationService.getObservedSpeciesForSurvey(surveyId);

      const species = await platformService.getTaxonomyByTsns(observedSpecies.flatMap((species) => species.itis_tsn));

      const formattedResponse = species.map((taxon) => ({ ...taxon, tsn: Number(taxon.tsn) }));

      return res.status(200).json(formattedResponse);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyObservedSpecies', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
