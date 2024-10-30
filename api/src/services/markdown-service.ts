import { IDBConnection } from '../database/db';
import { MarkdownObject, markdownQueryObject, MarkdownUserObject } from '../models/markdown-view';
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
   * @param {markdownQueryObject} markdownQueryObject
   * @return {*} Promise<MarkdownObject>
   * @memberof MarkdownService
   */
  async getMarkdownByTypeName(markdownQueryObject: markdownQueryObject): Promise<MarkdownObject> {
    const response = await this.markdownRepository.getMarkdownByTypeName(markdownQueryObject);

    return response;
  }

  /**
   * Change the score of a markdown record
   *
   * @param {number} markdownId
   * @param {number} systemUserId
   * @param {number} delta - The amount to change the score by (positive for increase, negative for decrease)
   * @return {*} Promise<number>
   * @memberof MarkdownService
   */
  async updateScore(markdownId: number, systemUserId: number, delta: number): Promise<number> {
    const response = await this.markdownRepository.updateScore(markdownId, systemUserId, delta);

    return response;
  }

  /**
   * Gets a participation record for a given markdown record and system user id, to check whether a user has already scored a markdown record
   *
   * @param {number} markdownId
   * @param {number} systemUserId
   * @return {*} Promise<MarkdownUserObject>
   * @memberof MarkdownService
   */
  async getUserParticipation(markdownId: number, systemUserId: number): Promise<MarkdownUserObject> {
    const response = await this.markdownRepository.getUserParticipation(markdownId, systemUserId);

    return response;
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
