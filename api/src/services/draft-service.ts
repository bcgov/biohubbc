import { QueryResult } from 'pg';
import { IDBConnection } from '../database/db';
import { PostPutDraftObject } from '../models/draft-create';
import { DraftRepository } from '../repositories/draft-repository';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';

const defaultLog = getLogger('services/draft-service');

export class DraftService extends DBService {
  draftRepository: DraftRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.draftRepository = new DraftRepository(connection);
  }

  async deleteDraft(draftId: number): Promise<QueryResult> {
    return this.draftRepository.deleteDraft(draftId);
  }

  async getSingleDraft(draftId: number): Promise<{ id: number; name: string; data: any }> {
    return this.draftRepository.getSingleDraft(draftId);
  }

  async getDraftList(systemUserId: number | null): Promise<any> {
    defaultLog.debug({ label: 'getDraftList' });
    return this.draftRepository.getDraftList(systemUserId);
  }

  async createDraft(systemUserId: number, postDraftObjectData: PostPutDraftObject): Promise<any> {
    defaultLog.debug({ label: 'createDraft' });
    return this.draftRepository.createDraft(systemUserId, postDraftObjectData.name, postDraftObjectData.data);
  }

  async updateDraft(draftId: number, postDraftObjectData: PostPutDraftObject): Promise<any> {
    defaultLog.debug({ label: 'updateDraft' });
    return this.draftRepository.updateDraft(draftId, postDraftObjectData.name, postDraftObjectData.data);
  }
}
