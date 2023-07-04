import { IDBConnection } from '../database/db';
import { PostPutDraftObject } from '../models/draft-create';
import { DraftRepository, WebformDraft } from '../repositories/draft-repository';
import { getLogger } from '../utils/logger';
import { DBService } from './db-service';

const defaultLog = getLogger('services/draft-service');

export class DraftService extends DBService {
  draftRepository: DraftRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.draftRepository = new DraftRepository(connection);
  }

  /**
   * Deletes a draft for a given id
   *
   * @param {number} draftId
   * @returns {*} Promise<QueryResult>
   */
  async deleteDraft(draftId: number): Promise<{ webform_draft_id: number }> {
    defaultLog.debug({ label: 'deleteDraft' });
    return this.draftRepository.deleteDraft(draftId);
  }

  /**
   * Returns a WebformDraft for a given draft id
   *
   * @param {number} draftId
   * @returns {*} Promise<WebformDraft>
   */
  async getDraft(draftId: number): Promise<WebformDraft> {
    defaultLog.debug({ label: 'getDraft' });
    return this.draftRepository.getDraft(draftId);
  }

  /**
   * Returns a list of WebformDrafts for a given user id
   *
   * @param {number} systemUserId
   * @returns {*} Promise<WebformDraft[]>
   */
  async getDraftList(systemUserId: number | null): Promise<WebformDraft[]> {
    defaultLog.debug({ label: 'getDraftList' });
    return this.draftRepository.getDraftList(systemUserId);
  }

  /**
   * Creates and returns a new WebformDraft
   *
   * @param {number} systemUserId
   * @param {PostPutDraftObject} postDraftObjectData
   * @returns {*} Promise<WebformDraft>
   */
  async createDraft(systemUserId: number, postDraftObjectData: PostPutDraftObject): Promise<WebformDraft> {
    defaultLog.debug({ label: 'createDraft' });
    return this.draftRepository.createDraft(systemUserId, postDraftObjectData.name, postDraftObjectData.data);
  }

  /**
   * Updates a given draft with new Draft Object
   *
   * @param {number} draftId
   * @param {PostPutDraftObject} postDraftObjectData
   * @returns {*} Promise<WebformDraft>
   */
  async updateDraft(draftId: number, postDraftObjectData: PostPutDraftObject): Promise<WebformDraft> {
    defaultLog.debug({ label: 'updateDraft' });
    return this.draftRepository.updateDraft(draftId, postDraftObjectData.name, postDraftObjectData.data);
  }
}
