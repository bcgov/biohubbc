import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection } from '../../database/db';
import { IDeploymentAdvancedFilters } from '../../models/deployment-view';
import { paginationRequestQueryParamSchema, paginationResponseSchema } from '../../openapi/schemas/pagination';
import { authorizeRequestHandler } from '../../request-handlers/security/authorization';
import { TelemetryDeploymentService } from '../../services/telemetry-services/telemetry-deployment-service';
import { getLogger } from '../../utils/logger';
import {
  ensureCompletePaginationOptions,
  makePaginationOptionsFromRequest,
  makePaginationResponse
} from '../../utils/pagination';

const defaultLog = getLogger('paths/deployments');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          discriminator: 'SystemUser'
        }
      ]
    };
  }),
  findDeployments()
];

GET.apiDoc = {
  description:
    'Gets all deployments that are available to the user, based on their permissions and provided filter criteria.',
  tags: ['deployment'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    ...paginationRequestQueryParamSchema,
    {
      in: 'query',
      name: 'keyword',
      schema: {
        type: 'string'
      }
    },
    {
      in: 'query',
      name: 'itis_tsn',
      schema: {
        type: 'integer'
      }
    },
    {
      in: 'query',
      name: 'start_date',
      schema: {
        type: 'string',
        format: 'date'
      }
    },
    {
      in: 'query',
      name: 'end_date',
      schema: {
        type: 'string',
        format: 'date'
      }
    },
    {
      in: 'query',
      name: 'start_time',
      schema: {
        type: 'string'
      }
    },
    {
      in: 'query',
      name: 'end_time',
      schema: {
        type: 'string'
      }
    },
    {
      in: 'query',
      name: 'system_user_id',
      schema: {
        type: 'integer'
      }
    },
    {
      in: 'query',
      name: 'device_serial',
      schema: {
        type: 'string'
      }
    },
    {
      in: 'query',
      name: 'species',
      schema: {
        type: 'integer'
      }
    },
    {
      in: 'query',
      name: 'animal_alias',
      schema: {
        type: 'string'
      }
    }
  ],
  responses: {
    200: {
      description: 'Responds with all deployments that are available to the user.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              deployments: {
                title: 'Deployments',
                type: 'array',
                items: {
                  title: 'Deployment',
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    // deployment data
                    'deployment_id',
                    'survey_id',
                    'critter_id',
                    'device_id',
                    'device_key',
                    'frequency',
                    'frequency_unit_id',
                    'attachment_start_date',
                    'attachment_start_time',
                    'attachment_start_timestamp',
                    'attachment_end_date',
                    'attachment_end_time',
                    'attachment_end_timestamp',
                    'critterbase_start_capture_id',
                    'critterbase_end_capture_id',
                    'critterbase_end_mortality_id',
                    // device data
                    'serial',
                    'device_make_id',
                    'model',
                    // critter data
                    'critterbase_critter_id'
                  ],
                  properties: {
                    deployment_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    survey_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    critter_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    device_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    device_key: {
                      type: 'string'
                    },
                    frequency: {
                      type: 'number',
                      nullable: true
                    },
                    frequency_unit_id: {
                      type: 'integer',
                      nullable: true
                    },
                    attachment_start_date: {
                      type: 'string',
                      format: 'date'
                    },
                    attachment_start_time: {
                      type: 'string',
                      nullable: true
                    },
                    attachment_start_timestamp: {
                      type: 'string',
                      format: 'date-time'
                    },
                    attachment_end_date: {
                      type: 'string',
                      format: 'date',
                      nullable: true
                    },
                    attachment_end_time: {
                      type: 'string',
                      nullable: true
                    },
                    attachment_end_timestamp: {
                      type: 'string',
                      format: 'date-time',
                      nullable: true
                    },
                    critterbase_start_capture_id: {
                      type: 'string'
                    },
                    critterbase_end_capture_id: {
                      type: 'string',
                      nullable: true
                    },
                    critterbase_end_mortality_id: {
                      type: 'string',
                      nullable: true
                    },
                    serial: {
                      type: 'string'
                    },
                    device_make_id: {
                      type: 'integer',
                      minimum: 1
                    },
                    model: {
                      type: 'string',
                      nullable: true
                    },
                    critterbase_critter_id: {
                      type: 'string'
                    }
                  }
                }
              },
              pagination: paginationResponseSchema
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
    409: {
      $ref: '#/components/responses/409'
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
 * Finds all deployments that are available to the user, based on their permissions and provided filter criteria.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function findDeployments(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);

    try {
      const paginationOptions = makePaginationOptionsFromRequest(req);

      await connection.open();

      const telemetryDeploymentService = new TelemetryDeploymentService(connection);

      // Extract filter parameters from query
      const filterFields: IDeploymentAdvancedFilters = {
        keyword: req.query.keyword as string,
        itis_tsn: req.query.itis_tsn ? Number(req.query.itis_tsn) : undefined,
        start_date: req.query.start_date as string,
        end_date: req.query.end_date as string,
        start_time: req.query.start_time as string,
        end_time: req.query.end_time as string,
        system_user_id: req.query.system_user_id ? Number(req.query.system_user_id) : undefined,
        device_serial: req.query.device_serial as string,
        species: req.query.species ? Number(req.query.species) : undefined,
        animal_alias: req.query.animal_alias as string
      };

      // Get user info to determine if they are an admin
      const isUserAdmin =
        req.system_user?.role_names?.includes(SYSTEM_ROLE.SYSTEM_ADMIN) ||
        req.system_user?.role_names?.includes(SYSTEM_ROLE.DATA_ADMINISTRATOR) ||
        false;
      const systemUserId = req.system_user?.system_user_id || null;

      const deployments = await telemetryDeploymentService.findDeployments(
        isUserAdmin,
        systemUserId,
        filterFields,
        ensureCompletePaginationOptions(paginationOptions)
      );

      await connection.commit();

      return res.status(200).json({
        deployments: deployments,
        pagination: makePaginationResponse(deployments.length, paginationOptions)
      });
    } catch (error) {
      defaultLog.error({ label: 'findDeployments', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
