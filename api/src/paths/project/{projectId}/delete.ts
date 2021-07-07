import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/CustomError';
import { getProjectAttachmentsSQL } from '../../../queries/project/project-attachments-queries';
import { getLogger } from '../../../utils/logger';
import { getSurveyIdsSQL } from '../../../queries/survey/survey-view-queries';
import { getSurveyAttachmentS3Keys } from './survey/{surveyId}/delete';
import { deleteProjectSQL } from '../../../queries/project/project-delete-queries';
import { deleteFileFromS3 } from '../../../utils/file-utils';
import { getProjectSQL } from '../../../queries/project/project-view-queries';

const defaultLog = getLogger('/api/project/{projectId}/delete');

export const DELETE: Operation = [deleteProject()];

DELETE.apiDoc = {
  description: 'Delete a project.',
  tags: ['project'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
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
    }
  ],
  responses: {
    200: {
      description: 'Boolean true value representing successful deletion.',
      content: {
        'application/json': {
          schema: {
            title: 'Project delete response',
            type: 'boolean'
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

export function deleteProject(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Delete project', message: 'params', req_params: req.params });

    if (!req.params.projectId) {
      throw new HTTP400('Missing required path param: `projectId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      /**
       * PART 1
       * Check that user is a system administrator - can delete a project (published or not)
       * Check that user is a project administrator - can delete a project (unpublished only)
       *
       */

      const getProjectSQLStatement = getProjectSQL(Number(req.params.projectId));

      if (!getProjectSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const projectData = await connection.query(getProjectSQLStatement.text, getProjectSQLStatement.values);

      await connection.commit();

      const projectResult = (projectData && projectData.rows && projectData.rows[0]) || null;

      if (!projectResult || !projectResult.id) {
        throw new HTTP400('Failed to get the project');
      }

      if (req['system_user']['role_names'][0] === SYSTEM_ROLE.PROJECT_ADMIN && projectResult.publish_date) {
        throw new HTTP400('Cannot delete a published project.');
      }

      /**
       * PART 2
       * Get the attachment S3 keys for all attachments associated to this project and surveys under this project
       * Used to delete them from S3 separately later
       */
      const getProjectAttachmentSQLStatement = getProjectAttachmentsSQL(Number(req.params.projectId));
      const getSurveyIdsSQLStatement = getSurveyIdsSQL(Number(req.params.projectId));

      if (!getProjectAttachmentSQLStatement || !getSurveyIdsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      //await connection.open();

      const getProjectAttachmentsResult = await connection.query(
        getProjectAttachmentSQLStatement.text,
        getProjectAttachmentSQLStatement.values
      );

      if (!getProjectAttachmentsResult || !getProjectAttachmentsResult.rows) {
        throw new HTTP400('Failed to get project attachments');
      }

      const getSurveyIdsResult = await connection.query(getSurveyIdsSQLStatement.text, getSurveyIdsSQLStatement.values);

      if (!getSurveyIdsResult || !getSurveyIdsResult.rows) {
        throw new HTTP400('Failed to get survey ids associated to project');
      }

      const surveyAttachmentS3Keys: string[] = Array.prototype.concat.apply(
        [],
        await Promise.all(
          getSurveyIdsResult.rows.map((survey: any) => getSurveyAttachmentS3Keys(survey.id, connection))
        )
      );

      const projectAttachmentS3Keys: string[] = getProjectAttachmentsResult.rows.map((attachment: any) => {
        return attachment.key;
      });

      /**
       * PART 3
       * Delete the project and all associated records/resources from our DB
       */
      const deleteProjectSQLStatement = deleteProjectSQL(Number(req.params.projectId));

      if (!deleteProjectSQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      await connection.query(deleteProjectSQLStatement.text, deleteProjectSQLStatement.values);

      /**
       * PART 3
       * Delete the project and survey attachments from S3
       */
      const deleteResult = [
        ...(await Promise.all(projectAttachmentS3Keys.map((projectS3Key: string) => deleteFileFromS3(projectS3Key)))),
        ...(await Promise.all(surveyAttachmentS3Keys.map((surveyS3Key: string) => deleteFileFromS3(surveyS3Key))))
      ];

      if (deleteResult.some((deleteResult) => !deleteResult)) {
        return res.status(200).json(null);
      }

      await connection.commit();

      return res.status(200).json(true);
    } catch (error) {
      defaultLog.debug({ label: 'deleteProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
