import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { BctwTelemetryService } from '../../../../../../../services/bctw-service/bctw-telemetry-service';
import { ICritterbaseUser } from '../../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../../services/deployment-service';
import { getLogger } from '../../../../../../../utils/logger';
const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters/{critterId}/telemetry');

export const GET: Operation = [
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
  getCritterTelemetry()
];

GET.apiDoc = {
  description: 'Get telemetry points for a specific critter.',
  tags: ['bctw'],
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
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'integer'
      },
      required: true
    },
    {
      in: 'query',
      name: 'startDate',
      required: true,
      schema: {
        type: 'string'
      }
    },
    {
      in: 'query',
      name: 'endDate',
      required: true,
      schema: {
        type: 'string'
      }
    }
  ],
  responses: {
    200: {
      description: 'Responds with count of rows created in SIMS DB Deployments.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                telemetry_id: { type: 'string', format: 'uuid' },
                deployment_id: { type: 'string', format: 'uuid' },
                collar_transaction_id: { type: 'string', format: 'uuid' },
                critter_id: { type: 'string', format: 'uuid' },
                deviceid: { type: 'number' },
                latitude: { type: 'number', nullable: true },
                longitude: { type: 'number', nullable: true },
                elevation: { type: 'number', nullable: true },
                vendor: { type: 'string', nullable: true },
                acquisition_date: { type: 'string', nullable: true }
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

export function getCritterTelemetry(): RequestHandler {
  return async (req, res) => {
    const critterId = Number(req.params.critterId);
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req.keycloak_token);
    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      // TODO: Telemetry data should only ever be fetched by deployment Ids. To get telemetry for an animal, first find the
      // relevant deployment Id, then fetch data for that deployment Id.
      const deploymentService = new DeploymentService(connection);
      const bctwTelemetryService = new BctwTelemetryService(user);

      const { bctw_deployment_id } = await deploymentService.getDeploymentForCritterId(surveyId, critterId);

      // const startDate = new Date(String(req.query.startDate));
      // const endDate = new Date(String(req.query.endDate));

      // TODO: Add start and end date filters received in the SIMS request to the BCTW request
      const points = await bctwTelemetryService.getAllTelemetryByDeploymentIds([bctw_deployment_id]);

      await connection.commit();

      return res.status(200).json(points);
    } catch (error) {
      defaultLog.error({ label: 'telemetry', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
