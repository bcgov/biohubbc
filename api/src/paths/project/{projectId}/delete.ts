import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE, SYSTEM_ROLE } from '../../../constants/roles';
import { getDBConnection } from '../../../database/db';
import { HTTP400 } from '../../../errors/custom-error';
import { queries } from '../../../queries/queries';
import { authorizeRequestHandler, userHasValidRole } from '../../../request-handlers/security/authorization';
import { deleteFileFromS3 } from '../../../utils/file-utils';
import { getLogger } from '../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/delete');

export const DELETE: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  deleteProject()
];

DELETE.apiDoc = {
  description: 'Delete a project.',
  tags: ['project'],
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
      const getProjectSQLStatement = queries.project.getProjectSQL(Number(req.params.projectId));

      if (!getProjectSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const projectData = await connection.query(getProjectSQLStatement.text, getProjectSQLStatement.values);

      const projectResult = (projectData && projectData.rows && projectData.rows[0]) || null;

      if (!projectResult || !projectResult.id) {
        throw new HTTP400('Failed to get the project');
      }

      if (
        projectResult.publish_date &&
        userHasValidRole([SYSTEM_ROLE.PROJECT_CREATOR], req['system_user']['role_names'])
      ) {
        throw new HTTP400('Cannot delete a published project if you are not a system administrator.');
      }

      /**
       * PART 2
       * Get the attachment S3 keys for all attachments associated to this project
       * Used to delete them from S3 separately later
       */
      const getProjectAttachmentSQLStatement = queries.project.getProjectAttachmentsSQL(Number(req.params.projectId));

      if (!getProjectAttachmentSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      const getProjectAttachmentsResult = await connection.query(
        getProjectAttachmentSQLStatement.text,
        getProjectAttachmentSQLStatement.values
      );

      if (!getProjectAttachmentsResult || !getProjectAttachmentsResult.rows) {
        throw new HTTP400('Failed to get project attachments');
      }

      const projectAttachmentS3Keys: string[] = getProjectAttachmentsResult.rows.map((attachment: any) => {
        return attachment.key;
      });

      /**
       * PART 3
       * Delete the project and all associated records/resources from our DB
       */
      const deleteProjectSQLStatement = queries.project.deleteProjectSQL(Number(req.params.projectId));

      if (!deleteProjectSQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      await connection.query(deleteProjectSQLStatement.text, deleteProjectSQLStatement.values);

      /**
       * PART 3
       * Delete the project attachments from S3
       */
      const deleteResult = [
        ...(await Promise.all(projectAttachmentS3Keys.map((projectS3Key: string) => deleteFileFromS3(projectS3Key))))
      ];

      if (deleteResult.some((deleteResult) => !deleteResult)) {
        return res.status(200).json(null);
      }

      await connection.commit();

      return res.status(200).json(true);
    } catch (error) {
      defaultLog.error({ label: 'deleteProject', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
