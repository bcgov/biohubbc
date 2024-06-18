import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IAnimalAdvancedFilters } from '../../models/animal-view';
import { paginationRequestQueryParamSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { CritterbaseService, ICritter, ICritterbaseUser } from '../../services/critterbase-service';
import { SurveyCritterService } from '../../services/survey-critter-service';
import { getLogger } from '../../utils/logger';
import { ensureCompletePaginationOptions, makePaginationOptionsFromRequest } from '../../utils/pagination';

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
  description: "Gets a list of animals based on the user's permissions and search criteria.",
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
            type: 'array',
            items: {
              type: 'object',
              required: [
                'survey_critter_id',
                'critter_id',
                'wlh_id',
                'animal_id',
                'sex',
                'itis_tsn',
                'itis_scientific_name',
                'critter_comment'
              ],
              additionalProperties: false,
              properties: {
                survey_critter_id: {
                  type: 'number',
                  minimum: 1
                },
                critter_id: {
                  type: 'string',
                  format: 'uuid'
                },
                wlh_id: {
                  type: 'string'
                },
                animal_id: {
                  type: 'string'
                },
                sex: {
                  type: 'string'
                },
                itis_tsn: {
                  type: 'number'
                },
                itis_scientific_name: {
                  type: 'string'
                },
                critter_comment: {
                  type: 'string'
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
 * Get animals for the current user, based on their permissions and search criteria.
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

      const user: ICritterbaseUser = {
        keycloak_guid: req['system_user']?.user_guid,
        username: req['system_user']?.user_identifier
      };

      const filterFields = parseQueryParams(req);

      const paginationOptions = makePaginationOptionsFromRequest(req);

      const surveyService = new SurveyCritterService(connection);

      const surveyCritters = await surveyService.findCritters(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      await connection.commit();

      // Request all critters from critterbase
      const critterbaseService = new CritterbaseService(user);

      // TODO: Should be detailed critter, not critter
      const critters: ICritter[] = await critterbaseService.getMultipleCrittersByIdsDetailed(
        surveyCritters.map((critter) => critter.critterbase_critter_id)
      );

      const crittersWithCritterSurveyId = critters.map((critter) => ({
        ...critter,
        survey_critter_id: surveyCritters.find(
          (surveyCritter) => surveyCritter.critterbase_critter_id === critter.critter_id
        )?.critter_id
      }));

      // Allow browsers to cache this response for 30 seconds
      res.setHeader('Cache-Control', 'private, max-age=30');

      return res.status(200).json(crittersWithCritterSurveyId);
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
    start_date: req.query.start_date ?? undefined,
    end_date: req.query.end_date ?? undefined,
    system_user_id: req.query.system_user_id ?? undefined
  };
}
