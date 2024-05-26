import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { RegionDetails } from '../services/bcgw-layer-service';
import { BaseRepository } from './base-repository';

export const IRegion = z.object({
  region_id: z.number(),
  region_name: z.string(),
  org_unit: z.string(),
  org_unit_name: z.string(),
  feature_code: z.string(),
  feature_name: z.string(),
  object_id: z.number(),
  geometry: z.null(),
  geography: z.any(),
  geojson: z.any()
});

export type IRegion = z.infer<typeof IRegion>;

/**
 * A repository class for accessing region data.
 *
 * @export
 * @class RegionRepository
 * @extends {BaseRepository}
 */
export class RegionRepository extends BaseRepository {
  /**
   * Links a survey to a list of given regions
   *
   * @param {number} surveyId
   * @param {number[]} regions
   * @returns  {*} {Promise<void>}
   */
  async addRegionsToSurvey(surveyId: number, regions: number[]): Promise<void> {
    if (regions.length < 1) {
      return;
    }

    const sql = SQL`
      INSERT INTO survey_region (
        survey_id,
        region_id
      ) VALUES `;

    regions.forEach((regionId, index) => {
      sql.append(`(${surveyId}, ${regionId})`);

      if (index !== regions.length - 1) {
        sql.append(',');
      }
    });

    sql.append(';');

    try {
      await this.connection.sql(sql);
    } catch (error) {
      throw new ApiExecuteSQLError('Failed to execute insert SQL for survey_region', [
        'RegionRepository->addRegionsToSurvey'
      ]);
    }
  }

  /**
   * Removes any regions associated to a given survey
   *
   * @param surveyId
   */
  async deleteRegionsForSurvey(surveyId: number): Promise<void> {
    const sql = SQL`
      DELETE FROM survey_region WHERE survey_id=${surveyId};
    `;
    try {
      await this.connection.sql(sql);
    } catch (error) {
      throw new ApiExecuteSQLError('Failed to execute delete SQL for survey_regions', [
        'RegionRepository->deleteRegionsForSurvey'
      ]);
    }
  }

  /**
   * Filters the region lookup table based on region name and source layer (fme_feature_type)
   *
   * @param {RegionDetails[]} details
   * @returns {*} {Promise<IRegion[]>}
   */
  async searchRegionsWithDetails(details: RegionDetails[]): Promise<IRegion[]> {
    const knex = getKnex();
    const qb = knex.queryBuilder().select().from('region_lookup');

    for (const detail of details) {
      qb.orWhere((qb1) => {
        qb1.andWhereRaw("geojson::json->'properties'->>'REGION_NAME' = ?", detail.regionName);
        qb1.andWhereRaw("geojson::json->'properties'->>'fme_feature_type' = ?", detail.sourceLayer);
      });
    }

    try {
      const response = await this.connection.knex<IRegion>(qb);

      return response.rows;
    } catch (error) {
      throw new ApiExecuteSQLError('Failed to execute search region SQL', [
        'RegionRepository->searchRegionsWithDetails'
      ]);
    }
  }

  /**
   * Get region lookup values from region names
   *
   * @async
   * @param {string[]} regionNames - Names of regions
   * @returns {Promise<IRegion[]>} - List of regions
   */
  async getRegionsByNames(regionNames: string[]): Promise<IRegion[]> {
    const knex = getKnex();
    const qb = knex.queryBuilder().select().from('region_lookup').whereIn('region_name', regionNames);

    try {
      const response = await this.connection.knex<IRegion>(qb);

      return response.rows;
    } catch (error) {
      throw new ApiExecuteSQLError('Failed to execute get regions by names SQL', [
        'RegionRepository->getRegionsByNames'
      ]);
    }
  }
}
