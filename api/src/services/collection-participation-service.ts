import { IDBConnection } from '../database/db';
import {
  CollectionParticipant,
  ICollectionParticipantsAdvancedFilters,
  IPostCollectionParticipant
} from '../models/collection';
import { SystemUserWithRoles } from '../models/system-user-view';
import { CollectionMemberRepository } from '../repositories/collection-participation-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';

/**
 * Service for managing collections
 */
export class CollectionMemberService extends DBService {
  collectionParticipationRepository: CollectionMemberRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.collectionParticipationRepository = new CollectionMemberRepository(connection);
  }

  /**
   * Get a specific collection participation record
   *
   * @param {number} collectionId
   * @param {number} systemUserId
   * @returns {Promise<(CollectionParticipant & SystemUserWithRoles) | null>}
   * @memberof CollectionMemberService
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
   * @param {ICollectionParticipantsAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} pagination
   * @returns {Promise<(CollectionParticipant & SystemUserWithRoles)[]>}
   * @memberof CollectionMemberService
   */
  async getCollectionParticipants(
    collectionId: number,
    filterFields?: ICollectionParticipantsAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<(CollectionParticipant & SystemUserWithRoles)[]> {
    return this.collectionParticipationRepository.getCollectionParticipants(collectionId, filterFields, pagination);
  }

  /**
   * Get count of participants in the survey
   *
   * @param {number} collectionId
   * @returns {Promise<number>}
   * @memberof CollectionMemberService
   */
  async getCollectionParticipantsCount(collectionId: number): Promise<number> {
    return this.collectionParticipationRepository.getCollectionParticipantsCount(collectionId);
  }

  /**
   * Insert a new collection participant
   *
   * @param {number} collectionId
   * @param {IPostCollectionParticipant[]} participants
   * @returns {Promise<void>}
   * @memberof CollectionMemberService
   */
  async insertCollectionParticipants(collectionId: number, participants: IPostCollectionParticipant[]): Promise<void> {
    await Promise.all(
      participants.map((participant) =>
        this.collectionParticipationRepository.insertCollectionParticipant(collectionId, participant)
      )
    );
  }

  /**
   * Insert a new collection participant
   *
   * @param collectionId
   * @param systemUserId
   * @returns {Promise<void>}
   * @memberof CollectionMemberService
   */
  async updateCollectionParticipantRole(
    collectionId: number,
    collectionParticipationId: number,
    collectionRoleName: string
  ): Promise<void> {
    return this.collectionParticipationRepository.updateCollectionParticipantRole(
      collectionId,
      collectionParticipationId,
      collectionRoleName
    );
  }

  /**
   * Remove a participant from a collection
   *
   * @param {number} collectionId
   * @param {number} collectionParticipationId
   * @returns {Promise<void>}
   * @memberof CollectionMemberService
   */
  async deleteCollectionMemberRecord(collectionId: number, collectionParticipationId: number): Promise<any> {
    return this.collectionParticipationRepository.deleteCollectionMemberRecord(collectionId, collectionParticipationId);
  }
}
