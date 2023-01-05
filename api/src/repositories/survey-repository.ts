import SQL from 'sql-template-strings';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { PostProprietorData, PostSurveyObject } from '../models/survey-create';
import { PutSurveyObject } from '../models/survey-update';
import {
  GetAttachmentsData,
  GetReportAttachmentsData,
  GetSurveyData,
  GetSurveyFundingSources,
  GetSurveyLocationData,
  GetSurveyProprietorData,
  GetSurveyPurposeAndMethodologyData
} from '../models/survey-view';
import { queries } from '../queries/queries';
import { BaseRepository } from './base-repository';

export interface IGetSpeciesData {
  wldtaxonomic_units_id: string;
  is_focal: boolean;
}

export interface IGetLatestSurveyOccurrenceSubmission {
  id: number;
  survey_id: number;
  source: string;
  delete_timestamp: string;
  event_timestamp: string;
  input_key: string;
  input_file_name: string;
  output_key: string;
  output_file_name: string;
  submission_status_id: number;
  submission_status_type_id: number;
  submission_status_type_name: string;
  submission_message_id: number;
  submission_message_type_id: number;
  message: string;
  submission_message_type_name: string;
}

export class SurveyRepository extends BaseRepository {
  async deleteSurvey(surveyId: number): Promise<void> {
    const sqlStatement = SQL`call api_delete_survey(${surveyId})`;

    await this.connection.sql(sqlStatement);
  }

  async getSurveyIdsByProjectId(projectId: number): Promise<{ id: number }[]> {
    const sqlStatement = SQL`
      SELECT
        survey_id as id
      FROM
        survey
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<{ id: number }>(sqlStatement);
    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project survey ids', [
        'SurveyRepository->getSurveyIdsByProjectId',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response.rows;
  }

  async getSurveyData(surveyId: number): Promise<GetSurveyData> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows?.[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project survey details data', [
        'SurveyRepository->getSurveyData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return new GetSurveyData(result);
  }

  async getSpeciesData(surveyId: number): Promise<IGetSpeciesData[]> {
    const sqlStatement = SQL`
      SELECT
        wldtaxonomic_units_id,
        is_focal
      FROM
        study_species
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<IGetSpeciesData>(sqlStatement);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get survey species data', [
        'SurveyRepository->getSpeciesData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return result;
  }

  async getSurveyPurposeAndMethodology(surveyId: number): Promise<GetSurveyPurposeAndMethodologyData> {
    const sqlStatement = SQL`
      SELECT
        s.field_method_id,
        s.additional_details,
        s.ecological_season_id,
        s.intended_outcome_id,
        s.surveyed_all_areas,
        array_remove(array_agg(sv.vantage_id), NULL) as vantage_ids
      FROM
        survey s
      LEFT OUTER JOIN
        survey_vantage sv
      ON
        sv.survey_id = s.survey_id
      WHERE
        s.survey_id = ${surveyId}
      GROUP BY
        s.field_method_id,
        s.additional_details,
        s.ecological_season_id,
        s.intended_outcome_id,
        s.surveyed_all_areas;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get survey purpose and methodology data', [
        'SurveyRepository->getSurveyPurposeAndMethodology',
        'response was null or undefined, expected response != null'
      ]);
    }

    return new GetSurveyPurposeAndMethodologyData(result);
  }

  async getSurveyFundingSourcesData(surveyId: number): Promise<GetSurveyFundingSources> {
    const sqlStatement = SQL`
      SELECT
        sfs.project_funding_source_id,
        fs.funding_source_id,
        pfs.funding_source_project_id,
        pfs.funding_amount::numeric::int,
        pfs.funding_start_date,
        pfs.funding_end_date,
        iac.investment_action_category_id,
        iac.name as investment_action_category_name,
        fs.name as agency_name
      FROM
        survey as s
      RIGHT OUTER JOIN
        survey_funding_source as sfs
      ON
        sfs.survey_id = s.survey_id
      RIGHT OUTER JOIN
        project_funding_source as pfs
      ON
        pfs.project_funding_source_id = sfs.project_funding_source_id
      RIGHT OUTER JOIN
        investment_action_category as iac
      ON
        pfs.investment_action_category_id = iac.investment_action_category_id
      RIGHT OUTER JOIN
        funding_source as fs
      ON
        iac.funding_source_id = fs.funding_source_id
      WHERE
        s.survey_id = ${surveyId}
      GROUP BY
        sfs.project_funding_source_id,
        fs.funding_source_id,
        pfs.funding_source_project_id,
        pfs.funding_amount,
        pfs.funding_start_date,
        pfs.funding_end_date,
        iac.investment_action_category_id,
        iac.name,
        fs.name
      ORDER BY
        pfs.funding_start_date;
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get survey funding sources data', [
        'SurveyRepository->getSurveyFundingSourcesData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return new GetSurveyFundingSources(result);
  }

  async getSurveyProprietorDataForView(surveyId: number): Promise<GetSurveyProprietorData | null> {
    const sqlStatement = SQL`
      SELECT
        prt.name as proprietor_type_name,
        prt.proprietor_type_id,
        fn.name as first_nations_name,
        fn.first_nations_id,
        sp.rationale as category_rationale,
        CASE
          WHEN sp.proprietor_name is not null THEN sp.proprietor_name
          WHEN fn.first_nations_id is not null THEN fn.name
        END as proprietor_name,
        sp.disa_required,
        sp.revision_count
      from
        survey_proprietor as sp
      left outer join proprietor_type as prt
        on sp.proprietor_type_id = prt.proprietor_type_id
      left outer join first_nations as fn
        on sp.first_nations_id is not null
        and sp.first_nations_id = fn.first_nations_id
      where
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows?.[0]) || null;

    if (!result) {
      return result;
    }

    return new GetSurveyProprietorData(result);
  }

  async getSurveyLocationData(surveyId: number): Promise<GetSurveyLocationData> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows?.[0]) || null;

    return new GetSurveyLocationData(result);
  }

  async getOccurrenceSubmissionId(surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      SELECT
        max(occurrence_submission_id) as id
      FROM
        occurrence_submission
      WHERE
        survey_id = ${surveyId};
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows?.[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get survey Occurrence submission Id', [
        'SurveyRepository->getOccurrenceSubmissionId',
        'response was null or undefined, expected response != null'
      ]);
    }
    return result;
  }

  async getLatestSurveyOccurrenceSubmission(surveyId: number): Promise<IGetLatestSurveyOccurrenceSubmission | null> {
    const sqlStatement = SQL`
      SELECT
        os.occurrence_submission_id as id,
        os.survey_id,
        os.source,
        os.delete_timestamp,
        os.event_timestamp,
        os.input_key,
        os.input_file_name,
        os.output_key,
        os.output_file_name,
        ss.submission_status_id,
        ss.submission_status_type_id,
        sst.name as submission_status_type_name,
        sm.submission_message_id,
        sm.submission_message_type_id,
        sm.message,
        smt.name as submission_message_type_name
      FROM
        occurrence_submission as os
      LEFT OUTER JOIN
        submission_status as ss
      ON
        os.occurrence_submission_id = ss.occurrence_submission_id
      LEFT OUTER JOIN
        submission_status_type as sst
      ON
        sst.submission_status_type_id = ss.submission_status_type_id
      LEFT OUTER JOIN
        submission_message as sm
      ON
        sm.submission_status_id = ss.submission_status_id
      LEFT OUTER JOIN
        submission_message_type as smt
      ON
        smt.submission_message_type_id = sm.submission_message_type_id
      WHERE
        os.survey_id = ${surveyId}
      ORDER BY
        os.event_timestamp DESC, ss.submission_status_id DESC
      LIMIT 1
      ;
    `;

    const response = await this.connection.sql<IGetLatestSurveyOccurrenceSubmission>(sqlStatement);

    const result = (response && response.rows && response.rows?.[0]) || null;

    return result;
  }

  async getSummaryResultId(surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      SELECT
        max(survey_summary_submission_id) as id
      FROM
        survey_summary_submission
      WHERE
        survey_id = ${surveyId};
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows?.[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get summary result id', [
        'SurveyRepository->getSummaryResultId',
        'response was null or undefined, expected response != null'
      ]);
    }

    return result;
  }

  async getAttachmentsData(surveyId: number): Promise<GetAttachmentsData> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey_attachment
      WHERE
        survey_id = ${surveyId};
    `;
    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows) || null;

    return new GetAttachmentsData(result);
  }

  async getReportAttachmentsData(surveyId: number): Promise<GetReportAttachmentsData> {
    const sqlStatement = SQL`
      SELECT
        pra.survey_report_attachment_id
        , pra.survey_id
        , pra.file_name
        , pra.title
        , pra.description
        , pra.year
        , pra."key"
        , pra.file_size
        , array_remove(array_agg(pra2.first_name ||' '||pra2.last_name), null) authors
      FROM
      survey_report_attachment pra
      LEFT JOIN survey_report_author pra2 ON pra2.survey_report_attachment_id = pra.survey_report_attachment_id
      WHERE pra.survey_id = ${surveyId}
      GROUP BY
        pra.survey_report_attachment_id
        , pra.survey_id
        , pra.file_name
        , pra.title
        , pra.description
        , pra.year
        , pra."key"
        , pra.file_size;
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get attachments data', [
        'SurveyRepository->getReportAttachmentsData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return new GetReportAttachmentsData(result);
  }

  async insertSurveyData(projectId: number, surveyData: PostSurveyObject): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO survey (
        project_id,
        name,
        start_date,
        end_date,
        lead_first_name,
        lead_last_name,
        field_method_id,
        additional_details,
        ecological_season_id,
        intended_outcome_id,
        surveyed_all_areas,
        location_name,
        geojson,
        geography
      ) VALUES (
        ${projectId},
        ${surveyData.survey_details.survey_name},
        ${surveyData.survey_details.start_date},
        ${surveyData.survey_details.end_date},
        ${surveyData.survey_details.biologist_first_name},
        ${surveyData.survey_details.biologist_last_name},
        ${surveyData.purpose_and_methodology.field_method_id},
        ${surveyData.purpose_and_methodology.additional_details},
        ${surveyData.purpose_and_methodology.ecological_season_id},
        ${surveyData.purpose_and_methodology.intended_outcome_id},
        ${surveyData.purpose_and_methodology.surveyed_all_areas},
        ${surveyData.location.survey_area_name},
        ${JSON.stringify(surveyData.location.geometry)}
    `;

    if (surveyData.location.geometry && surveyData.location.geometry.length) {
      const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(surveyData.location.geometry);

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
        survey_id as id;
    `);

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to insert survey data', [
        'SurveyRepository->insertSurveyData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return result.id;
  }

  async insertFocalSpecies(focal_species_id: number, surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO study_species (
        wldtaxonomic_units_id,
        is_focal,
        survey_id
      ) VALUES (
        ${focal_species_id},
        TRUE,
        ${surveyId}
      ) RETURNING study_species_id as id;
    `;

    const response = await this.connection.sql(sqlStatement);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiExecuteSQLError('Failed to insert focal species data', [
        'SurveyRepository->insertSurveyData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return result.id;
  }

  async insertAncillarySpecies(ancillary_species_id: number, surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO study_species (
        wldtaxonomic_units_id,
        is_focal,
        survey_id
      ) VALUES (
        ${ancillary_species_id},
        FALSE,
        ${surveyId}
      ) RETURNING study_species_id as id;
    `;

    const response = await this.connection.sql(sqlStatement);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiExecuteSQLError('Failed to insert ancillary species data', [
        'SurveyRepository->insertSurveyData',
        'response was null or undefined, expected response != null'
      ]);
    }

    return result.id;
  }

  async insertVantageCodes(vantage_code_id: number, surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO survey_vantage (
        vantage_id,
        survey_id
      ) VALUES (
        ${vantage_code_id},
        ${surveyId}
      ) RETURNING survey_vantage_id as id;
    `;

    const response = await this.connection.sql(sqlStatement);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiExecuteSQLError('Failed to insert vantage codes', [
        'SurveyRepository->insertVantageCodes',
        'response was null or undefined, expected response != null'
      ]);
    }
    return result.id;
  }

  async insertSurveyProprietor(survey_proprietor: PostProprietorData, surveyId: number): Promise<number | undefined> {
    if (!survey_proprietor.survey_data_proprietary) {
      return;
    }

    const sqlStatement = SQL`
      INSERT INTO survey_proprietor (
        survey_id,
        proprietor_type_id,
        first_nations_id,
        rationale,
        proprietor_name,
        disa_required
      ) VALUES (
        ${surveyId},
        ${survey_proprietor.prt_id},
        ${survey_proprietor.fn_id},
        ${survey_proprietor.rationale},
        ${survey_proprietor.proprietor_name},
        ${survey_proprietor.disa_required}
      )
      RETURNING
        survey_proprietor_id as id;
    `;

    const response = await this.connection.sql(sqlStatement);
    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw new ApiExecuteSQLError('Failed to insert survey proprietor data', [
        'SurveyRepository->insertSurveyProprietor',
        'response was null or undefined, expected response != null'
      ]);
    }

    return result.id;
  }

  async associateSurveyToPermit(projectId: number, surveyId: number, permitNumber: string): Promise<void> {
    const sqlStatement = SQL`
      UPDATE
        permit
      SET
        survey_id = ${surveyId}
      WHERE
        project_id = ${projectId}
      AND
        number = ${permitNumber};
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to update survey permit record', [
        'SurveyRepository->associateSurveyToPermit',
        'response was null or undefined, expected response != null'
      ]);
    }
  }

  async insertSurveyPermit(
    systemUserId: number,
    projectId: number,
    surveyId: number,
    permitNumber: string,
    permitType: string
  ): Promise<void> {
    const sqlStatement = SQL`
    INSERT INTO permit (
      system_user_id,
      project_id,
      survey_id,
      number,
      type
    ) VALUES (
      ${systemUserId},
      ${projectId},
      ${surveyId},
      ${permitNumber},
      ${permitType}
    )
    ON CONFLICT (number) DO
    UPDATE SET
      survey_id = ${surveyId}
    WHERE
      permit.project_id = ${projectId}
    AND
      permit.survey_id is NULL;
  `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert survey permit record', [
        'SurveyRepository->insertSurveyPermit',
        'response was null or undefined, expected response != null'
      ]);
    }
  }

  async insertSurveyFundingSource(funding_source_id: number, surveyId: number) {
    const sqlStatement = SQL`
      INSERT INTO survey_funding_source (
        survey_id,
        project_funding_source_id
      ) VALUES (
        ${surveyId},
        ${funding_source_id}
      );
    `;
    await this.connection.query(sqlStatement.text, sqlStatement.values);
  }

  async updateSurveyDetailsData(surveyId: number, surveyData: PutSurveyObject) {
    const knex = getKnex();

    let fieldsToUpdate = {};

    if (surveyData.survey_details) {
      fieldsToUpdate = {
        ...fieldsToUpdate,
        name: surveyData.survey_details.name,
        start_date: surveyData.survey_details.start_date,
        end_date: surveyData.survey_details.end_date,
        lead_first_name: surveyData.survey_details.lead_first_name,
        lead_last_name: surveyData.survey_details.lead_last_name,
        revision_count: surveyData.survey_details.revision_count
      };
    }

    if (surveyData.purpose_and_methodology) {
      fieldsToUpdate = {
        ...fieldsToUpdate,
        field_method_id: surveyData.purpose_and_methodology.field_method_id,
        additional_details: surveyData.purpose_and_methodology.additional_details,
        ecological_season_id: surveyData.purpose_and_methodology.ecological_season_id,
        intended_outcome_id: surveyData.purpose_and_methodology.intended_outcome_id,
        surveyed_all_areas: surveyData.purpose_and_methodology.surveyed_all_areas,
        revision_count: surveyData.purpose_and_methodology.revision_count
      };
    }

    if (surveyData.location) {
      const geometrySqlStatement = SQL``;

      if (surveyData.location.geometry && surveyData.location.geometry.length) {
        geometrySqlStatement.append(SQL`
        public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
      `);

        const geometryCollectionSQL = queries.spatial.generateGeometryCollectionSQL(surveyData.location.geometry);
        geometrySqlStatement.append(geometryCollectionSQL);

        geometrySqlStatement.append(SQL`
        , 4326)))
      `);
      } else {
        geometrySqlStatement.append(SQL`
        null
      `);
      }

      fieldsToUpdate = {
        ...fieldsToUpdate,
        location_name: surveyData.location.survey_area_name,
        geojson: JSON.stringify(surveyData.location.geometry),
        geography: knex.raw(geometrySqlStatement.sql, geometrySqlStatement.values),
        revision_count: surveyData.location.revision_count
      };
    }

    const updateSurveyQueryBuilder = knex('survey').update(fieldsToUpdate).where('survey_id', surveyId);

    const result = await this.connection.knex(updateSurveyQueryBuilder);

    if (!result || !result.rowCount) {
      throw new ApiExecuteSQLError('Failed to update survey data', [
        'SurveyRepository->updateSurveyDetailsData',
        'response was null or undefined, expected response != null'
      ]);
    }
  }

  async deleteSurveySpeciesData(surveyId: number) {
    const sqlStatement = SQL`
      DELETE
        from study_species
      WHERE
        survey_id = ${surveyId};
    `;

    await this.connection.sql(sqlStatement);
  }

  async unassociatePermitFromSurvey(surveyId: number) {
    const sqlStatement = SQL`
      UPDATE
        permit
      SET
        survey_id = ${null}
      WHERE
        survey_id = ${surveyId};
    `;

    await this.connection.sql(sqlStatement);
  }

  async deleteSurveyFundingSourcesData(surveyId: number) {
    const sqlStatement = SQL`
      DELETE
        from survey_funding_source
      WHERE
        survey_id = ${surveyId};
    `;

    await this.connection.sql(sqlStatement);
  }

  async deleteSurveyProprietorData(surveyId: number) {
    const sqlStatement = SQL`
      DELETE
        from survey_proprietor
      WHERE
        survey_id = ${surveyId};
    `;

    await this.connection.sql(sqlStatement);
  }

  async deleteSurveyVantageCodes(surveyId: number) {
    const sqlStatement = SQL`
      DELETE
        from survey_vantage
      WHERE
        survey_id = ${surveyId};
    `;

    await this.connection.sql(sqlStatement);
  }
}
