import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP409 } from '../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { ObservationService } from '../../../../../../services/observation-service';
import { TechniqueService } from '../../../../../../services/technique-service';
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
  deleteSurveyTechniqueRecords()
];

POST.apiDoc = {
  description: 'Delete survey techniques.',
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
    description: 'Survey technique delete request object.',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['methodTechniqueIds'],
          properties: {
            methodTechniqueIds: {
              items: {
                type: 'integer',
                minimum: 1
              },
              minItems: 1,
              description: 'An array of technique record IDs to delete.'
            }
          }
        }
      }
    }
  },
  responses: {
    204: {
      description: 'Delete survey techniques OK'
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

export function deleteSurveyTechniqueRecords(): RequestHandler {
  return async (req, res) => {
    const surveyId = Number(req.params.surveyId);
    const methodTechniqueIds = req.body.methodTechniqueIds as number[];

    const connection = getDBConnection(req.keycloak_token);

    try {
      await connection.open();

      const observationService = new ObservationService(connection);

      const observationCount = await observationService.getObservationsCountByTechniqueIds(
        surveyId,
        methodTechniqueIds
      );

      if (observationCount > 0) {
        throw new HTTP409('Cannot delete a technique that is associated with an observation');
      }

      const techniqueService = new TechniqueService(connection);

      // TODO: Update to handle all deletes in one request rather than one at a time
      await Promise.all(
        methodTechniqueIds.map((methodTechniqueId) => techniqueService.deleteTechnique(surveyId, methodTechniqueId))
      );

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
