import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { IDBConnection } from '../database/db';
import { PostOccurrence } from '../models/occurrence-create';
import { IOccurrenceSubmission, OccurrenceRepository } from '../repositories/occurrence-repository';
import { DWCArchive } from '../utils/media/dwc/dwc-archive-file';
import { SubmissionErrorFromMessageType } from '../utils/submission-error';
import { DBService } from './db-service';

export class OccurrenceService extends DBService {
  occurrenceRepository: OccurrenceRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.occurrenceRepository = new OccurrenceRepository(connection);
  }

  /**
   * Builds object full of headers expected for a DwC file
   *
   * @param {DWCArchive} dwcArchive
   * @return {*} {any}
   */
  getHeadersAndRowsFromDWCArchive(dwcArchive: DWCArchive): any {
    const eventHeaders = dwcArchive.worksheets.event?.getHeaders();
    const eventRows = dwcArchive.worksheets.event?.getRows();

    const eventIdHeader = eventHeaders?.indexOf('id') as number;
    const eventVerbatimCoordinatesHeader = eventHeaders?.indexOf('verbatimCoordinates') as number;
    const eventDateHeader = eventHeaders?.indexOf('eventDate') as number;

    const occurrenceHeaders = dwcArchive.worksheets.occurrence?.getHeaders();
    const occurrenceRows = dwcArchive.worksheets.occurrence?.getRows();

    const occurrenceIdHeader = occurrenceHeaders?.indexOf('id') as number;
    const associatedTaxaHeader = occurrenceHeaders?.indexOf('taxonID') as number;
    const lifeStageHeader = occurrenceHeaders?.indexOf('lifeStage') as number;
    const sexHeader = occurrenceHeaders?.indexOf('sex') as number;
    const individualCountHeader = occurrenceHeaders?.indexOf('individualCount') as number;
    const organismQuantityHeader = occurrenceHeaders?.indexOf('organismQuantity') as number;
    const organismQuantityTypeHeader = occurrenceHeaders?.indexOf('organismQuantityType') as number;

    const taxonHeaders = dwcArchive.worksheets.taxon?.getHeaders();
    const taxonRows = dwcArchive.worksheets.taxon?.getRows();
    const taxonIdHeader = taxonHeaders?.indexOf('taxonID') as number;
    const vernacularNameHeader = taxonHeaders?.indexOf('vernacularName') as number;

    return {
      occurrenceRows,
      occurrenceIdHeader,
      associatedTaxaHeader,
      eventRows,
      lifeStageHeader,
      sexHeader,
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
  }

  /**
   * Scrapes occurrences from a DwC file
   *
   * @param {DWCArchive} archive
   * @return {PostOccurrence[]} {PostOccurrence[]}
   */
  scrapeArchiveForOccurrences(archive: DWCArchive): PostOccurrence[] {
    const {
      occurrenceRows,
      occurrenceIdHeader,
      associatedTaxaHeader,
      eventRows,
      lifeStageHeader,
      sexHeader,
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
    } = this.getHeadersAndRowsFromDWCArchive(archive);
    console.log("__ SCRAPING ARCHIVE FOR OCCURRENCES __")
    return (
      occurrenceRows?.map((row: any) => {
        const occurrenceId = row[occurrenceIdHeader];
        const associatedTaxa = row[associatedTaxaHeader];
        const lifeStage = row[lifeStageHeader];
        const sex = row[sexHeader];
        const individualCount = row[individualCountHeader];
        const organismQuantity = row[organismQuantityHeader];
        const organismQuantityType = row[organismQuantityTypeHeader];

        const data = { headers: occurrenceHeaders, rows: row };

        let verbatimCoordinates;
        // TODO event date is not formatted properly...
        // ok so what are we going to be doing with this thing...
        let eventDate;
        let vernacularName;

        eventRows?.forEach((eventRow: any) => {
          if (eventRow[eventIdHeader] === occurrenceId) {
            // console.log(eventRow)
            eventDate = eventRow[eventDateHeader];
            verbatimCoordinates = eventRow[eventVerbatimCoordinatesHeader];
          }
        });

        taxonRows?.forEach((taxonRow: any) => {
          if (taxonRow[taxonIdHeader] === occurrenceId) {
            vernacularName = taxonRow[vernacularNameHeader];
          }
        });
        // console.log("__--__")
        console.log(`Date: ${eventDate}`)
        // console.log(row)
        return new PostOccurrence({
          associatedTaxa: associatedTaxa,
          lifeStage: lifeStage,
          sex: sex,
          individualCount: individualCount,
          vernacularName: vernacularName,
          data,
          verbatimCoordinates: verbatimCoordinates,
          organismQuantity: organismQuantity,
          organismQuantityType: organismQuantityType,
          eventDate: new Date()
        });
      }) || []
    );
  }

  /**
   *  Scrapes a DwC Archive and inserts `occurrence` for a `occurrence_submission`
   *
   * @param {number} submissionId
   * @param {DWCArchive} archive
   * @return {*}
   */
  async scrapeAndUploadOccurrences(submissionId: number, archive: DWCArchive) {
    try {
      const scrapedOccurrences = this.scrapeArchiveForOccurrences(archive);
      console.log("_____________________")
      // console.log(scrapedOccurrences)
      this.insertPostOccurrences(submissionId, scrapedOccurrences);
    } catch (error) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION);
    }
  }

  /**
   *  Gets a `occurrence_submission` for an id.
   *
   * @param {number} submissionId
   * @return {*} {Promise<IOccurrenceSubmission | null>}
   */
  async getOccurrenceSubmission(submissionId: number): Promise<IOccurrenceSubmission> {
    return this.occurrenceRepository.getOccurrenceSubmission(submissionId);
  }

  /**
   * Inserts a list of `occurrence` for a submission.
   *
   * @param {number} submissionId
   * @param {PostOccurrence[]} postOccurrences
   * @return {*}
   */
  async insertPostOccurrences(submissionId: number, postOccurrences: PostOccurrence[]) {
    await Promise.all(
      postOccurrences?.map((scrapedOccurrence) => {
        this.insertPostOccurrence(submissionId, scrapedOccurrence);
      }) || []
    );
  }

  /**
   * Inserts a `occurrence` for a submission.
   *
   * @param {number} submissionId
   * @param {PostOccurrence} postOccurrence
   * @return {*}
   */
  async insertPostOccurrence(submissionId: number, postOccurrence: PostOccurrence) {
    this.occurrenceRepository.insertPostOccurrences(submissionId, postOccurrence);
  }

  /**
   * Gets list `occurrence` and maps them for use on a map
   *
   * @param {number} submissionId
   * @return {*} {Promise<any[]>}
   */
  async getOccurrences(submissionId: number): Promise<any[]> {
    const occurrenceData = await this.occurrenceRepository.getOccurrencesForView(submissionId);
    return occurrenceData.map((occurrence) => {
      const feature =
        (occurrence.geometry && { type: 'Feature', geometry: JSON.parse(occurrence.geometry), properties: {} }) || null;

      return {
        geometry: feature,
        taxonId: occurrence.taxonid,
        occurrenceId: occurrence.occurrence_id,
        individualCount: Number(occurrence.individualcount),
        lifeStage: occurrence.lifestage,
        sex: occurrence.sex,
        organismQuantity: Number(occurrence.organismquantity),
        organismQuantityType: occurrence.organismquantitytype,
        vernacularName: occurrence.vernacularname,
        eventDate: occurrence.eventdate
      };
    });
  }

  /**
   * Updates `occurrence_submission` output key field.
   *
   * @param {number} submissionId
   * @param {string} fileName
   * @param {string} key
   * @return {*} {Promise<any>}
   */
  async updateSurveyOccurrenceSubmission(submissionId: number, fileName: string, key: string): Promise<any> {
    return this.occurrenceRepository.updateSurveyOccurrenceSubmissionWithOutputKey(submissionId, fileName, key);
  }

  /**
   * Updates `darwin_core_source` with passed a stringified json object.
   *
   * @param {number} submissionId
   * @param {string} jsonData
   * @return {*} {Promise<number>}
   */
  async updateDWCSourceForOccurrenceSubmission(submissionId: number, jsonData: string): Promise<number> {
    return await this.occurrenceRepository.updateDWCSourceForOccurrenceSubmission(submissionId, jsonData);
  }
}
