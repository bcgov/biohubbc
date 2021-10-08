import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SYSTEM_ROLE } from '../../constants/roles';
import { getDBConnection, IDBConnection } from '../../database/db';
import { HTTP400 } from '../../errors/CustomError';
import { PostOccurrence } from '../../models/occurrence-create';
import { prepDWCArchive } from '../../paths-handlers/dwc';
import { getS3File } from '../../paths-handlers/file';
import { getOccurrenceSubmission, sendSuccessResponse } from '../../paths-handlers/occurrence-submission';
import { postOccurrenceSQL } from '../../queries/occurrence/occurrence-create-queries';
import { getLogger } from '../../utils/logger';
import { DWCArchive } from '../../utils/media/dwc/dwc-archive-file';
import { logRequest } from '../../utils/path-utils';

const defaultLog = getLogger('paths/dwc/scrape-occurrences');

export const POST: Operation = [
  logRequest('paths/dwc/scrape-occurrences', 'POST'),
  getOccurrenceSubmission(),
  getSubmissionOutputS3Key(),
  getS3File(),
  prepDWCArchive(),
  scrapeAndUploadOccurrences(),
  sendSuccessResponse()
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

export function getSubmissionOutputS3Key(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'getSubmissionOutputS3Key', message: 'params', files: req.body });
    const occurrence_submission = req['occurrence_submission'];

    req['s3Key'] = occurrence_submission.output_key;

    next();
  };
}

export function scrapeAndUploadOccurrences(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'scrapeAndUploadOccurrences', message: 'params', files: req.body });

    const occurrenceSubmissionId = req.body.occurrence_submission_id;
    const dwcArchive: DWCArchive = req['dwcArchive'];

    const connection = getDBConnection(req['keycloak_token']);

    try {
      await connection.open();

      const {
        occurrenceRows,
        occurrenceIdHeader,
        associatedTaxaHeader,
        eventRows,
        lifeStageHeader,
        individualCountHeader,
        organismQuantityHeader,
        organismQuantityTypeHeader,
        occurrenceHeaders,
        eventIdHeader,
        eventDateHeader,
        eventVerbatimCoordinatesHeader,
        taxonRows,
        taxonIdHeader,
        vernacularNameHeader
      } = getHeadersAndRowsFromFile(dwcArchive);

      const scrapedOccurrences = occurrenceRows?.map((row: any) => {
        const occurrenceId = row[occurrenceIdHeader];
        const associatedTaxa = row[associatedTaxaHeader];
        const lifeStage = row[lifeStageHeader];
        const individualCount = row[individualCountHeader];
        const organismQuantity = row[organismQuantityHeader];
        const organismQuantityType = row[organismQuantityTypeHeader];

        const data = { headers: occurrenceHeaders, rows: row };

        let verbatimCoordinates;
        let eventDate;

        eventRows?.forEach((eventRow: any) => {
          if (eventRow[eventIdHeader] === occurrenceId) {
            eventDate = eventRow[eventDateHeader];
            verbatimCoordinates = eventRow[eventVerbatimCoordinatesHeader];
          }
        });

        let vernacularName;

        taxonRows?.forEach((taxonRow: any) => {
          if (taxonRow[taxonIdHeader] === occurrenceId) {
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

      next();
    } catch (error) {
      defaultLog.error({ label: 'scrapeAndUploadOccurrences', message: 'error', error });
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
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
  scrapedOccurrence: PostOccurrence,
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

const getHeadersAndRowsFromFile = (dwcArchive: DWCArchive) => {
  const eventHeaders = dwcArchive.worksheets.event?.getHeaders();
  const eventRows = dwcArchive.worksheets.event?.getRows();

  const eventIdHeader = eventHeaders?.indexOf('id') as number;
  const eventVerbatimCoordinatesHeader = eventHeaders?.indexOf('verbatimCoordinates') as number;
  const eventDateHeader = eventHeaders?.indexOf('eventDate') as number;

  const occurrenceHeaders = dwcArchive.worksheets.occurrence?.getHeaders();
  const occurrenceRows = dwcArchive.worksheets.occurrence?.getRows();

  const occurrenceIdHeader = occurrenceHeaders?.indexOf('id') as number;
  const associatedTaxaHeader = occurrenceHeaders?.indexOf('associatedTaxa') as number;
  const lifeStageHeader = occurrenceHeaders?.indexOf('lifeStage') as number;
  const individualCountHeader = occurrenceHeaders?.indexOf('individualCount') as number;
  const organismQuantityHeader = occurrenceHeaders?.indexOf('organismQuantity') as number;
  const organismQuantityTypeHeader = occurrenceHeaders?.indexOf('organismQuantityType') as number;

  const taxonHeaders = dwcArchive.worksheets.taxon?.getHeaders();
  const taxonRows = dwcArchive.worksheets.taxon?.getRows();
  const taxonIdHeader = taxonHeaders?.indexOf('id') as number;
  const vernacularNameHeader = taxonHeaders?.indexOf('vernacularName') as number;

  return {
    occurrenceRows,
    occurrenceIdHeader,
    associatedTaxaHeader,
    eventRows,
    lifeStageHeader,
    individualCountHeader,
    organismQuantityHeader,
    organismQuantityTypeHeader,
    occurrenceHeaders,
    eventIdHeader,
    eventDateHeader,
    eventVerbatimCoordinatesHeader,
    taxonRows,
    taxonIdHeader,
    vernacularNameHeader
  };
};
