import { IDBConnection } from '../database/db';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { getFileFromS3 } from '../utils/file-utils';
import { BctwService, IBctwUser } from './bctw-service';
import { DBService } from './db-service';

export class AttachmentKeyxService extends DBService {
  attachmentRepository: AttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
  }

  /**
   * Inserts a keyx reference for the given attachment ID.
   *
   * @param {number} attachmentId
   * @return {*}
   * @memberof AttachmentKeyxService
   */
  async insertKeyxReference(attachmentId: number) {
    return this.attachmentRepository.insertSurveyAttachmentKeyx(attachmentId);
  }

  /**
   * Processes keyx records.
   * TODO: This can likely be made much more efficient.
   *
   * @param {IBctwUser} user
   * @return {*}  {Promise<void>}
   * @memberof AttachmentKeyxService
   */
  async processKeyxRecords(user: IBctwUser): Promise<void> {
    const bctwService = new BctwService(user);

    // get list of unprocessed records
    const records = await this.attachmentRepository.getSurveyKeyxAttachmentsToProcess();
    // get files from s3
    for (const record of records) {
      const file = await getFileFromS3(record.key);
      await bctwService.uploadKeyX(file, record.key);
      await this.attachmentRepository.updateSurveyAttachmentKeyx(record.survey_attachment_id);
    }
  }
}
