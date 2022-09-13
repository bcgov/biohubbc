import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get all permits applicable for a survey
 *
 * These are permits that are associated to a project but have not been used by any
 * other surveys under that project
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getAllAssignablePermitsForASurveySQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
    SELECT
      number,
      type
    FROM
      permit
    WHERE
      project_id = ${projectId}
    AND
      survey_id IS NULL;
  `;
};

/**
 * SQL query to get all survey ids for a given project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyIdsSQL = (projectId: number): SQLStatement => {
  return SQL`
    SELECT
      survey_id as id
    FROM
      survey
    WHERE
      project_id = ${projectId};
  `;
};

export const getSurveyBasicDataForViewSQL = (surveyId: number): SQLStatement | null => {
  if (!surveyId) {
    return null;
  }

  return SQL`
    SELECT
      s.survey_id as id,
      s.name,
      s.additional_details,
      s.field_method_id,
      s.ecological_season_id,
      s.intended_outcome_id,
      s.surveyed_all_areas,
      s.start_date,
      s.end_date,
      s.lead_first_name,
      s.lead_last_name,
      s.location_name,
      s.geojson as geometry,
      s.revision_count,
      per.number,
      per.type,
      max(os.occurrence_submission_id) as occurrence_submission_id,
      max(sss.survey_summary_submission_id) as survey_summary_submission_id
    FROM
      survey as s
    LEFT OUTER JOIN
      permit as per
    ON
      per.survey_id = s.survey_id
    LEFT OUTER JOIN
      field_method as fm
    ON
      fm.field_method_id = s.field_method_id
    LEFT OUTER JOIN
      occurrence_submission as os
    ON
      os.survey_id = s.survey_id
    LEFT OUTER JOIN
      survey_summary_submission sss
    ON
      sss.survey_id = s.survey_id
    WHERE
      s.survey_id = ${surveyId}
    GROUP BY
      s.survey_id,
      s.name,
      s.field_method_id,
      s.additional_details,
      s.intended_outcome_id,
      s.surveyed_all_areas,
      s.ecological_season_id,
      s.start_date,
      s.end_date,
      s.lead_first_name,
      s.lead_last_name,
      s.location_name,
      s.geojson,
      s.revision_count,
      per.number,
      per.type;
  `;
};

export const getSurveyFundingSourcesDataForViewSQL = (surveyId: number): SQLStatement | null => {
  if (!surveyId) {
    return null;
  }

  return SQL`
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
};

export const getSurveyFocalSpeciesDataForViewSQL = (surveyId: number): SQLStatement | null => {
  if (!surveyId) {
    return null;
  }

  return SQL`
    SELECT
      wldtaxonomic_units_id, is_focal
    FROM
      study_species
    WHERE
      survey_id = ${surveyId}
    AND
      is_focal = TRUE;
  `;
};

export const getLatestOccurrenceSubmissionIdSQL = (surveyId: number): SQLStatement | null => {
  if (!surveyId) {
    return null;
  }

  return SQL`
    SELECT
      max(occurrence_submission_id) as id
    FROM
      occurrence_submission
    WHERE
      survey_id = ${surveyId};
    `;
};

export const getLatestSummaryResultIdSQL = (surveyId: number): SQLStatement | null => {
  if (!surveyId) {
    return null;
  }

  return SQL`
    SELECT
      max(survey_summary_submission_id) as id
    FROM
      survey_summary_submission
    WHERE
      survey_id = ${surveyId};
    `;
};

/**
 * SQL query to get survey attachments.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getAttachmentsBySurveySQL = (surveyId: number): SQLStatement | null => {
  if (!surveyId) {
    return null;
  }

  return SQL`
    SELECT
      *
    FROM
    survey_attachment
    WHERE
    survey_id = ${surveyId};
  `;
};

/**
 * SQL query to get survey reports.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getReportAttachmentsBySurveySQL = (surveyId: number): SQLStatement | null => {
  if (!surveyId) {
    return null;
  }

  return SQL`
    SELECT 
      pra.survey_report_attachment_id 
      , pra.survey_id 
      , pra.file_name 
      , pra.title 
      , pra.description 
      , pra.year
      , pra."key" 
      , pra.file_size
      , pra.security_token
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
      , pra.file_size
      , pra.security_token;
  `;
};
