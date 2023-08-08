import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { ICreateFundingSource, IFundingSourceSearchParams } from '../services/funding-source-service';
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

  async createFundingSource(data: ICreateFundingSource): Promise<{ funding_source_id: number }> {
    const sql = SQL`
      INSERT INTO funding_sources (
        name, 
        description, 
        start_date, 
        end_date
      ) VALUES (
        ${data.name},
        ${data.description},
        ${data.start_date},
        ${data.end_date}
      )
      RETURNING 
        funding_source_id;
    `;
    const response = await this.connection.sql(sql);
    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert Funding Source record', [
        'FundingSourceRepository->insertFundingSource',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return response.rows[0].funding_source_id;
  }

  /**
   * Fetch a single funding source by id.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<FundingSource>}
   * @memberof FundingSourceRepository
   */
  async getFundingSourceById(fundingSourceId: number): Promise<FundingSource> {
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
        'FundingSourceRepository->getFundingSourceById',
        'rowCount was != 1, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Fetch a single funding source by id.
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
}
