import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ATTACHMENT_TYPE } from '../../../../../../../constants/attachments';
import { PROJECT_ROLE } from '../../../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../../../database/db';
import { HTTP400 } from '../../../../../../../errors/http-error';
import { queries } from '../../../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../../../request-handlers/security/authorization';
import { deleteFileFromS3 } from '../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../utils/logger';
import { attachmentApiDocObject } from '../../../../../../../utils/shared-api-docs';
import { deleteSurveyReportAttachmentAuthors } from '../report/upload';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/{attachmentId}/delete');

export const POST: Operation = [
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
  deleteAttachment()
];

POST.apiDoc = {
  ...attachmentApiDocObject('Delete an attachment of a survey.', 'Row count of successfully deleted attachment record'),
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
      name: 'attachmentId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Current attachment type for survey attachment.',
    content: {
      'application/json': {
        schema: {
          type: 'object'
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Delete an attachment of a survey OK'
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

export function deleteAttachment(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete attachment', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.attachmentId) {
      throw new HTTP400('Missing required path param `attachmentId`');
    }

    if (!req.body || !req.body.attachmentType) {
      throw new HTTP400('Missing required body param `attachmentType`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      let deleteResult: { key: string };
      if (req.body.attachmentType === ATTACHMENT_TYPE.REPORT) {
        await deleteSurveyReportAttachmentAuthors(Number(req.params.attachmentId), connection);

        deleteResult = await deleteSurveyReportAttachment(Number(req.params.attachmentId), connection);
      } else {
        deleteResult = await deleteSurveyAttachment(Number(req.params.attachmentId), connection);
      }

      await connection.commit();

      const deleteFileResult = await deleteFileFromS3(deleteResult.key);

      if (!deleteFileResult) {
        return res.status(200).json(null);
      }

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'deleteAttachment', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const deleteSurveyAttachment = async (
  attachmentId: number,
  connection: IDBConnection
): Promise<{ key: string }> => {
  const sqlStatement = queries.survey.deleteSurveyAttachmentSQL(attachmentId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL delete project attachment statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to delete survey attachment record');
  }

  return response.rows[0];
};

export const deleteSurveyReportAttachment = async (
  attachmentId: number,
  connection: IDBConnection
): Promise<{ key: string }> => {
  const sqlStatement = queries.survey.deleteSurveyReportAttachmentSQL(attachmentId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL delete project report attachment statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to delete survey attachment report record');
  }

  return response.rows[0];
};
