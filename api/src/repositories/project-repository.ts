import SQL, { SQLStatement } from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PostProjectObject } from '../models/project-create';
import { PutObjectivesData, PutProjectData } from '../models/project-update';
import {
  GetAttachmentsData,
  GetIUCNClassificationData,
  GetObjectivesData,
  GetReportAttachmentsData,
  IProjectAdvancedFilters,
  ProjectData,
  ProjectListData
} from '../models/project-view';
import { getLogger } from '../utils/logger';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';
import { getKnex } from '../database/db';
import { Knex } from 'knex';

const defaultLog = getLogger('repositories/project-repository');

/**
 * A repository class for accessing project data.
 *
 * @export
 * @class ProjectRepository
 * @extends {BaseRepository}
 */
export class ProjectRepository extends BaseRepository {

  /**
   * Constructs a non-paginated query used to get a project list for users.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IProjectAdvancedFilters} filterFields
   * @return {*}  Promise<Knex.QueryBuilder>
   * @memberof ProjectRepository
   */
  _makeProjectListQuery(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IProjectAdvancedFilters,
  ): Knex.QueryBuilder {
    const knex = getKnex();

    const query = knex
      .select([
        'p.project_id',
        'p.name',
        'p.objectives',
        'p.start_date',
        'p.end_date',
        knex.raw(`COALESCE(array_remove(array_agg(DISTINCT rl.region_name), null), '{}') as regions`),
        knex.raw('array_agg(distinct prog.program_id) as project_programs'),
      ])
      .from('project as p')

      .leftJoin('project_program as pp', 'p.project_id', 'pp.project_id')
      .leftJoin('survey as s', 's.project_id', 'p.project_id')
      .leftJoin('study_species as sp', 'sp.survey_id', 's.survey_id')
      .leftJoin('program as prog', 'prog.program_id', 'pp.program_id')
      .leftJoin('project_region as pr', 'p.project_id', 'pr.project_id')
      .leftJoin('region_lookup as rl', 'pr.region_id', 'rl.region_id')
      
      .groupBy([
        'p.project_id',
        'p.name',
        'p.objectives',
        'p.start_date',
        'p.end_date',
      ])

    /*
     * Ensure that users can only see project that they are participating in, unless
     * they are an administrator.
     */
    if (!isUserAdmin) {
      query.whereIn('p.project_id', (subQueryBuilder) => {
        subQueryBuilder
          .select('project_id')
          .from('project_participation')
          .where('system_user_id', systemUserId);
      });
    }

    // Start Date filter
    if (filterFields.start_date) {
      query.andWhere('p.start_date', '>=', filterFields.start_date);
    }

    // End Date filter
    if (filterFields.end_date) {
      query.andWhere('p.end_date', '<=', filterFields.end_date)
    }

    // Project Name filter (exact match)
    if (filterFields.project_name) {
      query.andWhere('p.name', filterFields.project_name);
    }

    // Focal Species filter
    if (filterFields.species_tsns?.length) {
      query.whereIn('sp.itis_tsn', filterFields.species_tsns);
    }

    // Keyword Search filter
    if (filterFields.keyword) {
      const keywordMatch = `%${filterFields.keyword}%`;
      query.where((subQueryBuilder) => {
        subQueryBuilder
          .where('p.name', 'ilike', keywordMatch)
          .orWhere('p.objectives', 'ilike', keywordMatch)
          .orWhere('s.name', 'ilike', keywordMatch);
      });
    }

    // Programs filter
    if (filterFields.project_programs?.length) {
      query.havingRaw(`array_agg(DISTINCT prog.program_id) && ARRAY[${filterFields.project_programs.join(",")}]::integer[]`);
    }

    return query;
  }

  /**
   * Retrieves the paginated list of all projects that are available to the user.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @param {IProjectAdvancedFilters} filterFields
   * @param {ApiPaginationOptions} [pagination]
   * @return {*}  {Promise<ProjectListData[]>}
   * @memberof ProjectRepository
   */
  async getProjectList(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IProjectAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<ProjectListData[]> {
    defaultLog.debug({ label: 'getProjectList', pagination });

    const query = this._makeProjectListQuery(
      isUserAdmin,
      systemUserId,
      filterFields
    );
    
    // Pagination
    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, ProjectListData);

    return response.rows;
  }

  /**
   * Returns the total count of projects that are visible to the given user.
   *
   * @param {IProjectAdvancedFilters} filterFields
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId
   * @return {*}  {Promise<number>}
   * @memberof ProjectRepository
   */
  async getProjectCount(filterFields: IProjectAdvancedFilters, isUserAdmin: boolean, systemUserId: number | null): Promise<number> {
    const projectsListQuery = this._makeProjectListQuery(isUserAdmin, systemUserId, filterFields)

    const query = getKnex()
      .from(projectsListQuery.as('temp'))
      .count('* as project_count');

    const response = await this.connection.knex(query, z.object({ project_count: z.string().transform(Number) }));

    if (response?.rowCount < 1) {
      throw new ApiExecuteSQLError('Failed to get project count', [
        'ProjectRepository->getProjectCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].project_count;
  }

  async getProjectData(projectId: number): Promise<ProjectData> {
    const getProjectSqlStatement = SQL`
      SELECT
        p.project_id,
        p.uuid,
        p.name as project_name,
        p.objectives,
        p.start_date,
        p.end_date,
        p.comments,
        p.geojson as geometry,
        p.create_date,
        p.create_user,
        p.update_date,
        p.update_user,
        p.revision_count,
        pp.project_programs
      FROM
        project p
      LEFT JOIN (
        SELECT array_remove(array_agg(p.program_id), NULL) as project_programs, pp.project_id
        FROM program p, project_program pp
        WHERE p.program_id = pp.program_id
        GROUP BY pp.project_id
      ) as pp on pp.project_id = p.project_id
      WHERE
        p.project_id = ${projectId};
    `;

    const response = await this.connection.sql(getProjectSqlStatement, ProjectData);

    if (response?.rowCount < 1) {
      throw new ApiExecuteSQLError('Failed to get project data', [
        'ProjectRepository->getProjectData',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  async getObjectivesData(projectId: number): Promise<GetObjectivesData> {
    const sqlStatement = SQL`
      SELECT
        objectives,
        revision_count
      FROM
        project
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = response.rows?.[0] || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project objectives data', [
        'ProjectRepository->getObjectivesData',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return new GetObjectivesData(result);
  }

  async getIUCNClassificationData(projectId: number): Promise<GetIUCNClassificationData> {
    const sqlStatement = SQL`
      SELECT
        ical1c.iucn_conservation_action_level_1_classification_id as classification,
        ical2s.iucn_conservation_action_level_2_subclassification_id as subClassification1,
        ical3s.iucn_conservation_action_level_3_subclassification_id as subClassification2
      FROM
        project_iucn_action_classification as piac
      LEFT OUTER JOIN
        iucn_conservation_action_level_3_subclassification as ical3s
      ON
        piac.iucn_conservation_action_level_3_subclassification_id = ical3s.iucn_conservation_action_level_3_subclassification_id
      LEFT OUTER JOIN
        iucn_conservation_action_level_2_subclassification as ical2s
      ON
        ical3s.iucn_conservation_action_level_2_subclassification_id = ical2s.iucn_conservation_action_level_2_subclassification_id
      LEFT OUTER JOIN
        iucn_conservation_action_level_1_classification as ical1c
      ON
        ical2s.iucn_conservation_action_level_1_classification_id = ical1c.iucn_conservation_action_level_1_classification_id
      WHERE
        piac.project_id = ${projectId}
      GROUP BY
        ical1c.iucn_conservation_action_level_1_classification_id,
        ical2s.iucn_conservation_action_level_2_subclassification_id,
        ical3s.iucn_conservation_action_level_3_subclassification_id;
    `;

    const response = await this.connection.sql(sqlStatement);

    return new GetIUCNClassificationData(response.rows);
  }

  async getAttachmentsData(projectId: number): Promise<GetAttachmentsData> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        project_attachment
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.sql(sqlStatement);

    return new GetAttachmentsData(response.rows);
  }

  async getReportAttachmentsData(projectId: number): Promise<GetReportAttachmentsData> {
    const sqlStatement = SQL`
      SELECT
        pra.project_report_attachment_id,
        pra.project_id,
        pra.file_name,
        pra.title,
        pra.description,
        pra.year,
        pra."key",
        pra.file_size,
        array_remove(array_agg(pra2.first_name ||' '||pra2.last_name), null) authors
      FROM
        project_report_attachment pra
      LEFT JOIN project_report_author pra2 ON pra2.project_report_attachment_id = pra.project_report_attachment_id
      WHERE pra.project_id = ${projectId}
      GROUP BY
        pra.project_report_attachment_id,
        pra.project_id,
        pra.file_name,
        pra.title,
        pra.description,
        pra.year,
        pra."key",
        pra.file_size;
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = response?.rows;

    return new GetReportAttachmentsData(result);
  }

  async insertProject(postProjectData: PostProjectObject): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project (
        name,
        objectives,
        start_date,
        end_date,
        comments
      ) VALUES (
        ${postProjectData.project.name},
        ${postProjectData.objectives.objectives},
        ${postProjectData.project.start_date},
        ${postProjectData.project.end_date},
        ${postProjectData.project.comments}
      )
      RETURNING project_id as id;`;
    const response = await this.connection.sql(sqlStatement);

    const result = response?.rows?.[0];

    if (!result?.id) {
      throw new ApiExecuteSQLError('Failed to insert project boundary data', [
        'ProjectRepository->insertProject',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result.id;
  }

  async insertClassificationDetail(iucn3_id: number, project_id: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project_iucn_action_classification (
        iucn_conservation_action_level_3_subclassification_id,
        project_id
      ) VALUES (
        ${iucn3_id},
        ${project_id}
      )
      RETURNING
        project_iucn_action_classification_id as id;
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = response?.rows?.[0];

    if (!result?.id) {
      throw new ApiExecuteSQLError('Failed to insert project IUCN data', [
        'ProjectRepository->insertClassificationDetail',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result.id;
  }

  /**
   * Links a given project with a list of given programs.
   * This insert assumes previous records for a project have been removed first
   *
   * @param {number} projectId Project to add programs to
   * @param {number[]} programs Programs to be added to a project
   * @returns {*} {Promise<void>}
   */
  async insertProgram(projectId: number, programs: number[]): Promise<void> {
    if (programs.length < 1) {
      return;
    }

    const sql = SQL`
      INSERT INTO project_program (project_id, program_id)
      VALUES `;

    programs.forEach((programId, index) => {
      sql.append(`(${projectId}, ${programId})`);

      if (index !== programs.length - 1) {
        sql.append(',');
      }
    });

    sql.append(';');

    try {
      await this.connection.sql(sql);
    } catch (error) {
      throw new ApiExecuteSQLError('Failed to execute insert SQL for project_program', [
        'ProjectRepository->insertProgram'
      ]);
    }
  }

  /**
   * Removes program links for a given project.
   *
   * @param {number} projectId Project id to remove programs from
   * @returns {*} {Promise<void>}
   */
  async deletePrograms(projectId: number): Promise<void> {
    const sql = SQL`
      DELETE FROM project_program WHERE project_id = ${projectId};
    `;
    try {
      await this.connection.sql(sql);
    } catch (error) {
      throw new ApiExecuteSQLError('Failed to execute delete SQL for project_program', [
        'ProjectRepository->deletePrograms'
      ]);
    }
  }

  async deleteIUCNData(projectId: number): Promise<void> {
    const sqlDeleteStatement = SQL`
      DELETE
        from project_iucn_action_classification
      WHERE
        project_id = ${projectId};
    `;

    await this.connection.sql(sqlDeleteStatement);
  }

  async updateProjectData(
    projectId: number,
    project: PutProjectData | null,
    objectives: PutObjectivesData | null,
    revision_count: number
  ): Promise<void> {
    if (!project && !objectives) {
      // Nothing to update
      throw new ApiExecuteSQLError('Nothing to update for Project Data', [
        'ProjectRepository->updateProjectData',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    const sqlStatement: SQLStatement = SQL`UPDATE project SET `;

    const sqlSetStatements: SQLStatement[] = [];

    if (project) {
      sqlSetStatements.push(SQL`name = ${project.name}`);
      sqlSetStatements.push(SQL`start_date = ${project.start_date}`);
      sqlSetStatements.push(SQL`end_date = ${project.end_date}`);
    }

    if (objectives) {
      sqlSetStatements.push(SQL`objectives = ${objectives.objectives}`);
    }

    sqlSetStatements.forEach((item, index) => {
      sqlStatement.append(item);
      if (index < sqlSetStatements.length - 1) {
        sqlStatement.append(',');
      }
    });

    sqlStatement.append(SQL`
      WHERE
        project_id = ${projectId}
      AND
        revision_count = ${revision_count};
    `);

    const result = await this.connection.sql(sqlStatement);

    if (!result?.rowCount) {
      throw new ApiExecuteSQLError('Failed to update stale project data', [
        'ProjectRepository->updateProjectData',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  async deleteProject(projectId: number): Promise<void> {
    const sqlStatement = SQL`call api_delete_project(${projectId})`;

    await this.connection.sql(sqlStatement);
  }
}
