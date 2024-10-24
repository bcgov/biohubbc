import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400, HTTP409 } from '../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { SampleLocationService } from '../../../../../../services/sample-location-service';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/sample-site/delete');

export const POST: Operation = [
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
  deleteSurveySampleSiteRecords()
];

POST.apiDoc = {
  description: 'Delete survey sample sites.',
  tags: ['survey'],
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
  requestBody: {
    description: 'Survey sample site delete request object.',
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['surveySampleSiteIds'],
          properties: {
            surveySampleSiteIds: {
              items: {
                type: 'integer',
                minimum: 1
              }
            }
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Delete survey sample site OK'
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

export function deleteSurveySampleSiteRecords(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const surveySampleSiteIds = req.body.surveySampleSiteIds as number[];

    if (!surveySampleSiteIds) {
      throw new HTTP400('Missing required body `surveySampleSiteIds`');
    }

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);
      const sampleLocationService = new SampleLocationService(connection);

      const observationCount = await observationService.getObservationsCountBySampleSiteIds(
        surveyId,
        surveySampleSiteIds
      );

      if (observationCount > 0) {
        throw new HTTP409(`Cannot delete a sampling site that is associated with an observation`);
      }

      for (const surveySampleSiteId of surveySampleSiteIds) {
        await sampleLocationService.deleteSampleSiteRecord(surveyId, surveySampleSiteId);
      }

      await connection.commit();

      return res.status(204).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteSurveySampleSiteRecords', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
