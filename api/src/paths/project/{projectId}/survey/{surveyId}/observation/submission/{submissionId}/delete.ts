import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../../errors/custom-error';
import { queries } from '../../../../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/submission/{submissionId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteOccurrenceSubmission()
];

DELETE.apiDoc = {
  description: 'Soft deletes an occurrence submission by ID.',
  tags: ['observation_submission', 'delete'],
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
      name: 'submissionId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  responses: {
    200: {
      description: 'Observation submission csv details response.',
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

export function deleteOccurrenceSubmission(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({
      label: 'Soft delete an occurrence submission by ID',
      message: 'params',
      req_params: req.params
    });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param `projectId`');
    }

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.submissionId) {
      throw new HTTP400('Missing required path param `submissionId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const deleteSubmissionSQLStatement = queries.survey.deleteOccurrenceSubmissionSQL(
        Number(req.params.submissionId)
      );

      if (!deleteSubmissionSQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      await connection.open();

      const deleteResult = await connection.query(
        deleteSubmissionSQLStatement.text,
        deleteSubmissionSQLStatement.values
      );

      await connection.commit();

      const deleteResponse = (deleteResult && deleteResult.rowCount) || null;

      return res.status(200).json(deleteResponse);
    } catch (error) {
      defaultLog.error({ label: 'deleteOccurrenceSubmission', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
