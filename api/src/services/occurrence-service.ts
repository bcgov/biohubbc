import { IDBConnection } from '../database/db';
import { HTTP400 } from '../errors/custom-error';
import { PostOccurrence } from '../models/occurrence-create';
import { queries } from '../queries/queries';
import { IOccurrenceSubmission, OccurrenceRepository } from '../repositories/occurrence-repository';
import { DBService } from './service';

export class OccurrenceService extends DBService {
  occurrenceRepository: OccurrenceRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.occurrenceRepository = new OccurrenceRepository(connection);
  }

  async getOccurrenceSubmission(submissionId: number): Promise<IOccurrenceSubmission | null> {
    return this.occurrenceRepository.getOccurrenceSubmission(submissionId);
  }

  /**
 * Upload scraped occurrence data.
 *
 * @param {number} occurrenceSubmissionId
 * @param {any} scrapedOccurrence
 * @return {*}
 */
  async uploadScrapedOccurrence(occurrenceSubmissionId: number, scrapedOccurrence: PostOccurrence) {
    const sqlStatement = queries.occurrence.postOccurrenceSQL(occurrenceSubmissionId, scrapedOccurrence);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL post statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new HTTP400('Failed to insert occurrence data');
    }
  }
}
