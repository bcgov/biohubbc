import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../constants/roles';
import { getDBConnection } from '../../../../database/db';
import { critterSchema } from '../../../../openapi/schemas/critter';
import { authorizeRequestHandler } from '../../../../request-handlers/security/authorization';
import { SurveyCritterService } from '../../../../services/survey-critter-service';
import { getLogger } from '../../../../utils/logger';

const defaultLog = getLogger('paths/survey/{surveyId}/critters');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR],
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
  addCritterToSurvey()
];

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
  tags: ['survey', 'critterbase'],
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
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Critterbase create critter request object',
    required: true,
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
            sex_qualitative_option_id: {
              type: 'string',
              format: 'uuid',
              nullable: true
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
              critterbase_critter_id: {
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

      const critterIds = surveyCritters.map((critter) => String(critter.critterbase_critter_id));

      const critterbaseCritters = await surveyService.critterbaseService.getMultipleCrittersByIds(critterIds);

      await connection.commit();

      const response = [];

      // For all SIMS critters
      for (const surveyCritter of surveyCritters) {
        // Find the corresponding Critterbase critter
        const critterbaseCritter = critterbaseCritters.find(
          (critter) => critter.critter_id === surveyCritter.critterbase_critter_id
        );

        if (!critterbaseCritter) {
          // SIMS critter exists but Critterbase critter does not. As Critterbase is the source of truth for critter
          // data, we should not return this critter, which SIMS cannot properly represent.
          continue;
        }

        response.push({
          // SIMS properties
          critter_id: surveyCritter.critter_id,
          critterbase_critter_id: surveyCritter.critterbase_critter_id,
          // Critterbase properties
          wlh_id: critterbaseCritter.wlh_id,
          animal_id: critterbaseCritter.animal_id,
          sex: critterbaseCritter.sex,
          itis_tsn: critterbaseCritter.itis_tsn,
          itis_scientific_name: critterbaseCritter.itis_scientific_name,
          critter_comment: critterbaseCritter.critter_comment
        });
      }

      return res.status(200).json(response);
    } catch (error) {
      defaultLog.error({ label: 'getCrittersFromSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Adds a critter to a survey in SIMS. Will create a new critter in Critterbase if critter_id is not provided.
 *
 * @export
 * @returns {*} {RequestHandler}
 */
export function addCritterToSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    let critterbaseCritterId: string = req.body.critter_id;
    let surveyCritterId: number | null = null;

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const surveyCritterService = new SurveyCritterService(connection);

      if (critterbaseCritterId) {
        // If Critterbase critter_id is provided, add the critter to the survey
        const surveyCritterIds = await surveyCritterService.addCrittersToSurvey(surveyId, [critterbaseCritterId]);

        surveyCritterId = surveyCritterIds[0];
      } else {
        // If Critterbase critter_id is not provided, create a new critter in Critterbase and add it to the survey
        const critterIdentifiers = await surveyCritterService.createCritterAndAddToSurvey(surveyId, {
          wlh_id: req.body.wlh_id,
          animal_id: req.body.animal_id,
          sex_qualitative_option_id: req.body.sex_qualitative_option_id,
          itis_tsn: req.body.itis_tsn,
          critter_comment: req.body.critter_comment
        });

        critterbaseCritterId = critterIdentifiers.critterbaseCritterId;
        surveyCritterId = critterIdentifiers.surveyCritterId;
      }

      await connection.commit();
      return res.status(201).json({ critterbase_critter_id: critterbaseCritterId, critter_id: surveyCritterId });
    } catch (error) {
      defaultLog.error({ label: 'addCritterToSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
