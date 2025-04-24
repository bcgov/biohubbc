import { IDBConnection } from '../database/db';
import { CollectionParticipant, IPostCollectionParticipant } from '../models/collection';
import { SystemUserWithRoles } from '../models/system-user-view';
import { CollectionParticipationRepository } from '../repositories/collection-participation-repository';
import { DBService } from './db-service';

/**
 * Service for managing collections
 */
export class CollectionParticipationService extends DBService {
  collectionParticipationRepository: CollectionParticipationRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.collectionParticipationRepository = new CollectionParticipationRepository(connection);
  }

  /**
   * Get a specific collection participation record
   *
   * @param {number} collectionId
   * @param {number} systemUserId
   * @returns {Promise<(CollectionParticipant & SystemUserWithRoles) | null>}
   * @memberof CollectionParticipationService
   */
  async getCollectionParticipant(
    collectionId: number,
    systemUserId: number
  ): Promise<(CollectionParticipant & SystemUserWithRoles) | null> {
    return this.collectionParticipationRepository.getCollectionParticipant(collectionId, systemUserId);
  }

  /**
   * Get all participants of a collection
   *
   * @param {number} collectionId
   * @returns {Promise<(CollectionParticipant & SystemUserWithRoles)[]>}
   * @memberof CollectionParticipationService
   */
  async getCollectionParticipants(collectionId: number): Promise<(CollectionParticipant & SystemUserWithRoles)[]> {
    return this.collectionParticipationRepository.getCollectionParticipants(collectionId);
  }

  /**
   * Insert a new collection participant
   *
   * @param collectionId
   * @param systemUserId
   * @returns {Promise<void>}
   * @memberof CollectionParticipationService
   */
  async insertCollectionParticipant(collectionId: number, values: IPostCollectionParticipant): Promise<void> {
    return this.collectionParticipationRepository.insertCollectionParticipant(collectionId, values);
  }

  /**
   * Insert a new collection participant
   *
   * @param collectionId
   * @param systemUserId
   * @returns {Promise<void>}
   * @memberof CollectionParticipationService
   */
  async updateCollectionParticipantJob(
    collectionId: number,
    collectionParticipationId: number,
    collectionJobName: string
  ): Promise<void> {
    return this.collectionParticipationRepository.updateCollectionParticipantJob(
      collectionId,
      collectionParticipationId,
      collectionJobName
    );
  }

  /**
   * Remove a participant from a collection
   *
   * @param {number} collectionId
   * @param {number} collectionParticipationId
   * @returns {Promise<void>}
   * @memberof CollectionParticipationService
   */
  async deleteCollectionParticipationRecord(collectionId: number, collectionParticipationId: number): Promise<any> {
    return this.collectionParticipationRepository.deleteCollectionParticipationRecord(
      collectionId,
      collectionParticipationId
    );
  }
}
