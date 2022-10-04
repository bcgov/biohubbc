import { IDBConnection } from '../database/db';
import { PostOccurrence } from '../models/occurrence-create';
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
  
  async insertPostOccurrences(submissionId: number, occurrences: PostOccurrence) {
    this.occurrenceRepository.insertPostOccurrences(submissionId, occurrences)
  }

}
