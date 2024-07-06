import dayjs from 'dayjs';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { isNull } from 'lodash';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { getDeploymentSchema } from '../../../../../../openapi/schemas/deployment';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../services/bctw-service/bctw-deployment-service';
import { ICritterbaseUser } from '../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../services/deployment-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/deployments');

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
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Responds with all deployments under this survey.',
      content: {
        'application/json': {
          schema: {
            title: 'Deployments',
            type: 'array',
            items: getDeploymentSchema
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

export function getDeploymentsInSurvey(): RequestHandler {
  return async (req, res) => {
    const user: ICritterbaseUser = {
      keycloak_guid: req['system_user']?.user_guid,
      username: req['system_user']?.user_identifier
    };

    const surveyId = Number(req.params.surveyId);
    const connection = getDBConnection(req['keycloak_token']);

    const deploymentService = new DeploymentService(connection);
    const bctwDeploymentService = new BctwDeploymentService(user);

    try {
      await connection.open();

      // Fetch deployments from the deployment service for the given surveyId
      const surveyDeployments = await deploymentService.getDeploymentsForSurveyId(surveyId);

      // Extract deployment IDs from survey deployments
      const deploymentIds = surveyDeployments.map((deployment) => deployment.bctw_deployment_id);

      // Return early if there are no deployments
      if (!deploymentIds.length) {
        return res.status(200).json([]);
      }

      // Fetch additional deployment details from BCTW service
      const bctwDeployments = await bctwDeploymentService.getDeploymentsByIds(deploymentIds);
      const now = dayjs();

      // TODO: Move this logic into bctw - bctw should only return valid deployment records, not soft deleted ones
      const validDeployments = bctwDeployments.filter(
        (deployment) => isNull(deployment.valid_to) || dayjs(deployment.valid_to) > now
      );

      // Merge survey and BCTW deployment information
      const results = validDeployments.map((bctwDeployment) => {
        const surveyDeployment = surveyDeployments.find(
          (deployment) => deployment.bctw_deployment_id === bctwDeployment.deployment_id
        );
        return {
          ...bctwDeployment,
          deployment_id: surveyDeployment?.deployment_id,
          bctw_deployment_id: surveyDeployment?.bctw_deployment_id,
          critterbase_start_capture_id: surveyDeployment?.critterbase_start_capture_id,
          critterbase_end_capture_id: surveyDeployment?.critterbase_end_capture_id,
          critterbase_end_mortality_id: surveyDeployment?.critterbase_end_mortality_id,
          // Do not trust the Critter Id stored by BCTW. Instead, use the SIMS integer survey critter ID
          critter_id: surveyDeployment?.critter_id,
          critterbase_critter_id: surveyDeployment?.critterbase_critter_id
        };
      });

      return res.status(200).json(results);
    } catch (error) {
      defaultLog.error({ label: 'getDeploymentsInSurvey', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
