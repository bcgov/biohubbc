import { IDBConnection } from '../database/db';
import { MarkdownObject, markdownQueryObject } from '../models/markdown-view';
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
}
