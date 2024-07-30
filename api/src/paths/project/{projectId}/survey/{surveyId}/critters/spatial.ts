import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { ICaptureGeometry, IMortalityGeometry } from '../../../../../../models/animal-view';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { CritterbaseService } from '../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/critters/spatial');

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
  getCritterGeometry()
];

GET.apiDoc = {
  description: 'Get all observations for the survey.',
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
        type: 'number',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Geometry of animal captures and mortalities',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            nullable: true,
            required: ['captures', 'mortalities'],
            properties: {
              captures: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['capture_id', 'geometry'],
                  properties: {
                    capture_id: {
                      type: 'string'
                    },
                    geometry: {
                      type: 'object'
                    }
                  }
                }
              },
              mortalities: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['mortality_id', 'geometry'],
                  properties: {
                    mortality_id: {
                      type: 'string'
                    },
                    geometry: {
                      type: 'object'
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
 * Fetch geometry of all captures and mortalities for critters in Survey
 *
 * @TODO This endpoint is not currently used in the SIMS frontend. Remove?
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getCritterGeometry(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    defaultLog.debug({ label: 'getCritterGeometry', surveyId });

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyService = new SurveyCritterService(connection);

      const surveyCritters = await surveyService.getCrittersInSurvey(surveyId);

      const critterbaseService = new CritterbaseService({
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      });

      const critters = await critterbaseService.getMultipleCrittersByIdsDetailed(
        surveyCritters.map((critter) => critter.critterbase_critter_id)
      );

      // Exit early if there are no critters
      if (critters.length < 1) {
        return res.status(200).json({ captures: [], mortalities: [] });
      }

      const captures: ICaptureGeometry[] = [];

      // Map over all captures to extract geometry as points
      for (const critter of critters) {
        for (const capture of critter.captures) {
          if (capture.capture_location && capture.capture_id) {
            captures.push({
              capture_id: capture.capture_id,
              geometry: {
                type: 'Point',
                coordinates: [capture.capture_location.latitude, capture.capture_location.longitude]
              }
            });
          }
        }
      }

      const mortalities: IMortalityGeometry[] = [];

      // Map over all mortalities to extract geometry as points
      for (const critter of critters) {
        const mortality = critter.mortality;
        if (mortality.mortality_location && mortality.mortality_id) {
          mortalities.push({
            mortality_id: mortality.mortality_id,
            geometry: {
              type: 'Point',
              coordinates: [mortality.mortality_location.latitude, mortality.mortality_location.longitude]
            }
          });
        }
      }

      return res.status(200).json({ captures, mortalities });
    } catch (error) {
      defaultLog.error({ label: 'getCritterGeometry', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
