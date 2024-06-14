import { Request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { ITelemetryAdvancedFilters } from '../../models/telemetry-view';
import { paginationRequestQueryParamSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler, userHasValidRole } from '../../request-handlers/security/authorization';
import { BctwService } from '../../services/bctw-service';
import { CritterbaseService, ICritter, ICritterbaseUser } from '../../services/critterbase-service';
import { SurveyCritterService } from '../../services/survey-critter-service';
import { setCacheControl } from '../../utils/api-utils';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('paths/telemetry');

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
  getTelemetry()
];

GET.apiDoc = {
  description: "Gets a list of telemetry based on the user's permissions and search criteria.",
  tags: ['telemetry'],
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
      name: 'project_programs',
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
      name: 'keyword',
      required: false,
      schema: {
        type: 'string',
        nullable: true
      }
    },
    {
      in: 'query',
      name: 'project_name',
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
      description: 'Telemetry response object.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              telemetry: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    telemetry_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    deployment_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    collar_transaction_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    critter_id: {
                      type: 'string',
                      format: 'uuid'
                    },
                    deviceid: {
                      type: 'number'
                    },
                    latitude: {
                      type: 'number',
                      nullable: true
                    },
                    longitude: {
                      type: 'number',
                      nullable: true
                    },
                    elevation: {
                      type: 'number',
                      nullable: true
                    },
                    vendor: {
                      type: 'string',
                      nullable: true
                    },
                    acquisition_date: {
                      type: 'string',
                      nullable: true
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
 * Get telemetry for the current user, based on their permissions and search criteria.
 *
 * @returns {RequestHandler}
 */
export function getTelemetry(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getTelemetry' });

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

      const surveyCritterService = new SurveyCritterService(connection);
      const bctwService = new BctwService(user);
      const critterbaseService = new CritterbaseService(user);

      // Find all critters that the user has access to
      const surveyCritters = await surveyCritterService.getCrittersByUserId(isUserAdmin, systemUserId);

      await connection.commit();

      // Exit early if there are no critters, and therefore no telemetry
      if (!surveyCritters.length) {
        return res.status(200).json({ telemetry: [] });
      }

      // Get details for all critters
      const critters: ICritter[] = await critterbaseService.getMultipleCrittersByIdsDetailed(
        surveyCritters.map((critter) => critter.critterbase_critter_id)
      );

      // Get deployments for critters in Survey
      const results = await bctwService.getDeploymentsByCritterId(
        surveyCritters.flatMap((critter) => critter.critterbase_critter_id)
      );

      // Combine deployments with critter information
      const deployments = results.flatMap((result) => ({
        deployment_id: result.deployment_id,
        device_id: result.device_id,
        animal: critters.find((critter) => result.critter_id === critter.critter_id)
      }));

      // Get telemetry for deployments
      const deploymentIds = deployments.map((deployment) => deployment.deployment_id);
      const vendor = await bctwService.getVendorTelemetryByDeploymentIds(deploymentIds);
      const manual = await bctwService.getManualTelemetryByDeploymentIds(deploymentIds);

      // Combine telemetry with critter information
      const telemetry = [
        ...vendor.map((telemetry) => {
          const deployment = deployments.find((deployment) => deployment.animal);
          return {
            ...telemetry,
            device_id: deployment?.device_id,
            animal: deployment?.animal
          };
        }),
        ...manual.map((telemetry) => {
          const deployment = deployments.find((deployment) => deployment.animal);
          return {
            ...telemetry,
            device_id: deployment?.device_id,
            animal: deployment?.animal
          };
        })
      ];

      setCacheControl(res, 30);

      return res.status(200).json({ telemetry: telemetry });
    } catch (error) {
      defaultLog.error({ label: 'getTelemetry', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

function parseQueryParams(req: Request): ITelemetryAdvancedFilters {
  return {
    itis_tsns: req.query.itis_tsns ? String(req.query.itis_tsns).split(',').map(Number) : undefined
  };
}
