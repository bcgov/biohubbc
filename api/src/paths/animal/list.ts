import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { paginationRequestQueryParamSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { CritterbaseService, ICritterbaseUser } from '../../services/critterbase-service';
import { SurveyCritterService } from '../../services/survey-critter-service';
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
  getAnimalList()
];

GET.apiDoc = {
  description: 'Gets a list of animals based on search parameters if passed in.',
  tags: ['animals'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [...paginationRequestQueryParamSchema],
  responses: {
    200: {
      description: 'Responds with critters under this survey.',
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
 * Get all animals (potentially based on filter criteria).
 *
 * @returns {RequestHandler}
 */
export function getAnimalList(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getAnimalList' });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: req['system_user']?.user_guid,
        username: req['system_user']?.user_identifier
      };

      const isUserAdmin = userHasValidRole(
        [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR],
        req['system_user']['role_names']
      );
      const systemUserId = connection.systemUserId();
      //   const filterFields: IAnimalAdvancedFilters = {
      //     itis_tsns: req.query.itis_tsns ? String(req.query.itis_tsns).split(',').map(Number) : undefined
      //   };

      // Find all critters that user has access to
      const surveyService = new SurveyCritterService(connection);

      const surveyCritters = await surveyService.getCrittersByUserId(isUserAdmin, systemUserId);

      // Request all critters from critterbase
      const cb = new CritterbaseService(user);

      const critters = await cb.getMultipleCrittersByIdsDetailed(
        surveyCritters.map((critter) => critter.critterbase_critter_id)
      );

      await connection.commit();

      return res.status(200).json(critters);
    } catch (error) {
      defaultLog.error({ label: 'getAnimalList', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}
