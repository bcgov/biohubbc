import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-view-queries');

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
  defaultLog.debug({
    label: 'getAllAssignablePermitsForASurveySQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
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

  defaultLog.debug({
    label: 'getAllAssignablePermitsForASurveySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all survey ids for a given project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyIdsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyIdsSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      survey_id as id
    FROM
      survey
    WHERE
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getSurveyIdsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all surveys for list view.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyListSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyListSQL',
    message: 'params',
    projectId
  });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      s.survey_id as id,
      s.name,
      s.start_date,
      s.end_date,
      s.publish_timestamp,
      CONCAT_WS(' - ', wtu.english_name, CONCAT_WS(' ', wtu.unit_name1, wtu.unit_name2, wtu.unit_name3)) as species
    FROM
      wldtaxonomic_units as wtu
    LEFT OUTER JOIN
      study_species as ss
    ON
      ss.wldtaxonomic_units_id = wtu.wldtaxonomic_units_id
    LEFT OUTER JOIN
      survey as s
    ON
      s.survey_id = ss.survey_id
    WHERE
      s.project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getSurveyListSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

export const getSurveyBasicDataForViewSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyBasicDataForViewSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      s.survey_id as id,
      s.name,
      s.objectives,
      s.start_date,
      s.end_date,
      s.lead_first_name,
      s.lead_last_name,
      s.location_name,
      s.geojson as geometry,
      s.revision_count,
      s.publish_timestamp as publish_date,
      per.number,
      per.type,
      csm.name as common_survey_methodology,
      max(os.occurrence_submission_id) as occurrence_submission_id,
      max(sss.survey_summary_submission_id) as survey_summary_submission_id
    FROM
      survey as s
    LEFT OUTER JOIN
      permit as per
    ON
      per.survey_id = s.survey_id
    LEFT OUTER JOIN
      common_survey_methodology as csm
    ON
      csm.common_survey_methodology_id = s.common_survey_methodology_id
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
      s.objectives,
      s.start_date,
      s.end_date,
      s.lead_first_name,
      s.lead_last_name,
      s.location_name,
      s.geojson,
      s.revision_count,
      s.publish_timestamp,
      per.number,
      per.type,
      csm.name;
  `;

  defaultLog.debug({
    label: 'getBasicSurveyDataForViewSQ',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

export const getSurveyFundingSourcesDataForViewSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveyFundingSourcesDataForViewSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      sfs.project_funding_source_id as pfs_id,
      pfs.funding_amount::numeric::int,
      pfs.funding_start_date,
      pfs.funding_end_date,
      fs.name as agency_name
    FROM
      survey as s
    LEFT OUTER JOIN
      survey_funding_source as sfs
    ON
      sfs.survey_id = s.survey_id
    LEFT OUTER JOIN
      project_funding_source as pfs
    ON
      pfs.project_funding_source_id = sfs.project_funding_source_id
    LEFT OUTER JOIN
      investment_action_category as iac
    ON
      pfs.investment_action_category_id = iac.investment_action_category_id
    LEFT OUTER JOIN
      funding_source as fs
    ON
      iac.funding_source_id = fs.funding_source_id
    WHERE
      s.survey_id = ${surveyId}
    GROUP BY
      sfs.project_funding_source_id,
      pfs.funding_amount::numeric::int,
      pfs.funding_start_date,
      pfs.funding_end_date,
      fs.name
    order by
      pfs.funding_start_date;
  `;

  defaultLog.debug({
    label: 'getSurveyFundingSourcesDataForViewSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

export const getSurveySpeciesDataForViewSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getSurveySpeciesDataForViewSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      array_remove(
        array_agg(
          DISTINCT CASE
            WHEN ss.is_focal = TRUE
              THEN CONCAT_WS(' - ', wtu.english_name, CONCAT_WS(' ', wtu.unit_name1, wtu.unit_name2, wtu.unit_name3))
            END
        ),
        NULL
      ) as focal_species,
      array_remove(
        array_agg(
          DISTINCT CASE
            WHEN ss.is_focal = FALSE
              THEN CONCAT_WS(' - ', wtu.english_name, CONCAT_WS(' ', wtu.unit_name1, wtu.unit_name2, wtu.unit_name3))
            END
        ),
        NULL
      ) as ancillary_species
    FROM
      wldtaxonomic_units as wtu
    LEFT OUTER JOIN
      study_species as ss
    ON
      ss.wldtaxonomic_units_id = wtu.wldtaxonomic_units_id
    LEFT OUTER JOIN
      survey as s
    ON
      s.survey_id = ss.survey_id
    WHERE
      s.survey_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getSurveySpeciesDataForViewSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
