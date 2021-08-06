'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { HTTP400 } from '../../../../../../../../errors/CustomError';
import { getLogger } from '../../../../../../../../utils/logger';
import { getDBConnection } from '../../../../../../../../database/db';
import { getSurveySubmissionOccurrenceSQL } from '../../../../../../../../queries/survey/survey-occurrence-queries';
import { getS3SignedURL } from '../../../../../../../../utils/file-utils';
import { attachmentApiDocObject } from '../../../../../../../../utils/shared-api-docs';

const defaultLog = getLogger(
  '/api/project/{projectId}/survey/{surveyId}/observation/submission/{submissionId}/getSignedUrl'
);

export const GET: Operation = [getSingleSubmissionURL()];

GET.apiDoc = {
  ...attachmentApiDocObject(
    'Retrieves the signed url of observation submission in a survey by its submission id.',
    'GET response containing the signed url of a submission.'
  ),
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
  ]
};

export function getSingleSubmissionURL(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get single submission url', message: 'params', req_params: req.params });

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
      const getSurveySubmissionOccurrenceSQLStatement = getSurveySubmissionOccurrenceSQL(
        Number(req.params.surveyId),
        Number(req.params.submissionId)
      );

      if (!getSurveySubmissionOccurrenceSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const result = await connection.query(
        getSurveySubmissionOccurrenceSQLStatement.text,
        getSurveySubmissionOccurrenceSQLStatement.values
      );

      await connection.commit();

      const s3Key = result && result.rows.length && result.rows[0].key;
      const s3SignedUrl = await getS3SignedURL(s3Key);

      if (!s3SignedUrl) {
        return res.status(200).json(null);
      }

      return res.status(200).json(s3SignedUrl);
    } catch (error) {
      defaultLog.debug({ label: 'getSingleSubmissionURL', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
