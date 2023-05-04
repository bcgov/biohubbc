import { NumberOfAutoScalingGroups } from 'aws-sdk/clients/autoscaling';
import { QueryResult } from 'pg';
import SQL, { SQLStatement } from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PostFundingSource, PostProjectObject } from '../models/project-create';
import {
  PutCoordinatorData,
  PutFundingSource,
  PutLocationData,
  PutObjectivesData,
  PutProjectData
} from '../models/project-update';
import {
  GetAttachmentsData,
  GetCoordinatorData,
  GetFundingData,
  GetIUCNClassificationData,
  GetLocationData,
  GetObjectivesData,
  GetProjectData,
  GetReportAttachmentsData
} from '../models/project-view';
import { queries } from '../queries/queries';
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing project data.
 *
 * @export
 * @class ProjectRepository
 * @extends {BaseRepository}
 */
export class ProjectRepository extends BaseRepository {
  async getProjectFundingSourceIds(
    projectId: number
  ): Promise<
    {
      project_funding_source_id: number;
    }[]
  > {
    const sqlStatement = SQL`
    SELECT
      pfs.project_funding_source_id
    FROM
      project_funding_source pfs
    WHERE
      pfs.project_id = ${projectId};
  `;

    const response = await this.connection.sql<{
      project_funding_source_id: number;
    }>(sqlStatement);

    const result = response?.rows;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project funding sources by Id', [
        'ProjectRepository->getProjectFundingSourceIds',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async deleteSurveyFundingSourceConnectionToProject(projectFundingSourceId: number) {
    const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_funding_source sfs
    WHERE
      sfs.project_funding_source_id = ${projectFundingSourceId}
    RETURNING survey_id;`;

    const response = await this.connection.sql(sqlStatement);

    const result = response?.rows;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to delete survey funding source by id', [
        'ProjectRepository->deleteSurveyFundingSourceConnectionToProject',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async deleteProjectFundingSource(projectFundingSourceId: number) {
    const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_funding_source
    WHERE
        project_funding_source_id = ${projectFundingSourceId};
  `;

    const response = await this.connection.sql(sqlStatement);

    const result = response?.rows;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to delete project funding source', [
        'ProjectRepository->deleteProjectFundingSource',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async updateProjectFundingSource(
    fundingSource: PutFundingSource,
    projectId: number
  ): Promise<{ project_funding_source_id: number }> {
    const sqlStatement: SQLStatement = SQL`
    UPDATE
        project_funding_source
    SET
      project_id =  ${projectId},
      investment_action_category_id = ${fundingSource.investment_action_category},
      funding_source_project_id = ${fundingSource.agency_project_id},
      funding_amount = ${fundingSource.funding_amount},
      funding_start_date = ${fundingSource.start_date},
      funding_end_date = ${fundingSource.end_date},
      first_nations_id = ${fundingSource.first_nations_id}
    WHERE
      project_funding_source_id = ${fundingSource.id}
    RETURNING
      project_funding_source_id;
  `;

    const response = await this.connection.sql<{ project_funding_source_id: number }>(sqlStatement);

    const result = response?.rows?.[0];

    if (!result) {
      throw new ApiExecuteSQLError('Failed to update project funding source', [
        'ProjectRepository->putProjectFundingSource',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async insertProjectFundingSource(
    fundingSource: PutFundingSource,
    projectId: number
  ): Promise<{ project_funding_source_id: number }> {
    const sqlStatement: SQLStatement = SQL`
    INSERT INTO project_funding_source (
      project_id,
      investment_action_category_id,
      funding_source_project_id,
      funding_amount,
      funding_start_date,
      funding_end_date,
      first_nations_id
    ) VALUES (
      ${projectId},
      ${fundingSource.investment_action_category},
      ${fundingSource.agency_project_id},
      ${fundingSource.funding_amount},
      ${fundingSource.start_date},
      ${fundingSource.end_date},
      ${fundingSource.first_nations_id}
    )
    RETURNING
      project_funding_source_id;
  `;

    const response = await this.connection.sql<{ project_funding_source_id: number }>(sqlStatement);

    const result = response?.rows?.[0];

    if (!result) {
      throw new ApiExecuteSQLError('Failed to insert project funding source', [
        'ProjectRepository->putProjectFundingSource',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async deleteDraft(draftId: number): Promise<QueryResult> {
    const sqlStatement = SQL`
      DELETE from webform_draft
      WHERE webform_draft_id = ${draftId};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response) {
      throw new ApiExecuteSQLError('Failed to delete draft', [
        'ProjectRepository->deleteDraft',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response;
  }

  async getSingleDraft(draftId: number): Promise<{ id: number; name: string; data: any }> {
    const sqlStatement: SQLStatement = SQL`
      SELECT
        webform_draft_id as id,
        name,
        data
      FROM
        webform_draft
      WHERE
        webform_draft_id = ${draftId};
    `;

    const response = await this.connection.sql<{ id: number; name: string; data: any }>(sqlStatement);

    if (!response?.rows?.[0]) {
      throw new ApiExecuteSQLError('Failed to get draft', [
        'ProjectRepository->getSingleDraft',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response?.rows?.[0];
  }

  async getProjectList(isUserAdmin: boolean, systemUserId: number | null, filterFields: any): Promise<any[]> {
    const sqlStatement = SQL`
      SELECT
        p.project_id as id,
        p.name,
        p.start_date,
        p.end_date,
        p.coordinator_agency_name as coordinator_agency,
        pt.name as project_type
      from
        project as p
      left outer join project_type as pt
        on p.project_type_id = pt.project_type_id
      left outer join project_funding_source as pfs
        on pfs.project_id = p.project_id
      left outer join investment_action_category as iac
        on pfs.investment_action_category_id = iac.investment_action_category_id
      left outer join funding_source as fs
        on iac.funding_source_id = fs.funding_source_id
      left outer join survey as s
        on s.project_id = p.project_id
      left outer join study_species as sp
        on sp.survey_id = s.survey_id
      where 1 = 1
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
      if (filterFields.coordinator_agency) {
        sqlStatement.append(SQL` AND p.coordinator_agency_name = ${filterFields.coordinator_agency}`);
      }

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

      if (filterFields.project_type) {
        sqlStatement.append(SQL` AND pt.name = ${filterFields.project_type}`);
      }

      if (filterFields.project_name) {
        sqlStatement.append(SQL` AND p.name = ${filterFields.project_name}`);
      }

      if (filterFields.agency_project_id) {
        sqlStatement.append(SQL` AND pfs.funding_source_project_id = ${filterFields.agency_project_id}`);
      }

      if (filterFields.agency_id) {
        sqlStatement.append(SQL` AND fs.funding_source_id = ${filterFields.agency_id}`);
      }

      if (filterFields?.species?.length > 0) {
        sqlStatement.append(SQL` AND sp.wldtaxonomic_units_id =${filterFields.species[0]}`);
      }

      if (filterFields.keyword) {
        const keyword_string = '%'.concat(filterFields.keyword).concat('%');
        sqlStatement.append(SQL` AND p.name ilike ${keyword_string}`);
        sqlStatement.append(SQL` OR p.coordinator_agency_name ilike ${keyword_string}`);
        sqlStatement.append(SQL` OR fs.name ilike ${keyword_string}`);
        sqlStatement.append(SQL` OR s.name ilike ${keyword_string}`);
      }
    }

    sqlStatement.append(SQL`
      group by
        p.project_id,
        p.name,
        p.start_date,
        p.end_date,
        p.coordinator_agency_name,
        pt.name;
    `);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response.rows) {
      return [];
    }

    return response.rows;
  }

  async getProjectData(projectId: number): Promise<GetProjectData> {
    const getProjectSqlStatement = SQL`
      SELECT
        project.project_id,
        project.uuid,
        project.project_type_id as pt_id,
        project_type.name as type,
        project.name,
        project.objectives,
        project.location_description,
        project.start_date,
        project.end_date,
        project.caveats,
        project.comments,
        project.coordinator_first_name,
        project.coordinator_last_name,
        project.coordinator_email_address,
        project.coordinator_agency_name,
        project.coordinator_public,
        project.geojson as geometry,
        project.create_date,
        project.create_user,
        project.update_date,
        project.update_user,
        project.revision_count
      from
        project
      left outer join
        project_type
          on project.project_type_id = project_type.project_type_id
      where
        project.project_id = ${projectId};
    `;

    const getProjectActivitiesSQLStatement = SQL`
      SELECT
        activity_id
      from
        project_activity
      where project_id = ${projectId};
    `;

    const [project, activity] = await Promise.all([
      this.connection.query(getProjectSqlStatement.text, getProjectSqlStatement.values),
      this.connection.query(getProjectActivitiesSQLStatement.text, getProjectActivitiesSQLStatement.values)
    ]);

    const projectResult = project?.rows?.[0]
    const activityResult = activity?.rows;

    if (!projectResult || !activityResult) {
      throw new ApiExecuteSQLError('Failed to get project data', [
        'ProjectRepository->getProjectData',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return new GetProjectData(projectResult, activityResult);
  }

  async getObjectivesData(projectId: number): Promise<GetObjectivesData> {
    const sqlStatement = SQL`
      SELECT
        objectives,
        caveats,
        revision_count
      FROM
        project
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project objectives data', [
        'ProjectRepository->getObjectivesData',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return new GetObjectivesData(result);
  }

  async getCoordinatorData(projectId: number): Promise<GetCoordinatorData> {
    const sqlStatement = SQL`
      SELECT
        coordinator_first_name,
        coordinator_last_name,
        coordinator_email_address,
        coordinator_agency_name,
        coordinator_public,
        revision_count
      FROM
        project
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project contact data', [
        'ProjectRepository->getCoordinatorData',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return new GetCoordinatorData(result);
  }

  async getLocationData(projectId: number): Promise<GetLocationData> {
    const sqlStatement = SQL`
      SELECT
        p.location_description,
        p.geojson as geometry,
        p.revision_count
      FROM
        project p
      WHERE
        p.project_id = ${projectId}
      GROUP BY
        p.location_description,
        p.geojson,
        p.revision_count;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project location data', [
        'ProjectRepository->getLocationData',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return new GetLocationData(result);
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

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project IUCN Classification data', [
        'ProjectRepository->getIUCNClassificationData',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return new GetIUCNClassificationData(result);
  }

  async getFundingData(projectId: number): Promise<GetFundingData> {
    const sqlStatement = SQL`
      SELECT
        pfs.project_funding_source_id as id,
        fs.funding_source_id as agency_id,
        pfs.funding_amount::numeric::int,
        pfs.funding_start_date as start_date,
        pfs.funding_end_date as end_date,
        iac.investment_action_category_id as investment_action_category,
        iac.name as investment_action_category_name,
        fs.name as agency_name,
        pfs.funding_source_project_id as agency_project_id,
        pfs.revision_count as revision_count,
        pfs.first_nations_id,
        fn.name as first_nations_name
      FROM
        project_funding_source as pfs
      LEFT OUTER JOIN
        investment_action_category as iac
      ON
        pfs.investment_action_category_id = iac.investment_action_category_id
      LEFT OUTER JOIN
        funding_source as fs
      ON
        iac.funding_source_id = fs.funding_source_id
      LEFT OUTER JOIN 
        first_nations as fn
      ON
        fn.first_nations_id = pfs.first_nations_id
      WHERE
        pfs.project_id = ${projectId}
      GROUP BY
        pfs.project_funding_source_id,
        fs.funding_source_id,
        pfs.funding_source_project_id,
        pfs.funding_amount,
        pfs.funding_start_date,
        pfs.funding_end_date,
        iac.investment_action_category_id,
        iac.name,
        fs.name,
        pfs.revision_count,
        pfs.first_nations_id,
        fn.name
    `;
    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project funding data', [
        'ProjectRepository->getFundingData',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return new GetFundingData(result);
  }

  async getIndigenousPartnershipsRows(projectId: number): Promise<any[]> {
    const sqlStatement = SQL`
      SELECT
        fn.first_nations_id as id,
        fn.name as first_nations_name
      FROM
        project_first_nation pfn
      LEFT OUTER JOIN
        first_nations fn
      ON
        pfn.first_nations_id = fn.first_nations_id
      WHERE
        pfn.project_id = ${projectId}
      GROUP BY
        fn.first_nations_id,
        fn.name;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project Indigenous Partnerships data', [
        'ProjectRepository->getIndigenousPartnershipsRows',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async getStakeholderPartnershipsRows(projectId: number): Promise<any[]> {
    const sqlStatement = SQL`
      SELECT
        name as partnership_name
      FROM
        stakeholder_partnership
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project Stakeholder Partnerships data', [
        'ProjectRepository->getStakeholderPartnershipsRows',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
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

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project Attachment data', [
        'ProjectRepository->getAttachmentsData',
        'rows was null or undefined, expected rows != null'
      ]);
    }
    return new GetAttachmentsData(result);
  }

  async getReportAttachmentsData(projectId: number): Promise<GetReportAttachmentsData> {
    const sqlStatement = SQL`
      SELECT
        pra.project_report_attachment_id
        , pra.project_id
        , pra.file_name
        , pra.title
        , pra.description
        , pra.year
        , pra."key"
        , pra.file_size
        , array_remove(array_agg(pra2.first_name ||' '||pra2.last_name), null) authors
      FROM
        project_report_attachment pra
      LEFT JOIN project_report_author pra2 ON pra2.project_report_attachment_id = pra.project_report_attachment_id
      WHERE pra.project_id = ${projectId}
      GROUP BY
        pra.project_report_attachment_id
        , pra.project_id
        , pra.file_name
        , pra.title
        , pra.description
        , pra.year
        , pra."key"
        , pra.file_size;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    return new GetReportAttachmentsData(result);
  }

  async insertProject(postProjectData: PostProjectObject): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project (
        project_type_id,
        name,
        objectives,
        location_description,
        start_date,
        end_date,
        caveats,
        comments,
        coordinator_first_name,
        coordinator_last_name,
        coordinator_email_address,
        coordinator_agency_name,
        coordinator_public,
        geojson,
        geography
      ) VALUES (
        ${postProjectData.project.type},
        ${postProjectData.project.name},
        ${postProjectData.objectives.objectives},
        ${postProjectData.location.location_description},
        ${postProjectData.project.start_date},
        ${postProjectData.project.end_date},
        ${postProjectData.objectives.caveats},
        ${postProjectData.project.comments},
        ${postProjectData.coordinator.first_name},
        ${postProjectData.coordinator.last_name},
        ${postProjectData.coordinator.email_address},
        ${postProjectData.coordinator.coordinator_agency},
        ${postProjectData.coordinator.share_contact_details},
        ${JSON.stringify(postProjectData.location.geometry)}
    `;

    if (postProjectData.location.geometry && postProjectData.location.geometry.length) {
      const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(postProjectData.location.geometry);

      sqlStatement.append(SQL`
        ,public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
      `);

      sqlStatement.append(geometryCollectionSQL);

      sqlStatement.append(SQL`
        , 4326)))
      `);
    } else {
      sqlStatement.append(SQL`
        ,null
      `);
    }

    sqlStatement.append(SQL`
      )
      RETURNING
        project_id as id;
    `);

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiExecuteSQLError('Failed to insert project boundary data', [
        'ProjectRepository->insertProject',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result.id;
  }

  async insertFundingSource(fundingSource: PostFundingSource, project_id: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project_funding_source (
        project_id,
        investment_action_category_id,
        funding_source_project_id,
        funding_amount,
        funding_start_date,
        funding_end_date,
        first_nations_id
      ) VALUES (
        ${project_id},
        ${fundingSource.investment_action_category},
        ${fundingSource.agency_project_id},
        ${fundingSource.funding_amount},
        ${fundingSource.start_date},
        ${fundingSource.end_date},
        ${fundingSource.first_nations_id}
      )
      RETURNING
        project_funding_source_id as id;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;
    if (!result || !result.id) {
      throw new ApiExecuteSQLError('Failed to insert project funding data', [
        'ProjectRepository->insertFundingSource',
        'rows was null or undefined, expected rows != null'
      ]);
    }
    return result.id;
  }

  async insertIndigenousNation(indigenousNationsId: number, project_id: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project_first_nation (
        project_id,
        first_nations_id
      ) VALUES (
        ${project_id},
        ${indigenousNationsId}
      )
      RETURNING
        first_nations_id as id;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiExecuteSQLError('Failed to insert project first nations partnership data', [
        'ProjectRepository->insertIndigenousNation',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result.id;
  }

  async insertStakeholderPartnership(stakeholderPartner: string, project_id: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO stakeholder_partnership (
        project_id,
        name
      ) VALUES (
        ${project_id},
        ${stakeholderPartner}
      )
      RETURNING
        stakeholder_partnership_id as id;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiExecuteSQLError('Failed to insert project stakeholder partnership data', [
        'ProjectRepository->insertStakeholderPartnership',
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

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiExecuteSQLError('Failed to insert project IUCN data', [
        'ProjectRepository->insertClassificationDetail',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result.id;
  }

  async insertActivity(activityId: number, projectId: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO project_activity (
        activity_id,
        project_id
      ) VALUES (
        ${activityId},
        ${projectId}
      )
      RETURNING
        project_activity_id as id;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiExecuteSQLError('Failed to insert project activity data', [
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

    await this.connection.query(sqlDeleteStatement.text, sqlDeleteStatement.values);
  }

  async deleteIndigenousPartnershipsData(projectId: number): Promise<void> {
    const sqlDeleteStatement = SQL`
      DELETE
        from project_first_nation
      WHERE
        project_id = ${projectId};
    `;

    await this.connection.query(sqlDeleteStatement.text, sqlDeleteStatement.values);
  }

  async deleteStakeholderPartnershipsData(projectId: number): Promise<void> {
    const sqlDeleteStatement = SQL`
      DELETE
        from stakeholder_partnership
      WHERE
        project_id = ${projectId};
    `;

    await this.connection.query(sqlDeleteStatement.text, sqlDeleteStatement.values);
  }

  async updateProjectData(
    projectId: number,
    project: PutProjectData | null,
    location: PutLocationData | null,
    objectives: PutObjectivesData | null,
    coordinator: PutCoordinatorData | null,
    revision_count: number
  ): Promise<void> {
    if (!project && !location && !objectives && !coordinator) {
      // Nothing to update
      throw new ApiExecuteSQLError('Nothing to update for Project Data', [
        'ProjectRepository->updateProjectData',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    const sqlStatement: SQLStatement = SQL`UPDATE project SET `;

    const sqlSetStatements: SQLStatement[] = [];

    if (project) {
      sqlSetStatements.push(SQL`project_type_id = ${project.type}`);
      sqlSetStatements.push(SQL`name = ${project.name}`);
      sqlSetStatements.push(SQL`start_date = ${project.start_date}`);
      sqlSetStatements.push(SQL`end_date = ${project.end_date}`);
    }

    if (location) {
      sqlSetStatements.push(SQL`location_description = ${location.location_description}`);
      sqlSetStatements.push(SQL`geojson = ${JSON.stringify(location.geometry)}`);

      const geometrySQLStatement = SQL`geography = `;

      if (location.geometry && location.geometry.length) {
        const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(location.geometry);

        geometrySQLStatement.append(SQL`
        public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
      `);

        geometrySQLStatement.append(geometryCollectionSQL);

        geometrySQLStatement.append(SQL`
        , 4326)))
      `);
      } else {
        geometrySQLStatement.append(SQL`null`);
      }

      sqlSetStatements.push(geometrySQLStatement);
    }

    if (objectives) {
      sqlSetStatements.push(SQL`objectives = ${objectives.objectives}`);
      sqlSetStatements.push(SQL`caveats = ${objectives.caveats}`);
    }

    if (coordinator) {
      sqlSetStatements.push(SQL`coordinator_first_name = ${coordinator.first_name}`);
      sqlSetStatements.push(SQL`coordinator_last_name = ${coordinator.last_name}`);
      sqlSetStatements.push(SQL`coordinator_email_address = ${coordinator.email_address}`);
      sqlSetStatements.push(SQL`coordinator_agency_name = ${coordinator.coordinator_agency}`);
      sqlSetStatements.push(SQL`coordinator_public = ${coordinator.share_contact_details}`);
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

    const result = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!result || !result.rowCount) {
      throw new ApiExecuteSQLError('Failed to update stale project data', [
        'ProjectRepository->updateProjectData',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  async deleteActivityData(projectId: NumberOfAutoScalingGroups): Promise<void> {
    const sqlDeleteStatement = SQL`
      DELETE FROM
        project_activity
      WHERE
        project_id = ${projectId};
    `;

    await this.connection.query(sqlDeleteStatement.text, sqlDeleteStatement.values);
  }

  async deleteProject(projectId: number): Promise<void> {
    const sqlStatement = SQL`call api_delete_project(${projectId})`;

    await this.connection.sql(sqlStatement);
  }
}
