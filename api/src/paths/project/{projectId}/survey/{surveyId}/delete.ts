import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/http-error';
import { queries } from '../../../../../queries/queries';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { PlatformService } from '../../../../../services/platform-service';
import { deleteFileFromS3 } from '../../../../../utils/file-utils';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/delete');

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
  deleteSurvey()
];

DELETE.apiDoc = {
  description: 'Delete a survey.',
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
  responses: {
    200: {
      description: 'Boolean true value representing successful deletion.',
      content: {
        'application/json': {
          schema: {
            title: 'Survey delete response',
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

export function deleteSurvey(): RequestHandler {
  return async (req, res) => {
    const projectId = Number(req.params.projectId);
    const surveyId = Number(req.params.surveyId);

    if (!surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();
      /**
       * PART 1
       * Get the attachment S3 keys for all attachments associated to this survey
       * Used to delete them from S3 separately later
       */
      const surveyAttachmentS3Keys: string[] = await getSurveyAttachmentS3Keys(surveyId, connection);

      /**
       * PART 2
       * Delete the survey and all associated records/resources from our DB
       */
      const deleteSurveySQLStatement = queries.survey.deleteSurveySQL(surveyId);

      await connection.query(deleteSurveySQLStatement.text, deleteSurveySQLStatement.values);

      /**
       * PART 3
       * Delete the survey attachments from S3
       */
      const deleteResult = await Promise.all(surveyAttachmentS3Keys.map((s3Key: string) => deleteFileFromS3(s3Key)));

      if (deleteResult.some((deleteResult) => !deleteResult)) {
        return res.status(200).json(null);
      }

      try {
        const platformService = new PlatformService(connection);
        await platformService.submitDwCAMetadataPackage(projectId);
      } catch (error) {
        // Don't fail the rest of the endpoint if submitting metadata fails
        defaultLog.error({ label: 'deleteSurvey->submitDwCAMetadataPackage', message: 'error', error });
      }

      await connection.commit();

      return res.status(200).json(true);
    } catch (error) {
      defaultLog.error({ label: 'deleteSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

export const getSurveyAttachmentS3Keys = async (surveyId: number, connection: IDBConnection) => {
  const getSurveyAttachmentSQLStatement = queries.survey.__deprecated_getSurveyAttachmentsSQL(surveyId);

  if (!getSurveyAttachmentSQLStatement) {
    throw new HTTP400('Failed to build SQL get statement');
  }

  const getResult = await connection.query(
    getSurveyAttachmentSQLStatement.text,
    getSurveyAttachmentSQLStatement.values
  );

  if (!getResult || !getResult.rows) {
    throw new HTTP400('Failed to get survey attachments');
  }

  return getResult.rows.map((attachment: any) => attachment.key);
};
