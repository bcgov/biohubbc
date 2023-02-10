import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { PROJECT_ROLE } from '../../../../../../../../constants/roles';
import { getDBConnection } from '../../../../../../../../database/db';
import { HTTP400, HTTP500 } from '../../../../../../../../errors/http-error';
import { authorizeRequestHandler } from '../../../../../../../../request-handlers/security/authorization';
import { OccurrenceService } from '../../../../../../../../services/occurrence-service';
import { generateS3FileKey, getFileFromS3 } from '../../../../../../../../utils/file-utils';
import { getLogger } from '../../../../../../../../utils/logger';
import { DWCArchive } from '../../../../../../../../utils/media/dwc/dwc-archive-file';
import { MediaFile } from '../../../../../../../../utils/media/media-file';
import { parseUnknownMedia } from '../../../../../../../../utils/media/media-utils';
import { XLSXCSV } from '../../../../../../../../utils/media/xlsx/xlsx-file';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/observation/submission/{submissionId}/view');

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      and: [
        {
          validProjectRoles: [PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_VIEWER],
          projectId: Number(req.params.projectId),
          discriminator: 'ProjectRole'
        }
      ]
    };
  }),
  getObservationSubmissionCSVForView()
];

GET.apiDoc = {
  description: 'Fetches an observation submission csv details for a survey.',
  tags: ['observation_submission_csv'],
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
    },
    {
      in: 'path',
      name: 'submissionId',
      schema: {
        type: 'integer',
        minimum: 1
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
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  title: 'Observation submission CSV data',
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string'
                    },
                    headers: {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    },
                    rows: {
                      type: 'array',
                      items: {
                        type: 'array',
                        items: {
                          nullable: true
                        }
                      }
                    }
                  }
                }
              }
            }
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

export function getObservationSubmissionCSVForView(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'Get observation submission csv details', message: 'params', req_params: req.params });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const occurrenceService = new OccurrenceService(connection);

      const result = await occurrenceService.getOccurrenceSubmission(Number(req.params.submissionId));

      await connection.commit();

      const fileName = (result && result.input_file_name) || '';

      const s3Key = generateS3FileKey({
        projectId: Number(req.params.projectId),
        surveyId: Number(req.params.surveyId),
        submissionId: Number(req.params.submissionId),
        fileName
      });

      const s3File = await getFileFromS3(s3Key);

      if (!s3File) {
        throw new HTTP500('Failed to retrieve file from S3');
      }

      const parsedMedia = parseUnknownMedia(s3File);

      if (!parsedMedia) {
        throw new HTTP400('Failed to parse submission, file was empty');
      }

      let worksheets;
      const data = [];

      // Get the worksheets for the file based on type
      if (parsedMedia instanceof MediaFile) {
        // xlsx csv
        const xlsxCsv = new XLSXCSV(parsedMedia);

        worksheets = xlsxCsv.workbook.worksheets;
      } else {
        // dwc archive
        const dwcArchive = new DWCArchive(parsedMedia);

        worksheets = dwcArchive.worksheets;
      }

      for (const [key] of Object.entries(worksheets)) {
        const dataItem = {
          name: key,
          headers: worksheets[key]?.getHeaders(),
          rows: worksheets[key]?.getRows()
        };

        data.push(dataItem);
      }

      return res.status(200).json({ data });
    } catch (error) {
      defaultLog.error({ label: 'getObservationSubmissionCSVForView', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
