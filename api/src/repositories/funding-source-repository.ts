import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

const FundingSource = z.object({
  funding_source_id: z.number(),
  name: z.string(),
  description: z.string(),
  revision_count: z.number().optional()
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
        funding_source;
    `;

    const response = await this.connection.sql(sqlStatement, FundingSource);

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

  /**
   * Fetch a single funding source.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<FundingSource>}
   * @memberof FundingSourceRepository
   */
  async getFundingSource(fundingSourceId: number): Promise<FundingSource> {
    const sqlStatement = SQL`
      SELECT 
        * 
      FROM 
        funding_source
      WHERE 
        funding_source_id = ${fundingSourceId};
    `;

    const response = await this.connection.sql(sqlStatement, FundingSource);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to get funding source', [
        'FundingSourceRepository->getFundingSource',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Update a single funding source.
   *
   * @param {FundingSource} fundingSource
   * @return {*}  {Promise<Pick<FundingSource, 'funding_source_id'>>}
   * @memberof FundingSourceRepository
   */
  async putFundingSource(fundingSource: FundingSource): Promise<Pick<FundingSource, 'funding_source_id'>> {
    const sqlStatement = SQL`
      UPDATE
        funding_source
      SET
        name = ${fundingSource.name},
        description = ${fundingSource.description}
      WHERE 
        funding_source_id = ${fundingSource}
      AND
        revision_count = ${fundingSource.revision_count || 0}
      RETURNING
        funding_source_id;
    `;

    const response = await this.connection.sql(sqlStatement, FundingSource.pick({ funding_source_id: true }));

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to update funding source', [
        'FundingSourceRepository->putFundingSource',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Delete a single funding source.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<Pick<FundingSource, 'funding_source_id'>>}
   * @memberof FundingSourceRepository
   */
  async deleteFundingSource(fundingSourceId: number): Promise<Pick<FundingSource, 'funding_source_id'>> {
    const sqlStatement = SQL`
      DELETE 
      FROM 
        funding_source
      WHERE 
        funding_source_id = ${fundingSourceId}
      RETURNING
        funding_source_id;
    `;

    const response = await this.connection.sql(sqlStatement, FundingSource.pick({ funding_source_id: true }));

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to delete funding source', [
        'FundingSourceRepository->deleteFundingSource',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }
}
