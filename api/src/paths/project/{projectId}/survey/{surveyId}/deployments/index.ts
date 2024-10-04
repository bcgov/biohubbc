import dayjs from 'dayjs';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { getDeploymentSchema } from '../../../../../../openapi/schemas/deployment';
import { WarningSchema, warningSchema } from '../../../../../../openapi/schemas/warning';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { BctwDeploymentService } from '../../../../../../services/bctw-service/bctw-deployment-service';
import { ICritterbaseUser } from '../../../../../../services/critterbase-service';
import { DeploymentService } from '../../../../../../services/deployment-service';
import { isFeatureFlagPresent } from '../../../../../../utils/feature-flag-utils';
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
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    },
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'integer',
        minimum: 1
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
            type: 'object',
            properties: {
              deployments: {
                title: 'Deployments',
                type: 'array',
                items: getDeploymentSchema
              },
              bad_deployments: {
                type: 'array',
                items: warningSchema
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
        // Return an empty array if there are no deployments in the survey
        return res.status(200).json({ deployments: [], bad_deployments: [] });
      }

      // Fetch additional deployment details from BCTW service
      const bctwDeployments = await bctwDeploymentService.getDeploymentsByIds(deploymentIds);

      const surveyDeploymentsWithBctwData = [];

      // Track deployments that exist in SIMS but have incorrect data in BCTW
      const badDeployments: WarningSchema[] = [];

      // For each SIMS survey deployment record, find the matching BCTW deployment record.
      // We expect exactly 1 matching record, otherwise we throw an error.
      // More than 1 matching active record indicates an error in the BCTW data.
      for (const surveyDeployment of surveyDeployments) {
        const matchingBctwDeployments = bctwDeployments.filter(
          (deployment) => deployment.deployment_id === surveyDeployment.bctw_deployment_id
        );

        // TODO: If the feature flag exists, then we allow multiple active deployments to exist for the same deployment
        // ID (when normally we would return a bad deployment).
        if (!isFeatureFlagPresent(['API_FF_DISABLE_MULTIPLE_ACTIVE_DEPLOYMENTS_CHECK'])) {
          if (matchingBctwDeployments.length > 1) {
            defaultLog.warn({
              label: 'getDeploymentById',
              message: 'Multiple active deployments found for the same deployment ID, when only one should exist.',
              sims_deployment_id: surveyDeployment.deployment_id,
              bctw_deployment_id: surveyDeployment.bctw_deployment_id
            });
            badDeployments.push({
              name: 'BCTW Data Error',
              message: 'Multiple active deployments found for the same deployment ID, when only one should exist.',
              data: {
                sims_deployment_id: surveyDeployment.deployment_id,
                bctw_deployment_id: surveyDeployment.bctw_deployment_id
              }
            });
            // Don't continue processing this deployment
            continue;
          }
        }

        if (matchingBctwDeployments.length === 0) {
          defaultLog.warn({
            label: 'getDeploymentById',
            message: 'No active deployments found for deployment ID, when one should exist.',
            sims_deployment_id: surveyDeployment.deployment_id,
            bctw_deployment_id: surveyDeployment.bctw_deployment_id
          });

          badDeployments.push({
            name: 'BCTW Data Error',
            message: 'No active deployments found for deployment ID, when one should exist.',
            data: {
              sims_deployment_id: surveyDeployment.deployment_id,
              bctw_deployment_id: surveyDeployment.bctw_deployment_id
            }
          });

          // Don't continue processing this deployment
          continue;
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

      return res.status(200).json({ deployments: surveyDeploymentsWithBctwData, bad_deployments: badDeployments });
    } catch (error) {
      defaultLog.error({ label: 'getDeploymentsInSurvey', message: 'error', error });
      await connection.rollback();

      throw error;
    } finally {
      connection.release();
    }
  };
}
