import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import moment from 'moment';
import { SYSTEM_ROLE } from '../../../../../constants/roles';
import { getDBConnection, IDBConnection } from '../../../../../database/db';
import { ensureCustomError, HTTP400, HTTP500 } from '../../../../../errors/CustomError';
import { PostOccurrence } from '../../../../../models/occurrence-create';
import { surveyIdResponseObject } from '../../../../../openapi/schemas/survey';
import { postOccurrenceSQL } from '../../../../../queries/occurrence/occurrence-create-queries';
import xlsx from 'xlsx';
import {
  deleteSurveyOccurrencesSQL,
  getLatestSurveyOccurrenceSubmissionSQL
} from '../../../../../queries/survey/survey-occurrence-queries';
import { updateSurveyPublishStatusSQL } from '../../../../../queries/survey/survey-update-queries';
import { getFileFromS3 } from '../../../../../utils/file-utils';
import { getLogger } from '../../../../../utils/logger';
import { DWCArchive } from '../../../../../utils/media/csv/dwc/dwc-archive-file';
import { parseUnknownMedia } from '../../../../../utils/media/media-utils';
import { logRequest } from '../../../../../utils/path-utils';

const defaultLog = getLogger('paths/project/{projectId}/survey/{surveyId}/publish');

export const PUT: Operation = [
  logRequest('paths/project/{projectId}/survey/{surveyId}/publish', 'PUT'),
  publishSurveyAndOccurrences()
];

PUT.apiDoc = {
  description: 'Publish or unpublish a survey.',
  tags: ['survey'],
  security: [
    {
      Bearer: [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]
    }
  ],
  parameters: [
    {
      in: 'path',
      name: 'surveyId',
      schema: {
        type: 'number'
      },
      required: true
    }
  ],
  requestBody: {
    description: 'Publish or unpublish put request object.',
    content: {
      'application/json': {
        schema: {
          title: 'Publish request object',
          type: 'object',
          required: ['publish'],
          properties: {
            publish: {
              title: 'publish?',
              type: 'boolean'
            }
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Survey publish request completed successfully.',
      content: {
        'application/json': {
          schema: {
            // TODO is there any return value? or is it just an HTTP status with no content?
            ...(surveyIdResponseObject as object)
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

/**
 * Publish survey and occurrences.
 *
 * @returns {RequestHandler}
 */
export function publishSurveyAndOccurrences(): RequestHandler {
  return async (req, res) => {
    const connection = getDBConnection(req['keycloak_token']);

    try {
      const surveyId = Number(req.params.surveyId);

      if (!surveyId) {
        throw new HTTP400('Missing required path parameter: surveyId');
      }

      if (!req.body) {
        throw new HTTP400('Missing request body');
      }

      const publish: boolean = req.body.publish;

      if (publish === undefined) {
        throw new HTTP400('Missing publish flag in request body');
      }

      await connection.open();

      if (publish) {
        // TODO any validation at this stage?
        // TODO apply security?
        await insertOccurrences(surveyId, connection);
      } else {
        await deleteOccurrences(surveyId, connection);
      }

      await publishSurvey(surveyId, publish, connection);

      return res.status(200).send();
    } catch (error) {
      defaultLog.debug({ label: 'publishSurveyAndOccurrences', message: 'error', error });
      await connection.rollback();
      throw ensureCustomError(error);
    } finally {
      connection.release();
    }
  };
}

/**
 * Fetch, scrape, and insert occurrence records for a survey.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 */
export const insertOccurrences = async (surveyId: number, connection: IDBConnection) => {
  const occurrenceSubmission = await getSurveyOccurrenceSubmission(surveyId, connection);
  // TODO Check if submission is valid
  // TODO if not valid, reject publishing?
  // TODO if valid, apply security, update status?

  const s3Object = await getFileFromS3(occurrenceSubmission.key);

  const mediaFiles = parseUnknownMedia(s3Object);

  const dwcArchive = new DWCArchive(mediaFiles);

  await uploadDWCArchiveOccurrences(occurrenceSubmission.id, dwcArchive, connection);
};

/**
 * Delete all occurrences for a survey.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 */
export const deleteOccurrences = async (surveyId: number, connection: IDBConnection) => {
  const occurrenceSubmission = await getSurveyOccurrenceSubmission(surveyId, connection);

  const sqlStatement = deleteSurveyOccurrencesSQL(occurrenceSubmission.id);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build delete survey occurrences SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response) {
    throw new HTTP500('Failed to delete survey occurrences');
  }
};

/**
 * Update a survey, marking it as published/unpublished.
 *
 * @returns {RequestHandler}
 */
export const publishSurvey = async (surveyId: number, publish: boolean, connection: IDBConnection) => {
  const sqlStatement = updateSurveyPublishStatusSQL(surveyId, publish);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build survey publish SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result) {
    throw new HTTP500('Failed to update survey publish status');
  }
};

/**
 * Get the latest survey occurrence submission.
 *
 * @param {number} surveyId
 * @param {IDBConnection} connection
 * @return {*}
 */
export const getSurveyOccurrenceSubmission = async (surveyId: number, connection: IDBConnection) => {
  const sqlStatement = getLatestSurveyOccurrenceSubmissionSQL(surveyId);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build get survey occurrence submission SQL statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP500('Failed to get survey occurrence submissions');
  }

  return response.rows[0];
};

// TODO needs improvement
export const uploadDWCArchiveOccurrences = async (
  occurrenceSubmissionId: number,
  file: DWCArchive,
  connection: IDBConnection
) => {
  defaultLog.debug({ label: 'uploadDWCArchiveOccurrences', message: 'occurrenceSubmissionId', occurrenceSubmissionId });

  const eventHeaders = file.worksheets.event?.getHeaders();
  const eventRows = file.worksheets.event?.getRows();

  const eventEventIdHeader = eventHeaders?.indexOf('eventID') as number;
  const eventVerbatimCoordinatesHeader = eventHeaders?.indexOf('verbatimCoordinates') as number;
  const eventDateHeader = eventHeaders?.indexOf('eventDate') as number;

  const occurrenceHeaders = file.worksheets.occurrence?.getHeaders();
  const occurrenceRows = file.worksheets.occurrence?.getRows();

  const taxonHeaders = file.worksheets.taxon?.getHeaders();
  const taxonRows = file.worksheets.taxon?.getRows();
  const taxonEventIdHeader = taxonHeaders?.indexOf('eventID') as number;
  const vernacularNameHeader = taxonHeaders?.indexOf('vernacularName') as number;

  const occurrenceEventIdHeader = occurrenceHeaders?.indexOf('eventID') as number;
  const associatedTaxaHeader = occurrenceHeaders?.indexOf('associatedTaxa') as number;
  const lifeStageHeader = occurrenceHeaders?.indexOf('lifeStage') as number;
  const individualCountHeader = occurrenceHeaders?.indexOf('individualCount') as number;
  const organismQuantityHeader = occurrenceHeaders?.indexOf('organismQuantity') as number;
  const organismQuantityTypeHeader = occurrenceHeaders?.indexOf('organismQuantityType') as number;

  const scrapedOccurrences = occurrenceRows?.map((row) => {
    const occurrenceEventId = row[occurrenceEventIdHeader];
    const associatedTaxa = row[associatedTaxaHeader];
    const lifeStage = row[lifeStageHeader];
    const individualCount = row[individualCountHeader];
    const organismQuantity = row[organismQuantityHeader];
    const organismQuantityType = row[organismQuantityTypeHeader];

    const data = { headers: occurrenceHeaders, rows: row };

    let verbatimCoordinates;
    let eventDate;

    eventRows?.forEach((row) => {
      if (row[eventEventIdHeader] === occurrenceEventId) {
        const eventMoment = convertExcelDateToMoment(row[eventDateHeader] as number);
        eventDate = eventMoment.toISOString();

        verbatimCoordinates = row[eventVerbatimCoordinatesHeader];
      }
    });

    let vernacularName;

    taxonRows?.forEach((row) => {
      if (row[taxonEventIdHeader] === occurrenceEventId) {
        vernacularName = row[vernacularNameHeader];
      }
    });

    return new PostOccurrence({
      associatedTaxa: associatedTaxa,
      lifeStage: lifeStage,
      individualCount: individualCount,
      vernacularName: vernacularName,
      data,
      verbatimCoordinates: verbatimCoordinates,
      organismQuantity: organismQuantity,
      organismQuantityType: organismQuantityType,
      eventDate: eventDate
    });
  });

  return Promise.all(
    scrapedOccurrences.map(async (scrapedOccurrence) => {
      const sqlStatement = postOccurrenceSQL(occurrenceSubmissionId, scrapedOccurrence);

      if (!sqlStatement) {
        throw new HTTP400('Failed to build SQL post statement');
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      if (!response || !response.rowCount) {
        throw new HTTP400('Failed to insert occurrence data');
      }
    })
  );
};

export const convertExcelDateToMoment = (excelDateNumber: number): moment.Moment => {
  const ssfDate = xlsx.SSF.parse_date_code(excelDateNumber);

  return moment({
    year: ssfDate.y,
    month: ssfDate.m,
    day: ssfDate.d,
    hour: ssfDate.H,
    minute: ssfDate.M,
    second: ssfDate.S
  });
};
