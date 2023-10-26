import { isArray } from 'lodash';
import SQL, { SQLStatement } from 'sql-template-strings';
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
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing project data.
 *
 * @export
 * @class ProjectRepository
 * @extends {BaseRepository}
 */
export class ProjectRepository extends BaseRepository {
  async getProjectList(
    isUserAdmin: boolean,
    systemUserId: number | null,
    filterFields: IProjectAdvancedFilters
  ): Promise<ProjectListData[]> {
    const sqlStatement = SQL`
      SELECT
        p.project_id,
        p.name as project_name,
        p.uuid,
        p.start_date,
        p.end_date,
        p.revision_count,
        array_remove(array_agg(DISTINCT rl.region_name), null) as regions,
        array_agg(distinct p2.program_id) as project_programs
      FROM
        project as p
      LEFT JOIN project_program pp
        ON p.project_id = pp.project_id
      LEFT JOIN program p2
        ON p2.program_id = pp.program_id
      LEFT OUTER JOIN survey as s
        ON s.project_id = p.project_id
      LEFT OUTER JOIN study_species as sp
        ON sp.survey_id = s.survey_id
      LEFT JOIN survey_funding_source as sfs
        ON s.survey_id = sfs.survey_id
      LEFT JOIN funding_source as fs
        ON sfs.funding_source_id = fs.funding_source_id
      LEFT JOIN project_region pr
        ON p.project_id = pr.project_id
      LEFT JOIN region_lookup rl
        ON pr.region_id = rl.region_id
      WHERE 1 = 1
    `;

    if (!isUserAdmin) {
      sqlStatement.append(SQL`
        AND p.project_id IN (
          SELECT
            project_id
          FROM
            project_participation
          where
            system_user_id = ${systemUserId}
        )
      `);
    }

    if (filterFields && Object.keys(filterFields).length !== 0 && filterFields.constructor === Object) {
      if (filterFields.start_date && !filterFields.end_date) {
        sqlStatement.append(SQL` AND p.start_date >= ${filterFields.start_date}`);
      }

      if (!filterFields.start_date && filterFields.end_date) {
        sqlStatement.append(SQL` AND p.end_date <= ${filterFields.end_date}`);
      }

      if (filterFields.start_date && filterFields.end_date) {
        sqlStatement.append(
          SQL` AND p.start_date >= ${filterFields.start_date} AND p.end_date <= ${filterFields.end_date}`
        );
      }

      if (filterFields.project_name) {
        sqlStatement.append(SQL` AND p.name = ${filterFields.project_name}`);
      }

      if (filterFields?.species && filterFields?.species?.length > 0) {
        sqlStatement.append(SQL` AND sp.wldtaxonomic_units_id =${filterFields.species[0]}`);
      }

      if (filterFields.keyword) {
        const keyword_string = '%'.concat(filterFields.keyword).concat('%');
        sqlStatement.append(SQL` AND p.name ilike ${keyword_string}`);
        sqlStatement.append(SQL` AND fs.name ilike ${keyword_string}`);
        sqlStatement.append(SQL` OR s.name ilike ${keyword_string}`);
      }
    }

    sqlStatement.append(SQL`
      group by
        p.project_id,
        p.name,
        p.start_date,
        p.end_date,
        p.uuid,
        p.revision_count
    `);

    /*
      this is placed after the `group by` to take advantage of the `HAVING` clause
      by placing the filter in the HAVING clause we are able to properly search
      on program ids while still returning the full list that is associated to the project
    */
    if (filterFields.project_programs) {
      let programs = filterFields.project_programs;
      if (!isArray(filterFields.project_programs)) {
        programs = [filterFields.project_programs];
      }

      // postgres arrays literals start and end with {}
      sqlStatement.append(SQL` HAVING array_agg(distinct p2.program_id) && '{`);
      programs.forEach((id, index) => {
        // add the element
        sqlStatement.append(id);

        if (index !== programs.length - 1) {
          // add a comma unless it is the last element in the array
          sqlStatement.append(',');
        }
      });
      sqlStatement.append(SQL`}'`);
    }

    sqlStatement.append(';');

    const response = await this.connection.sql(sqlStatement, ProjectListData);

    return response.rows;
  }

  async getProjectData(projectId: number): Promise<ProjectData> {
    const getProjectSqlStatement = SQL`
      SELECT
        p.project_id,
        p.uuid,
        p.name as project_name,
        p.objectives,
        p.location_description,
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
