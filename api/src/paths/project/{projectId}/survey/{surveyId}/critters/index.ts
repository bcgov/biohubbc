import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { critterSchema } from '../../../../../../openapi/schemas/critter';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../../../../../services/critterbase-service';
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
            title: 'Array of critters in survey',
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
              survey_critter_id: {
                type: 'number',
                description: 'SIMS internal ID of the critter within the survey'
              },
              critter_id: {
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

export function getCrittersFromSurvey(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req['keycloak_token']);

    const surveyService = new SurveyCritterService(connection);
    const critterbaseService = new CritterbaseService(user);
    try {
      await connection.open();
      const surveyCritters = await surveyService.getCrittersInSurvey(surveyId);

      // Exit early if surveyCritters list is empty
      if (!surveyCritters.length) {
        return res.status(200).json([]);
      }

      const critterIds = surveyCritters.map((critter) => String(critter.critterbase_critter_id));

      // Fetch critters from the service based on critterIds
      const result =
        req.query.format === 'detailed'
          ? await critterbaseService.getMultipleCrittersByIdsDetailed(critterIds)
          : await critterbaseService.getMultipleCrittersByIds(critterIds);

      // Create a map to associate critter_id with critter object
      const critterMap = new Map();
      for (const critter of result) {
        critterMap.set(critter.critter_id, critter);
      }

      // Update critter objects with survey_critter_id from surveyCritters
      for (const surveyCritter of surveyCritters) {
        const critterId = surveyCritter.critterbase_critter_id;
        if (critterMap.has(critterId)) {
          critterMap.get(critterId).survey_critter_id = surveyCritter.critter_id;
        }
      }

      // Convert map values back to an array and send as JSON response
      const updatedCritters = [...critterMap.values()];
      return res.status(200).json(updatedCritters);
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
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    const surveyId = Number(req.params.surveyId);
    let critterId = req.body.critter_id;

    const connection = getDBConnection(req['keycloak_token']);
    const surveyService = new SurveyCritterService(connection);
    const cb = new CritterbaseService(user);

    try {
      await connection.open();

      // If request does not include critter ID, create a new critter and use its critter ID
      let result = null;
      if (!critterId) {
        result = await cb.createCritter(req.body);
        critterId = result.critter_id;
      }

      const response = await surveyService.addCritterToSurvey(surveyId, critterId);

      await connection.commit();
      return res.status(201).json({ critterbase_critter_id: critterId, survey_critter_id: response });
    } catch (error) {
      defaultLog.error({ label: 'addCritterToSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
