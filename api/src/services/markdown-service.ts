import { MarkdownUserRecord } from '../database-models/markdown_user';
import { IDBConnection } from '../database/db';
import { MarkdownObject, MarkdownQueryObject } from '../models/markdown-view';
import { MarkdownRepository } from '../repositories/markdown-repository';
import { DBService } from './db-service';

export class MarkdownService extends DBService {
  markdownRepository: MarkdownRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.markdownRepository = new MarkdownRepository(connection);
  }

  /**
   * Gets the active markdown record for a given markdown type
   *
   * @param {MarkdownQueryObject} MarkdownQueryObject
   * @return {*} Promise<MarkdownObject>
   * @memberof MarkdownService
   */
  async getMarkdownByTypeName(MarkdownQueryObject: MarkdownQueryObject): Promise<MarkdownObject> {
    const response = await this.markdownRepository.getMarkdownByTypeName(MarkdownQueryObject);

    return response;
  }

  /**
   * Handle a score change for a markdown record, succeeding only if the user has not already scored on the markdown record.
   *
   * @param {number} markdownId
   * @param {number} systemUserId
   * @param {number} delta - The amount to change the score by (positive for increase, negative for decrease)
   * @return {*} Promise<number | null>
   * @memberof MarkdownService
   */
  async handleScoreChange(markdownId: number, systemUserId: number, delta: number): Promise<number | null> {
    // Check if the user has not already scored the markdown record
    const participation = await this.getUserParticipation(markdownId, systemUserId);

    // Return null if the user already scored
    if (participation) {
      return null;
    }

    const score = await this.updateScore(markdownId, delta);

    await this.insertUserParticipation(markdownId, systemUserId);

    return score;
  }

  /**
   * Update the score of a markdown record
   *
   * @param {number} markdownId
   * @param {number} delta - The amount to change the score by (positive for increase, negative for decrease)
   * @return {*} Promise<number>
   * @memberof MarkdownService
   */
  async updateScore(markdownId: number, delta: number): Promise<number> {
    return this.markdownRepository.updateScore(markdownId, delta);
  }

  /**
   * Gets a participation record for a given markdown record and system user id, to check whether a user has already scored a markdown record
   *
   * @param {number} markdownId
   * @param {number} systemUserId
   * @return {*} Promise<MarkdownUserRecord | null>
   * @memberof MarkdownService
   */
  async getUserParticipation(markdownId: number, systemUserId: number): Promise<MarkdownUserRecord | null> {
    return this.markdownRepository.getUserParticipation(markdownId, systemUserId);
  }

  /**
   * Insert a record indicating that the user has scored the given markdown record
   *
   * @param {number} markdownId
   * @param {number} systemUserId
   * @return {*} Promise<number>
   * @memberof MarkdownService
   */
  async insertUserParticipation(markdownId: number, systemUserId: number): Promise<number> {
    const response = await this.markdownRepository.insertUserParticipation(markdownId, systemUserId);

    return response;
  }
}
