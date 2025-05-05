import { IDBConnection } from '../database/db';
import { CollectionMember, ICollectionMembersAdvancedFilters, IPostCollectionMember } from '../models/collection';
import { SystemUserWithRoles } from '../models/system-user-view';
import { CollectionMemberRepository } from '../repositories/collection-participation-repository';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { DBService } from './db-service';

/**
 * Service for managing collections
 */
export class CollectionMemberService extends DBService {
  collectionMemberRepository: CollectionMemberRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.collectionMemberRepository = new CollectionMemberRepository(connection);
  }

  /**
   * Get all participants of a collection
   *
   * @param {number} collectionId
   * @param {ICollectionMembersAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} pagination
   * @returns {Promise<(CollectionMember & SystemUserWithRoles)[]>}
   * @memberof CollectionMemberService
   */
  async getCollectionMembers(
    collectionId: number,
    filterFields?: ICollectionMembersAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<(CollectionMember & SystemUserWithRoles)[]> {
    return this.collectionMemberRepository.getCollectionMembers(collectionId, filterFields, pagination);
  }

  /**
   * Get count of participants in the survey
   *
   * @param {number} collectionId
   * @returns {Promise<number>}
   * @memberof CollectionMemberService
   */
  async getCollectionMembersCount(collectionId: number): Promise<number> {
    return this.collectionMemberRepository.getCollectionMembersCount(collectionId);
  }

  /**
   * Insert a new collection participant
   *
   * @param {number} collectionId
   * @param {IPostCollectionMember[]} participants
   * @returns {Promise<void>}
   * @memberof CollectionMemberService
   */
  async insertCollectionMembers(collectionId: number, participants: IPostCollectionMember[]): Promise<void> {
    await Promise.all(
      participants.map((participant) =>
        this.collectionMemberRepository.insertCollectionMember(collectionId, participant)
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
  async updateCollectionMemberRole(
    collectionId: number,
    CollectionMemberId: number,
    collectionRoleName: string
  ): Promise<void> {
    return this.collectionMemberRepository.updateCollectionMemberRole(
      collectionId,
      CollectionMemberId,
      collectionRoleName
    );
  }

  /**
   * Remove a participant from a collection
   *
   * @param {number} collectionId
   * @param {number} CollectionMemberId
   * @returns {Promise<void>}
   * @memberof CollectionMemberService
   */
  async deleteCollectionMemberRecord(collectionId: number, CollectionMemberId: number): Promise<any> {
    return this.collectionMemberRepository.deleteCollectionMemberRecord(collectionId, CollectionMemberId);
  }

  /**
   * Get a specific collection participation record for a given collection Id and system user Id
   *
   * @param {number} collectionId
   * @param {number} systemUserId
   * @returns {Promise<(CollectionMember & SystemUserWithRoles) | null>}
   * @memberof CollectionMemberService
   */
  async getCollectionMemberByCollectionIdAndSystemUserId(
    collectionId: number,
    systemUserId: number
  ): Promise<(CollectionMember & SystemUserWithRoles) | null> {
    return this.collectionMemberRepository.getCollectionMemberByCollectionIdAndSystemUserId(collectionId, systemUserId);
  }

  /**
   * Get the collection member for the given collection and user guid.
   *
   * @param {number} collectionId
   * @param {number} userGuid
   * @return {*}  {(Promise<(CollectionMember & SystemUserWithRoles) | null>)}
   * @memberof CollectionMemberService
   */
  async getCollectionMemberByCollectionIdAndUserGuid(
    collectionId: number,
    userGuid: string
  ): Promise<(CollectionMember & SystemUserWithRoles) | null> {
    return this.collectionMemberRepository.getCollectionMemberByCollectionIdAndUserGuid(collectionId, userGuid);
  }

  /**
   * Get the collection member record for any parent of the given collection id (recursively walk up the tree)
   *
   * @param {number} collectionId
   * @param {number} userGuid
   * @return {*}  {(Promise<(CollectionMember & SystemUserWithRoles)[]>)}
   * @memberof CollectionMemberService
   */
  async getParentCollectionMemberByCollectionIdAndUserGuid(
    collectionId: number,
    userGuid: string
  ): Promise<(CollectionMember & SystemUserWithRoles)[]> {
    return this.collectionMemberRepository.getParentCollectionMemberByCollectionIdAndUserGuid(collectionId, userGuid);
  }
}
