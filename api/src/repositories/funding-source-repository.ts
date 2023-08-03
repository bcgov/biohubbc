import SQL from 'sql-template-strings';
import { z } from 'zod';
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
  async getFundingSources(): Promise<FundingSource[]> {
    const sqlStatement = SQL`
      SELECT 
        * 
      FROM 
        funding_sources;
    `;

    const response = await this.connection.sql(sqlStatement, FundingSource);

    return response.rows;
  }
}
