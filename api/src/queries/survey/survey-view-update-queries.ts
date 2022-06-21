import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to retrieve a survey_proprietor row.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyProprietorForUpdateSQL = (surveyId: number): SQLStatement => {
  return SQL`
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
};

/**
 * SQL query to retrieve a survey_proprietor row.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyPurposeAndMethodologyForUpdateSQL = (surveyId: number): SQLStatement => {
  return SQL`
    SELECT
      s.field_method_id,
      s.additional_details,
      s.ecological_season_id,
      s.intended_outcome_id,
      s.surveyed_all_areas,
      array_agg(sv.vantage_id) as vantage_ids
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
};
