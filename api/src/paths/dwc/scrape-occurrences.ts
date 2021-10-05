import { getDBConnection, IDBConnection } from '../../database/db';
import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getLogger } from '../../utils/logger';
import { logRequest } from '../../utils/path-utils';
import { getSubmissionFileFromS3, getSubmissionS3Key, prepDWCArchive } from './validate';
import { HTTP400 } from '../../errors/CustomError';
import { postOccurrenceSQL } from '../../queries/occurrence/occurrence-create-queries';
import { PostOccurrence } from '../../models/occurrence-create';
import xlsx from 'xlsx';
import moment from 'moment';

const defaultLog = getLogger('paths/dwc/scrape-occurrences');

export const POST: Operation = [
  logRequest('paths/dwc/scrape-occurrences', 'POST'),
  getSubmissionS3Key(),
  getSubmissionFileFromS3(),
  prepDWCArchive(),
  scrapeAndUploadOccurrences()
];

POST.apiDoc = {
  description: 'Scrape information from file into occurrence table.',
  tags: ['scrape', 'occurrence'],
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
      description: 'Successfully scraped and uploaded occurrence information.'
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

export function scrapeAndUploadOccurrences(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'scrapeAndUploadOccurrences', message: 'params', files: req.body });

    const occurrenceSubmissionId = req.body.occurrence_submission_id;
    const file = req['dwcArchive'];

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const {
        occurrenceRows,
        occurrenceEventIdHeader,
        associatedTaxaHeader,
        eventRows,
        lifeStageHeader,
        individualCountHeader,
        organismQuantityHeader,
        organismQuantityTypeHeader,
        occurrenceHeaders,
        eventEventIdHeader,
        eventDateHeader,
        eventVerbatimCoordinatesHeader,
        taxonRows,
        taxonEventIdHeader,
        vernacularNameHeader
      } = getHeadersAndRowsFromFile(file);

      const scrapedOccurrences = occurrenceRows?.map((row: any) => {
        const occurrenceEventId = row[occurrenceEventIdHeader];
        const associatedTaxa = row[associatedTaxaHeader];
        const lifeStage = row[lifeStageHeader];
        const individualCount = row[individualCountHeader];
        const organismQuantity = row[organismQuantityHeader];
        const organismQuantityType = row[organismQuantityTypeHeader];

        const data = { headers: occurrenceHeaders, rows: row };

        let verbatimCoordinates;
        let eventDate;

        eventRows?.forEach((eventRow: any) => {
          if (eventRow[eventEventIdHeader] === occurrenceEventId) {
            const eventMoment = convertExcelDateToMoment(eventRow[eventDateHeader] as number);
            eventDate = eventMoment.toISOString();

            verbatimCoordinates = eventRow[eventVerbatimCoordinatesHeader];
          }
        });

        let vernacularName;

        taxonRows?.forEach((taxonRow: any) => {
          if (taxonRow[taxonEventIdHeader] === occurrenceEventId) {
            vernacularName = taxonRow[vernacularNameHeader];
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

      await Promise.all(
        scrapedOccurrences?.map(async (scrapedOccurrence: any) => {
          uploadScrapedOccurrence(occurrenceSubmissionId, scrapedOccurrence, connection);
        }) || []
      );

      await connection.commit();

      return res.status(200).send();
    } catch (error) {
      defaultLog.error({ label: 'scrapeAndUploadOccurrences', message: 'error', error });
      throw error;
    }
  };
}

/**
 * Upload scraped occurrence data.
 *
 * @param {number} occurrenceSubmissionId
 * @param {any} scrapedOccurrence
 * @param {IDBConnection} connection
 * @return {*}
 */
export const uploadScrapedOccurrence = async (
  occurrenceSubmissionId: number,
  scrapedOccurrence: any,
  connection: IDBConnection
) => {
  const sqlStatement = postOccurrenceSQL(occurrenceSubmissionId, scrapedOccurrence);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL post statement');
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to insert occurrence data');
  }
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

const getHeadersAndRowsFromFile = (file: any) => {
  const eventHeaders = file.worksheets.event?.getHeaders();
  const eventRows = file.worksheets.event?.getRows();

  const eventEventIdHeader = eventHeaders?.indexOf('eventid') as number;
  const eventVerbatimCoordinatesHeader = eventHeaders?.indexOf('verbatimcoordinates') as number;
  const eventDateHeader = eventHeaders?.indexOf('eventdate') as number;

  const occurrenceHeaders = file.worksheets.occurrence?.getHeaders();
  const occurrenceRows = file.worksheets.occurrence?.getRows();

  const taxonHeaders = file.worksheets.taxon?.getHeaders();
  const taxonRows = file.worksheets.taxon?.getRows();
  const taxonEventIdHeader = taxonHeaders?.indexOf('eventid') as number;
  const vernacularNameHeader = taxonHeaders?.indexOf('vernacularname') as number;

  const occurrenceEventIdHeader = occurrenceHeaders?.indexOf('eventid') as number;
  const associatedTaxaHeader = occurrenceHeaders?.indexOf('associatedtaxa') as number;
  const lifeStageHeader = occurrenceHeaders?.indexOf('lifestage') as number;
  const individualCountHeader = occurrenceHeaders?.indexOf('individualcount') as number;
  const organismQuantityHeader = occurrenceHeaders?.indexOf('organismquantity') as number;
  const organismQuantityTypeHeader = occurrenceHeaders?.indexOf('organismquantitytype') as number;

  return {
    occurrenceRows,
    occurrenceEventIdHeader,
    associatedTaxaHeader,
    eventRows,
    lifeStageHeader,
    individualCountHeader,
    organismQuantityHeader,
    organismQuantityTypeHeader,
    occurrenceHeaders,
    eventEventIdHeader,
    eventDateHeader,
    eventVerbatimCoordinatesHeader,
    taxonRows,
    taxonEventIdHeader,
    vernacularNameHeader
  };
};
