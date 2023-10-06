import { AxiosError } from 'axios';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { BctwService } from '../../../../../../../services/bctw-service';
import { ICritterbaseUser } from '../../../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../../../services/survey-critter-service';
import { getLogger } from '../../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters/{critterId}/telemetry');
export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validProjectPermissions: [PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR],
          projectId: Number(req.params.projectId),
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
        type: 'number'
      },
      required: true
    },
    {
      in: 'path',
      name: 'critterId',
      schema: {
        type: 'number'
      }
    },
    {
      in: 'query',
      name: 'startDate',
      schema: {
        type: 'string'
      }
    },
    {
      in: 'query',
      name: 'endDate',
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
            title: 'Telemetry response',
            type: 'object'
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
      $ref: '#/components/responses/401'
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
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };
    const critterId = Number(req.params.critterId);
    const surveyId = Number(req.params.surveyId);
    const startDate = String(req.query.startDate);
    const endDate = String(req.query.endDate);
    const connection = getDBConnection(req['keycloak_token']);
    const surveyCritterService = new SurveyCritterService(connection);
    const bctw = new BctwService(user);
    try {
      await connection.open();
      const surveyCritters = await surveyCritterService.getCrittersInSurvey(surveyId);
      const thisCritter = surveyCritters.find((a) => a.critter_id === critterId);
      if (!thisCritter) {
        throw Error('Specified critter was not part of this survey.');
      }
      const points = await bctw.getCritterTelemetryPoints(
        thisCritter.critterbase_critter_id,
        new Date(startDate),
        new Date(endDate)
      );
      const tracks = await bctw.getCritterTelemetryTracks(
        thisCritter.critterbase_critter_id,
        new Date(startDate),
        new Date(endDate)
      );
      await connection.commit();
      return res.status(200).json({ points, tracks });
    } catch (error) {
      defaultLog.error({ label: 'telemetry', message: 'error', error });
      console.log(JSON.stringify((error as Error).message));
      await connection.rollback();
      return res.status(500).json((error as AxiosError).response);
    } finally {
      connection.release();
    }
  };
}
