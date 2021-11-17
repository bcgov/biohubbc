import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/dwc/dwc-queries');

// TODO: remove
/**
 * SQL query to get EML for a particular data package.
 *
 * @param {number} dataPackageId
 * @param {string} suppliedTitle
 * @returns {SQLStatement} sql query object
 */
// export const getDataPackageEMLSQL = (dataPackageId: number, suppliedTitle?: string): SQLStatement | null => {
//   defaultLog.debug({ label: 'getDataPackageEMLSQL', message: 'params', dataPackageId, suppliedTitle });

//   if (!dataPackageId) {
//     return null;
//   }

//   const sqlStatement: SQLStatement = SQL`SELECT api_get_eml_data_package(${dataPackageId}, ${suppliedTitle});`;

//   defaultLog.debug({
//     label: 'getDataPackageEMLSQL',
//     message: 'sql',
//     'sqlStatement.text': sqlStatement.text,
//     'sqlStatement.values': sqlStatement.values
//   });

//   return sqlStatement;
// };

/**
 * SQL query to get submission occurrence record given package ID for a particular survey.
 *
 * @param {number} dataPackageId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyOccurrenceSubmissionSQL = (dataPackageId: number): SQLStatement | null => {
  const debugLabel = 'getSurveyOccurrenceSubmissionSQL';
  defaultLog.debug({ label: debugLabel, message: 'params', dataPackageId });

  const sqlStatement: SQLStatement = SQL`
    SELECT 
      os.* 
    from 
      occurrence_submission os
      , occurrence_submission_data_package osdp 
    where 
      osdp.data_package_id  = ${dataPackageId}
      and os.occurrence_submission_id = osdp.occurrence_submission_id;
  `;

  defaultLog.debug({
    label: debugLabel,
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get data package record given package ID.
 *
 * @param {number} dataPackageId
 * @returns {SQLStatement} sql query object
 */
export const getDataPackageSQL = (dataPackageId: number): SQLStatement | null => {
  const debugLabel = 'getDataPackageSQL';
  defaultLog.debug({ label: debugLabel, message: 'params', dataPackageId });

  const sqlStatement: SQLStatement = SQL`
    SELECT 
      * 
    from 
      data_package
    where 
      data_package_id  = ${dataPackageId};
  `;

  defaultLog.debug({
    label: debugLabel,
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get occurrence submission publish date.
 *
 * @param {number} occurrenceSubmissionId
 * @returns {SQLStatement} sql query object
 */
export const getPublishedSurveyStatusSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
  const debugLabel = 'getPublishedSurveyStatusSQL';
  defaultLog.debug({ label: debugLabel, message: 'params', occurrenceSubmissionId });

  const sqlStatement: SQLStatement = SQL`
    SELECT 
      *
    from 
      survey_status
    where
      survey_status = api_get_character_system_constant('OCCURRENCE_SUBMISSION_STATE_PUBLISHED')
      and occurrence_submission_id  = ${occurrenceSubmissionId};
  `;

  defaultLog.debug({
    label: debugLabel,
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get survey data.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveySQL = (surveyId: number): SQLStatement | null => {
  const debugLabel = 'getSurveySQL';
  defaultLog.debug({ label: debugLabel, message: 'params', surveyId });

  const sqlStatement: SQLStatement = SQL`
    SELECT 
      survey_id,
      project_id,
      common_survey_methodology_id,
      uuid,
      name,
      objectives,
      start_date,
      lead_first_name,
      lead_last_name,
      end_date,
      location_description,
      location_name,
      publish_timestamp,
      create_date,
      create_user,
      update_date,
      update_user,
      revision_count
    from 
      survey
    where survey_id  = ${surveyId};
  `;

  defaultLog.debug({
    label: debugLabel,
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectSQL = (projectId: number): SQLStatement | null => {
  const debugLabel = 'getProjectSQL';
  defaultLog.debug({ label: debugLabel, message: 'params', projectId });

  const sqlStatement: SQLStatement = SQL`
    SELECT 
      project_id,
      project_type_id,
      uuid,
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
      publish_timestamp,
      create_date,
      create_user,
      update_date,
      update_user,
      revision_count
    from 
      project
    where project_id  = ${projectId};
  `;

  defaultLog.debug({
    label: debugLabel,
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project funding source data.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyFundingSourceSQL = (surveyId: number): SQLStatement | null => {
  const debugLabel = 'getSurveyFundingSourceSQL';
  defaultLog.debug({ label: debugLabel, message: 'params', surveyId });

  const sqlStatement: SQLStatement = SQL`
  select 
    a.*, 
    b.name investment_action_category_name, 
    c.name funding_source_name 
  from 
    project_funding_source a, 
    investment_action_category b, 
    funding_source c
  where 
    project_funding_source_id in (
      select 
        project_funding_source_id 
      from 
        survey_funding_source 
      where 
        survey_id = ${surveyId})
    and b.investment_action_category_id = a.investment_action_category_id 
    and c.funding_source_id = b.funding_source_id;
  `;

  defaultLog.debug({
    label: debugLabel,
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get geometry bounding box.
 *
 * @param {number} primaryKey
 * @param {string} primaryKeyName
 * @param {string} targetTable
 * @returns {SQLStatement} sql query object
 */
export const getGeometryBoundingBoxSQL = (
  primaryKey: number,
  primaryKeyName: string,
  targetTable: string
): SQLStatement | null => {
  const debugLabel = 'getGeometryBoundingBoxSQL';
  defaultLog.debug({ label: debugLabel, message: 'params', primaryKey, primaryKeyName, targetTable });

  // TODO: this only provides us with the bounding box of the first polygon
  const sqlStatement: SQLStatement = SQL`
  with envelope as (
    select 
      ST_Envelope(geography::geometry) geom 
    from `
    .append(targetTable)
    .append(
      SQL`
      where `
    )
    .append(primaryKeyName).append(SQL` = ${primaryKey})
  select 
    st_xmax(geom),
    st_ymax(geom),
    st_xmin(geom),
    st_ymin(geom)
  from 
    envelope;
  `);

  defaultLog.debug({
    label: debugLabel,
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get geometry polygons.
 *
 * @param {number} primaryKey
 * @param {string} primaryKeyName
 * @param {string} targetTable
 * @returns {SQLStatement} sql query object
 */
export const getGeometryPolygonsSQL = (
  primaryKey: number,
  primaryKeyName: string,
  targetTable: string
): SQLStatement | null => {
  const debugLabel = 'getGeometryPolygonsSQL';
  defaultLog.debug({ label: debugLabel, message: 'params', primaryKey, primaryKeyName, targetTable });

  const sqlStatement: SQLStatement = SQL`
    with polygons as (
      select 
        (st_dumppoints(g.geom)).* 
      from (
        select 
          geography::geometry as geom 
        from `
    .append(targetTable)
    .append(
      SQL`
          where `
    )
    .append(primaryKeyName).append(SQL` = ${primaryKey}) as g),
      points as (
        select 
          path[1] polygon, 
          path[2] point, 
          jsonb_build_array(st_y(p.geom), st_x(p.geom)) points 
        from 
          polygons p 
        order by 
          path[1], 
          path[2])
    select 
      json_agg(p.points) points
    from 
      points p 
    group by 
      polygon;
  `);

  defaultLog.debug({
    label: debugLabel,
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
