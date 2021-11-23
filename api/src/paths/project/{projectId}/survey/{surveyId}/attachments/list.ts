'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../database/db';
import { HTTP400 } from '../../../../../../errors/CustomError';
import { GetAttachmentsData } from '../../../../../../models/project-survey-attachments';
import {
  getSurveyAttachmentsSQL,
  getSurveyReportAttachmentsSQL
} from '../../../../../../queries/survey/survey-attachments-queries';
import { authorizeRequestHandler } from '../../../../../../request-handlers/security/authorization';
import { getLogger } from '../../../../../../utils/logger';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/list');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [
            PROJECT_ROLE.PROJECT_LEAD,
            PROJECT_ROLE.PROJECT_REVIEWER,
            PROJECT_ROLE.PROJECT_TEAM_MEMBER
          ],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getSurveyAttachments()
];

GET.apiDoc = {
  description: 'Fetches a list of attachments of a survey.',
  tags: ['attachments'],
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
    }
  ],
  responses: {
    200: {
      description: 'Survey get response file description array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                fileName: {
                  description: 'The file name of the attachment',
                  type: 'string'
                },
                lastModified: {
                  description: 'The date the object was last modified',
                  type: 'string'
                }
              }
            }
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

export function getSurveyAttachments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get attachments list', message: 'params', req_params: req.params });

    if (!req.params.surveyId) {
      throw new HTTP400('Missing required path param `surveyId`');
    }

    const connection = getDBConnection(req['keycloak_token']);

    try {
      const getSurveyAttachmentsSQLStatement = getSurveyAttachmentsSQL(Number(req.params.surveyId));
      const getSurveyReportAttachmentsSQLStatement = getSurveyReportAttachmentsSQL(Number(req.params.surveyId));

      if (!getSurveyAttachmentsSQLStatement || !getSurveyReportAttachmentsSQLStatement) {
        throw new HTTP400('Failed to build SQL get statement');
      }

      await connection.open();

      const attachmentsData = await connection.query(
        getSurveyAttachmentsSQLStatement.text,
        getSurveyAttachmentsSQLStatement.values
      );

      const reportAttachmentsData = await connection.query(
        getSurveyReportAttachmentsSQLStatement.text,
        getSurveyReportAttachmentsSQLStatement.values
      );

      await connection.commit();

      const getAttachmentsData =
        (attachmentsData &&
          reportAttachmentsData &&
          attachmentsData.rows &&
          reportAttachmentsData.rows &&
          new GetAttachmentsData([...attachmentsData.rows, ...reportAttachmentsData.rows])) ||
        null;

      return res.status(200).json(getAttachmentsData);
    } catch (error) {
      defaultLog.error({ label: 'getSurveyAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
