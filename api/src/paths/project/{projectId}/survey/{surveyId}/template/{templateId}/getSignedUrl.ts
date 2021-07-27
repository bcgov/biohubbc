'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { HTTP400 } from '../../../../../../../errors/CustomError';
import { getLogger } from '../../../../../../../utils/logger';
import { getDBConnection } from '../../../../../../../database/db';
import { getSurveyTemplateOccurrenceSQL } from '../../../../../../../queries/survey/survey-occurrence-queries';
import { getS3SignedURL } from '../../../../../../../utils/file-utils';
import { attachmentApiDocObject } from '../../../../../../../utils/shared-api-docs';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/template/{templateId}/getSignedUrl');

export const GET: Operation = [getSingleTemplateURL()];

GET.apiDoc = {
  ...attachmentApiDocObject(
    'Retrieves the signed url of template observation in a survey by its template id.',
    'GET response containing the signed url of a template.'
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
      name: 'templateId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ]
};

export function getSingleTemplateURL(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get single template url', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    if (!req.params.templateId) {
      throw new HTTP400('Missing required path param `templateId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveyTemplateOccurrenceSQLStatement = getSurveyTemplateOccurrenceSQL(
        Number(req.params.surveyId),
        Number(req.params.templateId)
      );

      if (!getSurveyTemplateOccurrenceSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const result = await connection.query(
        getSurveyTemplateOccurrenceSQLStatement.text,
        getSurveyTemplateOccurrenceSQLStatement.values
      );

      console.log('result in', result);

      await connection.commit();

      const s3Key = result && result.rows.length && result.rows[0].key;
      const s3SignedUrl = await getS3SignedURL(s3Key);

      if (!s3SignedUrl) {
        return res.status(200).json(null);
      }

      return res.status(200).json(s3SignedUrl);
    } catch (error) {
      defaultLog.debug({ label: 'getSingleTemplateURL', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
