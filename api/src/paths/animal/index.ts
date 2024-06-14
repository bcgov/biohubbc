import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IAnimalAdvancedFilters } from '../../models/animal-view';
import { paginationRequestQueryParamSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { CritterbaseService, ICritter, ICritterbaseUser } from '../../services/critterbase-service';
import { SurveyCritterService } from '../../services/survey-critter-service';
import { setCacheControl } from '../../utils/api-utils';
import { getLogger } from '../../utils/logger';

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
  getAnimals()
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
      name: 'start_date',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'end_date',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
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
      required: false,
      schema: {
        type: 'array',
        items: {
          type: 'integer'
        }
      }
    },
    ...paginationRequestQueryParamSchema
  ],
  responses: {
    200: {
      description: 'animal response object.',
      content: {
        'application/json': {
          schema: {
            title: 'Bulk creation response object',
            type: 'array',
            items: {
              title: 'Default critter response',
              type: 'object'
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
export function getAnimals(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getAnimals' });

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

      // Find all critters that user has access to
      const surveyService = new SurveyCritterService(connection);

      const surveyCritters = await surveyService.getCrittersByUserId(isUserAdmin, systemUserId);

      await connection.commit();

      // Request all critters from critterbase
      const critterbaseService = new CritterbaseService(user);

      // TODO: SHOULD BE DETAILED CRITTER, NOT CRITTER
      const critters: ICritter[] = await critterbaseService.getMultipleCrittersByIdsDetailed(
        surveyCritters.map((critter) => critter.critterbase_critter_id)
      );

      const crittersWithCritterSurveyId = critters.map((critter) => ({
        ...critter,
        survey_critter_id: surveyCritters.find(
          (surveyCritter) => surveyCritter.critterbase_critter_id === critter.critter_id
        )?.critter_id
      }));

      setCacheControl(res, 30);

      return res.status(200).json(crittersWithCritterSurveyId);
    } catch (error) {
      defaultLog.error({ label: 'getAnimals', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

function parseQueryParams(req: Request): IAnimalAdvancedFilters {
  return {
    itis_tsns: req.query.itis_tsns ? String(req.query.itis_tsns).split(',').map(Number) : undefined
  };
}
