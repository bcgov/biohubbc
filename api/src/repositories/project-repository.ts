import { Knex } from 'knex';
import SQL, { SQLStatement } from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PostProjectObject } from '../models/project-create';
import { PutObjectivesData, PutProjectData } from '../models/project-update';
import {
  FindProjectsResponse,
  GetAttachmentsData,
  GetIUCNClassificationData,
  GetObjectivesData,
  GetReportAttachmentsData,
  IProjectAdvancedFilters,
  ProjectData
} from '../models/project-view';
import { ApiPaginationOptions } from '../zod-schema/pagination';
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing project data.
 *
 * @export
 * @class ProjectRepository
 * @extends {BaseRepository}
 */
export class ProjectRepository extends BaseRepository {
  /**
   * Constructs a non-paginated query used to get a list of projects based on the user's permissions and filter criteria.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IProjectAdvancedFilters} filterFields
   * @return {*}  {Knex.QueryBuilder}
   * @memberof ProjectRepository
   */
  _makeFindProjectsQuery(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IProjectAdvancedFilters
  ): Knex.QueryBuilder {
    const knex = getKnex();

    const query = knex
      .select([
        'p.project_id',
        'p.name',
        knex.raw(`MIN(s.start_date) as start_date`),
        knex.raw('MAX(s.end_date) as end_date'),
        knex.raw(`COALESCE(array_remove(array_agg(DISTINCT rl.region_name), null), '{}') as regions`),
        knex.raw('array_remove(array_agg(DISTINCT sp.itis_tsn), null) as focal_species'),
        knex.raw('array_remove(array_agg(DISTINCT st.type_id), null) as types'),
        knex.raw(`
          array_agg(
            DISTINCT jsonb_build_object(
              'system_user_id', su.system_user_id,
              'display_name', su.display_name
            )
          ) as members
        `)
      ])
      .from('project as p')
      .leftJoin('survey as s', 's.project_id', 'p.project_id')
      .leftJoin('study_species as sp', 'sp.survey_id', 's.survey_id')
      .leftJoin('survey_type as st', 'sp.survey_id', 'st.survey_id')
      .leftJoin('survey_region as sr', 'sr.survey_id', 's.survey_id')
      .leftJoin('region_lookup as rl', 'sr.region_id', 'rl.region_id')
      .leftJoin('project_participation as ppa', 'p.project_id', 'ppa.project_id')
      .leftJoin('system_user as su', 'ppa.system_user_id', 'su.system_user_id')
      .groupBy(['p.project_id', 'p.name']);

    // Ensure that users can only see projects that they are participating in, unless they are an administrator.
    if (!isUserAdmin) {
      query.whereIn('p.project_id', (subQueryBuilder) => {
        subQueryBuilder.select('project_id').from('project_participation').where('system_user_id', systemUserId);
      });
    }

    if (filterFields.system_user_id) {
      query.whereIn('p.project_id', (subQueryBuilder) => {
        subQueryBuilder
          .select('project_id')
          .from('project_participation')
          .where('system_user_id', filterFields.system_user_id);
      });
    }

    // Project Name filter (like match)
    if (filterFields.project_name) {
      query.andWhere('p.name', 'ilike', `%${filterFields.project_name}%`);
    }

    // Focal Species filter
    if (filterFields.itis_tsns?.length) {
      // multiple
      query.whereIn('sp.itis_tsn', filterFields.itis_tsns);
    } else if (filterFields.itis_tsn) {
      // single
      query.where('sp.itis_tsn', filterFields.itis_tsn);
    }

    // Keyword Search filter
    if (filterFields.keyword) {
      const keywordMatch = `%${filterFields.keyword}%`;
      query.where((subQueryBuilder) => {
        subQueryBuilder
          .where('p.name', 'ilike', keywordMatch)
          .orWhere('p.objectives', 'ilike', keywordMatch)
          .orWhere('s.name', 'ilike', keywordMatch);

        // If the keyword is a number, also match on project Id
        if (!isNaN(Number(filterFields.keyword))) {
          subQueryBuilder.orWhere('p.project_id', Number(filterFields.keyword));
        }
      });
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
   * @return {*}  {Promise<FindProjectsResponse[]>}
   * @memberof ProjectRepository
   */
  async findProjects(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IProjectAdvancedFilters,
    pagination?: ApiPaginationOptions
  ): Promise<FindProjectsResponse[]> {
    const query = this._makeFindProjectsQuery(isUserAdmin, systemUserId, filterFields);

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);

      if (pagination.sort && pagination.order) {
        query.orderBy(pagination.sort, pagination.order);
      }
    }

    const response = await this.connection.knex(query, FindProjectsResponse);

    return response.rows;
  }

  /**
   * Returns the total count of projects that are visible to the given user.
   *
   * @param {boolean} isUserAdmin
   * @param {(number | null)} systemUserId The system user id of the user making the request
   * @param {IProjectAdvancedFilters} filterFields
   * @return {*}  {Promise<number>}
   * @memberof ProjectRepository
   */
  async findProjectsCount(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IProjectAdvancedFilters
  ): Promise<number> {
    const projectsListQuery = this._makeFindProjectsQuery(isUserAdmin, systemUserId, filterFields);

    const knex = getKnex();

    // See https://knexjs.org/guide/query-builder.html#usage-with-typescript-3 for details on count() usage
    const query = knex.from(projectsListQuery.as('plq')).select(knex.raw('count(*)::integer as count'));

    const response = await this.connection.knex(query, z.object({ count: z.number() }));

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get project count', [
        'ProjectRepository->findProjectsCount',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  async getProjectData(projectId: number): Promise<ProjectData> {
    const getProjectSqlStatement = SQL`
      SELECT
        p.project_id,
        p.uuid,
        p.name as project_name,
        p.comments,
        p.revision_count
      FROM
        project p
      WHERE
        p.project_id = ${projectId};
    `;

    const response = await this.connection.sql(getProjectSqlStatement, ProjectData);

    if (!response.rowCount) {
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
        comments
      ) VALUES (
        ${postProjectData.project.name},
        ${postProjectData.objectives.objectives},
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
