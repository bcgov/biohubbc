import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { IFundingSourceSearchParams } from '../services/funding-source-service';
import { BaseRepository } from './base-repository';

const FundingSource = z.object({
  funding_source_id: z.number(),
  name: z.string(),
  description: z.string()
});

export type FundingSource = z.infer<typeof FundingSource>;

export class FundingSourceRepository extends BaseRepository {
  /**
   * Fetch all funding sources.
   *
   * @return {*}  {Promise<FundingSource[]>}
   * @memberof BaseRepository
   */
  async getFundingSources(searchParams: IFundingSourceSearchParams): Promise<FundingSource[]> {
    const knex = getKnex();
    const queryBuilder = knex.queryBuilder();

    queryBuilder.select(['name', 'description', 'start_date', 'end_date']).from('funding_sources');

    if (searchParams.name) {
      queryBuilder.andWhere('name', searchParams.name);
    }

    const response = await this.connection.knex(queryBuilder, FundingSource);

    return response.rows;
  }

  async hasFundingSourceNameBeenUsed(name: string): Promise<boolean> {
    const sqlStatement = SQL`
      SELECT 
        * 
      FROM 
        funding_sources
      WHERE 
        LOWER(name) = '${name.toLowerCase()}';
    `;

    const response = await this.connection.sql(sqlStatement, FundingSource);
    return response.rowCount > 0;
  }

  async insertFundingSource(): Promise<{ funding_source_id: number }> {
    return { funding_source_id: 1 };
  }
}
