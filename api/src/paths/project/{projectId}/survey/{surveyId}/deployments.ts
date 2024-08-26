import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { BctwService } from '../../../../../services/bctw-service';
import { ICritterbaseUser } from '../../../../../services/critterbase-service';
import { SurveyCritterService } from '../../../../../services/survey-critter-service';
import { TelemetryService } from '../../../../../services/telemetry-service';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/critters');
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
  getDeploymentsInSurvey()
];

GET.apiDoc = {
  description:
    'Fetches a list of all the deployments under this survey. This is determined by the critters under this survey.',
  tags: ['bctw'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number',
        minimum: 1
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'A list of deployments belonging to critters associated with this survey.',
      content: {
        'application/json': {
          schema: {
            title: 'Deployments',
            type: 'array',
            items: {
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
 * Get all deployments under a survey.
 *
 * TODO: Currently this fetches deployment records based on the critters in the survey. This is a stop-gap solution
 * until the BCTW API is updated to support fetching deployment records by deployment ID. SIMS already tracks deployment
 * IDs in the 'deployment' table, which should be used to fetch deployment records when the BCTW API is updated. See
 * 'Workaround' in the implementation below.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getDeploymentsInSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const telemetryService = new TelemetryService(connection);
      const simsDeploymentRecords = await telemetryService.getDeploymentsBySurveyId(surveyId);

      if (!simsDeploymentRecords.length) {
        // No deployments recorded by the survey, return early
        return res.status(200).json([]);
      }

      const surveyCritterService = new SurveyCritterService(connection);
      const simsCritterRecords = await surveyCritterService.getCrittersInSurvey(surveyId);

      if (!simsCritterRecords.length) {
        // No critters recorded by the survey, return early
        return res.status(200).json([]);
      }

      const critterbaseCritterIds = simsCritterRecords.map((critter) => critter.critterbase_critter_id);

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      const bctwService = new BctwService(user);
      // All bctw deployment records for all critters in the survey, which may include deployments not recorded by the
      // survey
      const allBCTWDeploymentRecordsForCritterIds = await bctwService.getDeploymentsByCritterId(critterbaseCritterIds);

      // All bctw deployment ids that were recorded by the survey in SIMS
      const simsBCTWDeploymentIds = simsDeploymentRecords.map(
        (deploymentRecord) => deploymentRecord.bctw_deployment_id
      );

      // Workaround (see TODO in JSDoc): Filter all bctw deployments to only include deployments that were recorded by
      // the survey in SIMS.
      const deploymentRecordsForSurvey = allBCTWDeploymentRecordsForCritterIds.filter((bctwDeploymentRecord) =>
        simsBCTWDeploymentIds.includes(bctwDeploymentRecord.deployment_id)
      );

      return res.status(200).json(deploymentRecordsForSurvey);
    } catch (error) {
      defaultLog.error({ label: 'getDeploymentsInSurvey', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
