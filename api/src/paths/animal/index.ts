import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IAnimalAdvancedFilters } from '../../models/animal-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { SurveyCritterService } from '../../services/survey-critter-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';

const defaultLog = getLogger('paths/animal');

export const GET: Operation = [
  authorizeRequestHandler(() => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  findAnimals()
];

GET.apiDoc = {
  description: "Gets a list of animals based on the user's permissions and filter criteria.",
  tags: ['animals'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'query',
      name: 'keyword',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'itis_tsns',
      description: 'ITIS TSN numbers',
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'integer'
        },
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'itis_tsn',
      description: 'ITIS TSN number',
      required: false,
      schema: {
        type: 'integer',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'start_date',
      description: 'ISO 8601 datetime string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'end_date',
      description: 'ISO 8601 datetime string',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'system_user_id',
      required: false,
      schema: {
        type: 'number',
        minimum: 1,
        nullable: true
      }
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'Animal response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['animals', 'pagination'],
            additionalProperties: false,
            properties: {
              animals: {
                type: 'array',
                items: {
                  type: 'object',
                  required: [
                    'wlh_id',
                    'animal_id',
                    'sex',
                    'itis_tsn',
                    'itis_scientific_name',
                    'critter_comment',
                    'critter_id',
                    'survey_id',
                    'critterbase_critter_id'
                  ],
                  additionalProperties: false,
                  properties: {
                    wlh_id: {
                      type: 'string',
                      nullable: true,
                      description: 'The Critterbase critter wildlife health ID.'
                    },
                    animal_id: {
                      type: 'string',
                      description: 'The Critterbase critter animal ID.'
                    },
                    sex: {
                      type: 'string',
                      description: 'The Critterbase critter sex.'
                    },
                    itis_tsn: {
                      type: 'number',
                      description: 'The Critterbase critter ITIS TSN.'
                    },
                    itis_scientific_name: {
                      type: 'string',
                      description: 'The Critterbase critter scientific name.'
                    },
                    critter_comment: {
                      type: 'string',
                      description: 'The Critterbase critter comment.'
                    },
                    critter_id: {
                      type: 'integer',
                      minimum: 1,
                      description: 'The SIMS critter ID.'
                    },
                    survey_id: {
                      type: 'integer',
                      minimum: 1,
                      description: 'The SIMS survey ID.'
                    },
                    critterbase_critter_id: {
                      type: 'string',
                      format: 'uuid',
                      description: 'The Critterbase critter ID.'
                    }
                  }
                }
              },
              pagination: { ...paginationResponseSchema }
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
 * Get animals for the current user, based on their permissions and filter criteria.
 *
 * @returns {RequestHandler}
 */
export function findAnimals(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'findAnimals' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const systemUserId = connection.systemUserId();

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        req['system_user']['role_names']
      );

      const filterFields = parseQueryParams(req);

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const surveyService = new SurveyCritterService(connection);

      const [critters, crittersCount] = await Promise.all([
        surveyService.findCritters(
          isUserAdmin,
          systemUserId,
          filterFields,
          ensureCompletePaginationOptions(paginationOptions)
        ),
        surveyService.findCrittersCount(isUserAdmin, systemUserId, filterFields)
      ]);

      await connection.commit();

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res
        .status(200)
        .json({ animals: critters, pagination: makePaginationResponse(crittersCount, paginationOptions) });
    } catch (error) {
      defaultLog.error({ label: 'findAnimals', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Parse the query parameters from the request into the expected format.
 *
 * @param {Request<unknown, unknown, unknown, IAnimalAdvancedFilters>} req
 * @return {*}  {IAnimalAdvancedFilters}
 */
function parseQueryParams(req: Request<unknown, unknown, unknown, IAnimalAdvancedFilters>): IAnimalAdvancedFilters {
  return {
    keyword: req.query.keyword ?? undefined,
    itis_tsns: req.query.itis_tsns ?? undefined,
    itis_tsn: (req.query.itis_tsn && Number(req.query.itis_tsn)) ?? undefined,
    system_user_id: req.query.system_user_id ?? undefined
  };
}
