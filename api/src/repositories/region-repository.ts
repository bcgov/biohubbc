import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
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
  geojson: z.any(),
  geography: z.any()
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
  async addRegionsToAProject(projectId: number, regions: number[]): Promise<void> {
    if (regions.length < 1) {
      return;
    }

    const sql = SQL`
      INSERT INTO project_region (
        project_id, 
        region_id
      ) VALUES `;

    regions.forEach((regionId, index) => {
      sql.append(`(${projectId}, ${regionId})`);

      if (index !== regions.length - 1) {
        sql.append(',');
      }
    });

    sql.append(';');

    await this.connection.sql(sql);
  }

  async addRegionsToASurvey(surveyId: number, regions: number[]): Promise<void> {
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

    await this.connection.sql(sql);
  }

  async deleteRegionsFromAProject(projectId: number): Promise<void> {
    const sql = SQL`
      DELETE FROM project_region WHERE project_id=${projectId};
    `;
    await this.connection.sql(sql);
  }

  async deleteRegionsFromASurvey(surveyId: number): Promise<void> {
    const sql = SQL`
      DELETE FROM survey_region WHERE survey_id=${surveyId};
    `;
    await this.connection.sql(sql);
  }

  async getAllRegions(): Promise<IRegion[]> {
    const sql = SQL`
      SELECT * FROM region_lookup;
    `;
    const response = await this.connection.sql(sql, IRegion);
    return response.rows;
  }

  async getRegionsForProjectId(projectId: number): Promise<IRegion[]> {
    const sql = SQL`
      SELECT rl.*
      FROM project p 
      LEFT JOIN project_region pr ON p.project_id = pr.project_id
      LEFT JOIN region_lookup rl ON pr.region_id =rl.region_id 
      WHERE p.project_id = ${projectId};
  `;
    const response = await this.connection.sql(sql, IRegion);
    return response.rows;
  }

  async searchRegionsWithDetails(details: RegionDetails[]): Promise<IRegion[]> {
    const knex = getKnex();
    const qb = knex.queryBuilder().select().from('region_lookup');

    for (const detail of details) {
      qb.orWhere((qb1) => {
        qb1.andWhereRaw("geojson::json->'properties'->>'REGION_NAME' = ?", detail.regionName);
        qb1.andWhereRaw("geojson::json->'properties'->>'fme_feature_type' = ?", detail.sourceLayer);
      });
    }

    const response = await this.connection.knex<IRegion>(qb);

    return response.rows;
  }
}
