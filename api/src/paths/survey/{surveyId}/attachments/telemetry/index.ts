import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SURVEY_ROLE, SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection } from '../../../../../database/db';
import { HTTP400 } from '../../../../../errors/http-error';
import { fileSchema } from '../../../../../openapi/schemas/file';
import { authorizeRequestHandler } from '../../../../../request-handlers/security/authorization';
import { AttachmentService } from '../../../../../services/attachment-service';
import { validateGetKeyDataTelementryCredentialFile } from '../../../../../services/telemetry-services/telemetry-utils';
import { TelemetryVectronicService } from '../../../../../services/telemetry-services/telemetry-vectronic-service';
import { uploadFileToS3 } from '../../../../../utils/file-utils';
import { getLogger } from '../../../../../utils/logger';
import { getFileFromRequest } from '../../../../../utils/request';

const defaultLog = getLogger('/api/project/{projectId}/survey/{surveyId}/attachments/telemetry');

export const POST: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  postSurveyTelemetryCredentialAttachment()
];

POST.apiDoc = {
  description: 'Upload a survey-specific telemetry device credential file.',
  tags: ['attachment'],
  security: [
    {
      Bearer: []
    }
  ],
  parameters: [
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
      name: 'projectId',
      schema: {
        type: 'integer',
        minimum: 1
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Telemetry device credential file upload post request object.',
    required: true,
    content: {
      'multipart/form-data': {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['media'],
          properties: {
            media: {
              description: 'Telemetry device credential file.',
              type: 'array',
              minItems: 1,
              maxItems: 1,
              items: fileSchema
            }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Telemetry device credential file upload response.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['survey_telemetry_credential_attachment_id'],
            properties: {
              survey_telemetry_credential_attachment_id: {
                type: 'integer',
                minimum: 1
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

/**
 * Handles the request to upload and import telemetry device credential files (ex: keyx files).
 *
 * @returns {RequestHandler}
 */
export function postSurveyTelemetryCredentialAttachment(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req.keycloak_token);
    try {
      const rawMediaFile = getFileFromRequest(req);

      defaultLog.debug({
        label: 'postSurveyTelemetryCredentialAttachment',
        message: 'files',
        files: { ...rawMediaFile, buffer: 'Too big to print' }
      });

      const telemetryVectronicService = new TelemetryVectronicService(connection);
      const isTelemetryCredentialFile = await validateGetKeyDataTelementryCredentialFile(
        rawMediaFile,
        telemetryVectronicService
      );
      if (isTelemetryCredentialFile.error) {
        throw new HTTP400(isTelemetryCredentialFile.error);
      }

      await connection.open();

      // Insert telemetry credential file records in SIMS tables
      const attachmentService = new AttachmentService(connection);
      const upsertResult = await attachmentService.upsertSurveyTelemetryCredentialAttachment(
        rawMediaFile,

        Number(req.params.surveyId),
        isTelemetryCredentialFile
      );

      // Upload telemetry credential file to SIMS S3 Storage
      const metadata = {
        filename: rawMediaFile.originalname,
        username: req.keycloak_token?.preferred_username ?? '',
        email: req.keycloak_token?.email ?? ''
      };
      if (upsertResult.key) {
        await uploadFileToS3(rawMediaFile, upsertResult.key, metadata);
      }

      await connection.commit();

      return res.status(201).json({
        survey_telemetry_credential_attachment_id: upsertResult.survey_telemetry_credential_attachment_id
      });
    } catch (error) {
      defaultLog.error({ label: 'postSurveyTelemetryCredentialAttachment', message: 'error', error });

      // The rollback connection method triggers an exception if the connection is not open
      // This exception error message is the one that bubbles up to the front end and not the intended error set when throwing HTTP400 exception
      // Added to connection isConnectionOpen to rollback only when the connection has been opened
      if (connection.isConnectionOpen()) {
        await connection.rollback();
      }

      throw error;
    } finally {
      connection.release();
    }
  };
}

export const GET: Operation = [
  authorizeRequestHandler((req) => {
    return {
      or: [
        {
          validSurveyRoles: [SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR],
          surveyId: Number(req.params.surveyId),
          discriminator: 'SurveyRole'
        },
        {
          validSystemRoles: [SYSTEM_ROLE.DATA_ADMINISTRATOR],
          discriminator: 'SystemRole'
        }
      ]
    };
  }),
  getSurveyTelemetryCredentialAttachments()
];

GET.apiDoc = {
  description: 'Fetches a list of telemetry attachments of a survey.',
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
      description: 'Survey get response file description array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            additionalProperties: false,
            required: ['telemetryAttachments'],
            properties: {
              telemetryAttachments: {
                description: 'List of telemetry attachments.',
                type: 'array',
                items: {
                  description: 'Survey attachment data with supplementary data',
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'survey_telemetry_credential_attachment_id',
                    'uuid',
                    'file_name',
                    'file_type',
                    'file_size',
                    'create_date',
                    'update_date',
                    'title',
                    'description',
                    'key'
                  ],
                  properties: {
                    survey_telemetry_credential_attachment_id: {
                      description: 'Attachment id',
                      type: 'integer',
                      minimum: 1
                    },
                    uuid: {
                      description: 'Attachment UUID',
                      type: 'string',
                      format: 'uuid'
                    },
                    file_name: {
                      description: 'Attachment file name',
                      type: 'string'
                    },
                    file_type: {
                      description: 'Attachment file type',
                      type: 'string'
                    },
                    file_size: {
                      description: 'Attachment file size',
                      type: 'number'
                    },
                    create_date: {
                      description: 'Attachment create date',
                      type: 'string'
                    },
                    update_date: {
                      description: 'Attachment update date',
                      type: 'string',
                      nullable: true
                    },
                    title: {
                      description: 'Attachment title',
                      type: 'string',
                      nullable: true
                    },
                    description: {
                      description: 'Attachment description',
                      type: 'string',
                      nullable: true
                    },
                    key: {
                      description: 'Attachment S3 key',
                      type: 'string'
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

/**
 * Fetches a list of telemetry device credential attachments for a survey.
 *
 * @export
 * @return {*}  {RequestHandler}
 */
export function getSurveyTelemetryCredentialAttachments(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'getSurveyTelemetryCredentialAttachments', message: 'params', req_params: req.params });

    const connection = getDBConnection(req.keycloak_token);
    const surveyId = Number(req.params.surveyId);

    try {
      await connection.open();

      const attachmentService = new AttachmentService(connection);

      const telemetryAttachments = await attachmentService.getSurveyTelemetryCredentialAttachments(surveyId);

      await connection.commit();

      return res.status(200).json({ telemetryAttachments });
    } catch (error) {
      defaultLog.error({ label: 'getSurveyTelemetryCredentialAttachments', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}
