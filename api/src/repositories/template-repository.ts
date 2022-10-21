import SQL, { SQLStatement } from 'sql-template-strings';
import { HTTP400 } from '../errors/http-error';
import { BaseRepository } from './base-repository';

export interface ITemplateData {
  template_id: number;
  name: string;
  version: string;
  description: string;
  key: string;
}

export class TemplateRepository extends BaseRepository {
  async getAllTemplates(): Promise<ITemplateData[]> {
    const sqlStatement: SQLStatement = SQL`
    SELECT
      t.*
    FROM
      template t
    `;

    const response = await this.connection.query<ITemplateData>(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to query template table');
    }

    return response && response.rows;
  }
}
