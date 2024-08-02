import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP500 } from '../../../../../../errors/http-error';
import { critterSchema } from '../../../../../../openapi/schemas/critter';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { CritterbaseService, ICritter, ICritterbaseUser } from '../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters');

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
  addCritterToSurvey()
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
  getCrittersFromSurvey()
];

GET.apiDoc = {
  description: 'Get all critters under this survey.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer'
      },
      required: true
    },
    {
      in: 'query',
      name: 'format',
      schema: {
        type: 'string',
        enum: ['detailed']
      }
    }
  ],
  responses: {
    200: {
      description: 'Responds with critters under this survey.',
      content: {
        'application/json': {
          schema: {
            title: 'Array of critters in survey.',
            type: 'array',
            items: critterSchema
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

POST.apiDoc = {
  description:
    'Creates a new critter in CritterBase, and if successful, adds a corresponding SIMS critter record under this survey.',
  tags: ['critterbase'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Critterbase create critter request object',
    content: {
      'application/json': {
        schema: {
          title: 'Create critter request object',
          type: 'object',
          properties: {
            critter_id: {
              type: 'string',
              format: 'uuid'
            },
            animal_id: {
              type: 'string'
            },
            wlh_id: {
              type: 'string'
            },
            itis_tsn: {
              type: 'integer'
            },
            sex: {
              type: 'string'
            },
            critter_comment: {
              type: 'string'
            }
          },
          additionalProperties: false
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Responds with created critter.',
      content: {
        'application/json': {
          schema: {
            title: 'Response object for adding critter to survey',
            type: 'object',
            properties: {
              critter_id: {
                type: 'number',
                description: 'SIMS internal ID of the critter within the survey'
              },
              critterbase_crittter_id: {
                type: 'string',
                description: 'Critterbase ID of the critter'
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
 * Get all critters under this survey that have a corresponding Critterbase critter record.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getCrittersFromSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyService = new SurveyCritterService(connection);

      const surveyCritters = await surveyService.getCrittersInSurvey(surveyId);

      // Exit early if surveyCritters list is empty
      if (!surveyCritters.length) {
        return res.status(200).json([]);
      }

      const critterbaseCritterId = surveyCritters.map((critter) => String(critter.critterbase_critter_id));

      const critterbaseService = new CritterbaseService({
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      });

      // Fetch critters from the service based on the Critterbase critter ids
      const critterbaseCritters =
        req.query.format === 'detailed'
          ? await critterbaseService.getMultipleCrittersByIdsDetailed(critterbaseCritterId)
          : await critterbaseService.getMultipleCrittersByIds(critterbaseCritterId);

      // For each Critterbase critter record, find the corresponding survey critter record, and add the corresponding
      // survey critter ID to the Critterbase critter record.
      const mergedCritterbaseCritters: (ICritter & { survey_critter_id: number })[] = critterbaseCritters.map(
        (critterbaseCritter) => {
          const surveyCritter = surveyCritters.find(
            (surveyCritter) => surveyCritter.critterbase_critter_id === critterbaseCritter.critter_id
          );

          if (!surveyCritter) {
            throw new HTTP500('Failed to find survey critters');
          }

          return {
            ...critterbaseCritter,
            survey_critter_id: surveyCritter.critter_id
          };
        }
      );

      return res.status(200).json(mergedCritterbaseCritters);
    } catch (error) {
      defaultLog.error({ label: 'getCrittersFromSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export function addCritterToSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    let critterId = req.body.critter_id;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      const critterbaseService = new CritterbaseService(user);

      // If request does not include critter ID, create a new critter and use its critter ID
      let result = null;
      if (!critterId) {
        result = await critterbaseService.createCritter(req.body);
        critterId = result.critter_id;
      }

      const surveyService = new SurveyCritterService(connection);
      const response = await surveyService.addCritterToSurvey(surveyId, critterId);

      await connection.commit();
      return res.status(201).json({ critterbase_critter_id: critterId, critter_id: response });
    } catch (error) {
      defaultLog.error({ label: 'addCritterToSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
