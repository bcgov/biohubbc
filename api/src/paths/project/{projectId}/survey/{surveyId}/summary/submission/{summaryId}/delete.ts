import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { SummaryService } from '../../../../../../../../services/summary-service';
import { getLogger } from '../../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/summary/submission/{summaryId}/delete');

export const DELETE: Operation = [
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
  deleteSummarySubmission()
];

DELETE.apiDoc = {
  description: 'Soft deletes a summary submission by ID.',
  tags: ['summary_submission', 'delete'],
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
        type: 'number'
      },
      required: true
    },
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
      name: 'summaryId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Summary submission csv details response.',
      content: {
        'application/json': {
          schema: {
            title: 'Row count of soft deleted records',
            type: 'number'
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

export function deleteSummarySubmission(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'Soft delete a summary submission by ID',
      message: 'params',
      req_params: req.params
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.summaryId) {
      throw new HTTP400('Missing required path param `summaryId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();
      const summaryService = new SummaryService(connection);

      const result = await summaryService.deleteSummarySubmission(Number(req.params.summaryId));
      await connection.commit();

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.error({ label: 'deleteSummarySubmission', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
