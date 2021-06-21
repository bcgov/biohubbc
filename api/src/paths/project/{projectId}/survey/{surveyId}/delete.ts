import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/CustomError';
import { getSurveyAttachmentsSQL } from '../../../../../queries/survey/survey-attachments-queries';
import { deleteSurveySQL } from '../../../../../queries/survey/survey-delete-queries';
import { deleteFileFromS3 } from '../../../../../utils/file-utils';
import { getLogger } from '../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/delete');

export const DELETE: Operation = [deleteSurvey()];

DELETE.apiDoc = {
  description: 'Delete a survey.',
  tags: ['survey'],
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
    },
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
    defaultLog.debug({ label: 'Delete survey', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
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
      const getSurveyAttachmentSQLStatement = getSurveyAttachmentsSQL(Number(req.params.surveyId));

      if (!getSurveyAttachmentSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const getResult = await connection.query(
        getSurveyAttachmentSQLStatement.text,
        getSurveyAttachmentSQLStatement.values
      );

      if (!getResult || !getResult.rows) {
        throw new HTTP400('Failed to get survey attachments');
      }

      const surveyAttachmentS3Keys: string[] = getResult.rows.map((attachment: any) => {
        return attachment.key;
      });

      const promises: Promise<any>[] = [];

      // Handle deleting the S3 attachments associated to this survey
      promises.push(Promise.all(surveyAttachmentS3Keys.map((s3Key: string) => deleteFileFromS3(s3Key))));

      await Promise.all(promises);

      /**
       * PART 2
       * Delete the survey and all associated records/resources from our DB
       */
      const deleteSurveySQLStatement = deleteSurveySQL(Number(req.params.surveyId));

      if (!deleteSurveySQLStatement) {
        throw new HTTP400('Failed to build SQL delete statement');
      }

      await connection.query(deleteSurveySQLStatement.text, deleteSurveySQLStatement.values);

      await connection.commit();

      return res.status(200).json(true);
    } catch (error) {
      defaultLog.debug({ label: 'deleteSurvey', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
