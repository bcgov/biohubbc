import dayjs from 'dayjs';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP409 } from '../../../../../../errors/http-error';
import { getDeploymentSchema } from '../../../../../../openapi/schemas/deployment';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../services/bctw-service/bctw-deployment-service';
import { ICritterbaseUser } from '../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../services/deployment-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/deployments/index');

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
  description: 'Returns information about all deployments under this survey.',
  tags: ['deployment', 'bctw'],
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
      description: 'Responds with information about all deployments under this survey.',
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

export function getDeploymentsInSurvey(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const user: ICritterbaseUser = {
        keycloak_guid: connection.systemUserGUID(),
        username: connection.systemUserIdentifier()
      };

      const deploymentService = new DeploymentService(connection);
      const bctwDeploymentService = new BctwDeploymentService(user);

      // Fetch deployments from the deployment service for the given surveyId
      const surveyDeployments = await deploymentService.getDeploymentsForSurveyId(surveyId);

      // Extract deployment IDs from survey deployments
      const deploymentIds = surveyDeployments.map((deployment) => deployment.bctw_deployment_id);

      // Return early if there are no deployments
      if (!deploymentIds.length) {
        // TODO: 400 error instead?
        return res.status(200).json([]);
      }

      // Fetch additional deployment details from BCTW service
      const bctwDeployments = await bctwDeploymentService.getDeploymentsByIds(deploymentIds);

      const surveyDeploymentsWithBctwData = [];

      // For each SIMS survey deployment record, find the matching BCTW deployment record.
      // We expect exactly 1 matching record, otherwise we throw an error.
      // More than 1 matching active record indicates an error in the BCTW data.
      for (const surveyDeployment of surveyDeployments) {
        const matchingBctwDeployments = bctwDeployments.filter(
          (deployment) => deployment.deployment_id === surveyDeployment.bctw_deployment_id
        );

        if (matchingBctwDeployments.length > 1) {
          throw new HTTP409('Multiple active deployments found for the same deployment ID', [
            'This is an issue in the BC Telemetry Warehouse (BCTW) data. There should only be one active deployment record for a given deployment ID.',
            `SIMS deployment ID: ${surveyDeployment.deployment_id}`,
            `BCTW deployment ID: ${surveyDeployment.bctw_deployment_id}`
          ]);
        }

        if (matchingBctwDeployments.length === 0) {
          throw new HTTP409('No active deployments found for deployment ID', [
            'There should be no deployments recorded in SIMS that have no matching deployment record in BCTW.',
            `SIMS Deployment ID: ${surveyDeployment.deployment_id}`,
            `BCTW Deployment ID: ${surveyDeployment.bctw_deployment_id}`
          ]);
        }

        surveyDeploymentsWithBctwData.push({
          // BCTW properties
          assignment_id: matchingBctwDeployments[0].assignment_id,
          collar_id: matchingBctwDeployments[0].collar_id,
          attachment_start_date: matchingBctwDeployments[0].attachment_start
            ? dayjs(matchingBctwDeployments[0].attachment_start).format('YYYY-MM-DD')
            : null,
          attachment_start_time: matchingBctwDeployments[0].attachment_start
            ? dayjs(matchingBctwDeployments[0].attachment_start).format('HH:mm:ss')
            : null,
          attachment_end_date: matchingBctwDeployments[0].attachment_end
            ? dayjs(matchingBctwDeployments[0].attachment_end).format('YYYY-MM-DD')
            : null,
          attachment_end_time: matchingBctwDeployments[0].attachment_end
            ? dayjs(matchingBctwDeployments[0].attachment_end).format('HH:mm:ss')
            : null,
          bctw_deployment_id: matchingBctwDeployments[0].deployment_id,
          device_id: matchingBctwDeployments[0].device_id,
          device_make: matchingBctwDeployments[0].device_make,
          device_model: matchingBctwDeployments[0].device_model,
          frequency: matchingBctwDeployments[0].frequency,
          frequency_unit: matchingBctwDeployments[0].frequency_unit,
          // SIMS properties
          deployment_id: surveyDeployment.deployment_id,
          critter_id: surveyDeployment.critter_id,
          critterbase_critter_id: surveyDeployment.critterbase_critter_id,
          critterbase_start_capture_id: surveyDeployment.critterbase_start_capture_id,
          critterbase_end_capture_id: surveyDeployment.critterbase_end_capture_id,
          critterbase_end_mortality_id: surveyDeployment.critterbase_end_mortality_id
        });
      }

      return res.status(200).json(surveyDeploymentsWithBctwData);
    } catch (error) {
      defaultLog.error({ label: 'getDeploymentsInSurvey', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
