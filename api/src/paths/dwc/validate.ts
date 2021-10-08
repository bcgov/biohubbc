import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../../constants/status';
import { getDBConnection, IDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/CustomError';
import { prepDWCArchive } from '../../paths-handlers/dwc';
import { getS3File } from '../../paths-handlers/file';
import {
  getOccurrenceSubmission,
  getOccurrenceSubmissionInputS3Key,
  getValidationRules,
  insertSubmissionMessage,
  insertSubmissionStatus,
  persistValidationResults,
  sendSuccessResponse
} from '../../paths-handlers/occurrence-submission';
import { updateSurveyOccurrenceSubmissionSQL } from '../../queries/survey/survey-occurrence-queries';
import { getLogger } from '../../utils/logger';
import { ICsvState } from '../../utils/media/csv/csv-file';
import { DWCArchive } from '../../utils/media/dwc/dwc-archive-file';
import { IMediaState } from '../../utils/media/media-file';
import { ValidationSchemaParser } from '../../utils/media/validation/validation-schema-parser';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('paths/dwc/validate');

export const POST: Operation = [
  logRequest('paths/dwc/validate', 'POST'),
  getOccurrenceSubmission(),
  getOccurrenceSubmissionInputS3Key(),
  getS3File(),
  prepDWCArchive(),
  persistParseErrors(),
  getValidationSchema(),
  getValidationRules(),
  validateDWCArchive(),
  persistValidationResults(),
  updateOccurrenceSubmission,
  sendSuccessResponse()
];

export const getValidateAPIDoc = (basicDescription: string, successDescription: string, tags: string[]) => {
  return {
    description: basicDescription,
    tags: tags,
    security: [
      {
        Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
      }
    ],
    requestBody: {
      description: 'Request body',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['occurrence_submission_id'],
            properties: {
              occurrence_submission_id: {
                description: 'A survey occurrence submission ID',
                type: 'number',
                example: 1
              }
            }
          }
        }
      }
    },
    responses: {
      200: {
        description: successDescription,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string'
                },
                reason: {
                  type: 'string'
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
};

POST.apiDoc = {
  ...getValidateAPIDoc(
    'Validates a Darwin Core (DWC) Archive survey observation submission.',
    'Validate Darwin Core (DWC) Archive survey observation submission OK',
    ['survey', 'observation', 'dwc']
  )
};

export function persistParseErrors(): RequestHandler {
  return async (req, res, next) => {
    const parseError = req['parseError'];

    if (!parseError) {
      // no errors to persist, skip to next step
      return next();
    }

    defaultLog.debug({ label: 'persistParseErrors', message: 'parseError', parseError });

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const submissionStatusId = await insertSubmissionStatus(
        req.body.occurrence_submission_id,
        SUBMISSION_STATUS_TYPE.REJECTED,
        connection
      );

      await insertSubmissionMessage(
        submissionStatusId,
        SUBMISSION_MESSAGE_TYPE.ERROR,
        parseError,
        'Miscellaneous',
        connection
      );

      await connection.commit();

      // archive is not parsable, don't continue to next step and return early
      return res.status(200).json({ status: 'failed' });
    } catch (error) {
      defaultLog.error({ label: 'persistParseErrors', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

function getValidationSchema(): RequestHandler {
  return async (req, res, next) => {
    req['validationSchema'] = {};

    next();
  };
}

function validateDWCArchive(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'validateDWCArchive', message: 'dwcArchive' });

    try {
      const dwcArchive: DWCArchive = req['dwcArchive'];

      const validationSchemaParser: ValidationSchemaParser = req['validationSchemaParser'];

      const mediaState: IMediaState = dwcArchive.isMediaValid(validationSchemaParser);

      req['mediaState'] = mediaState;

      if (!mediaState.isValid) {
        // The file itself is invalid, skip remaining validation
        return next();
      }

      const csvState: ICsvState[] = dwcArchive.isContentValid(validationSchemaParser);

      req['csvState'] = csvState;

      next();
    } catch (error) {
      defaultLog.error({ label: 'validateDWCArchive', message: 'error', error });
      throw error;
    }
  };
}

function updateOccurrenceSubmission(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'updateOccurrenceSubmission', message: 'Update output file name and output key' });

    const dwcArchive: DWCArchive = req['dwcArchive'];
    const inputFileName = dwcArchive.rawFile.name;
    const s3Key: string = req['s3Key'];

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      // Update occurrence submission record to include the DWC output file name and s3 key (which in this case are the
      // same as the input file name and s3 key, as it is already a DWC zip)
      await updateSurveyOccurrenceSubmissionWithOutputKey(
        req.body.occurrence_submission_id,
        inputFileName,
        s3Key,
        connection
      );

      await connection.commit();

      next();
    } catch (error) {
      defaultLog.debug({ label: 'updateOccurrenceSubmission', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Update existing `occurrence_submission` record with outputKey and outputFileName.
 *
 * @param {number} submissionId
 * @param {string} outputFileName
 * @param {string} outputKey
 * @param {IDBConnection} connection
 * @return {*}  {Promise<void>}
 */
export const updateSurveyOccurrenceSubmissionWithOutputKey = async (
  submissionId: number,
  outputFileName: string,
  outputKey: string,
  connection: IDBConnection
): Promise<any> => {
  const updateSqlStatement = updateSurveyOccurrenceSubmissionSQL({ submissionId, outputFileName, outputKey });

  if (!updateSqlStatement) {
    throw new HTTP400('Failed to build SQL update statement');
  }

  const updateResponse = await connection.query(updateSqlStatement.text, updateSqlStatement.values);

  if (!updateResponse || !updateResponse.rowCount) {
    throw new HTTP400('Failed to update survey occurrence submission record');
  }

  return updateResponse;
};
