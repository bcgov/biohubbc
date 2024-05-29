import { Feature } from 'geojson';
import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { RegionDetails } from '../services/bcgw-layer-service';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('region-repository');

export const enum REGION_FEATURE_CODE {
  NATURAL_RESOURCE_REGION = 'FM90000010', // NRM
  WHSE_ADMIN_BOUNDARY = 'AR10100000' // ENV
}

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

/**
 * Excluding spatial fields for performance
 *
 */
export const RegionNoSpatial = IRegion.omit({ geometry: true, geography: true, geojson: true });

export type IRegion = z.infer<typeof IRegion>;
export type IRegionNoSpatial = z.infer<typeof RegionNoSpatial>;

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
   * Get intersecting regions from a list of features
   * Optionally provide feature code to filter available intersections
   *
   * @async
   * @param {Feature[]} features - List of geometry features
   * @param {REGION_FEATURE_CODE} [featureCode] - Feature code of region lookup table
   * @returns {Promise<IRegionNoSpatial[]>} - List of regions
   */
  async getIntersectingRegionsFromFeatures(
    features: Feature[],
    featureCode?: REGION_FEATURE_CODE
  ): Promise<IRegionNoSpatial[]> {
    const knex = getKnex();
    const queryBuilder = knex
      .queryBuilder()
      .select('region_id', 'region_name', 'org_unit', 'org_unit_name', 'feature_code', 'feature_name', 'object_id')
      .from('region_lookup');

    /**
     * Optional filter for region lookup table
     * example: only NRM regions
     */
    if (featureCode) {
      queryBuilder.where({ feature_code: featureCode });
    }

    /**
     * From a list of features return intersecting lookup regions
     */
    queryBuilder.andWhere((query) => {
      for (const feature of features) {
        /**
         * note: If a spatial layer is selected, the ST_Intersects will return all surrounding layers.
         * This will try and query the region_lookup table using the region name instead.
         */
        const regionName = feature?.properties?.['REGION_NAME'];
        if (regionName) {
          query.orWhereILike({ region_name: regionName });
        } else {
          query.orWhereRaw(`public.ST_Intersects(public.ST_GeomFromGeoJSON(?), geometry)`, [
            JSON.stringify(feature.geometry) // geometry needs to be stringified before PostGis can use
          ]);
        }
      }
    });

    try {
      const response = await this.connection.knex<IRegionNoSpatial>(queryBuilder);

      /**
       * Additional logging incase region mapping not fully successfull
       */
      if (features.length !== response.rowCount) {
        defaultLog.info({
          label: 'getIntersectingRegionsFromFeatures',
          message: 'unable to map a feature to NRM region -> less regions than features'
        });
      }

      return response.rows;
    } catch (error) {
      throw new ApiExecuteSQLError('Failed to execute get intersecting regions SQL', [
        'RegionRepository->getIntersectingRegionsFromFeatures'
      ]);
    }
  }
}
