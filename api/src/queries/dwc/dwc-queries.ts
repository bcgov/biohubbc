import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get submission occurrence record given package ID for a particular survey.
 *
 * @param {number} dataPackageId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyOccurrenceSubmissionSQL = (dataPackageId: number): SQLStatement => {
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

  return sqlStatement;
};

/**
 * SQL query to get data package record given package ID.
 *
 * @param {number} dataPackageId
 * @returns {SQLStatement} sql query object
 */
export const getDataPackageSQL = (dataPackageId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    SELECT
      *
    from
      data_package
    where
      data_package_id  = ${dataPackageId};
  `;

  return sqlStatement;
};

/**
 * SQL query to get occurrence submission publish date.
 *
 * @param {number} occurrenceSubmissionId
 * @returns {SQLStatement} sql query object
 */
export const getPublishedSurveyStatusSQL = (occurrenceSubmissionId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    SELECT
      *
    from
      survey_status
    where
      survey_status = api_get_character_system_constant('OCCURRENCE_SUBMISSION_STATE_PUBLISHED')
      and occurrence_submission_id  = ${occurrenceSubmissionId};
  `;

  return sqlStatement;
};

/**
 * SQL query to get survey data.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveySQL = (surveyId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    SELECT
      survey_id,
      project_id,
      field_method_id,
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

  return sqlStatement;
};

/**
 * SQL query to get project data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectSQL = (projectId: number): SQLStatement => {
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

  return sqlStatement;
};

/**
 * SQL query to get survey funding source data.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyFundingSourceSQL = (surveyId: number): SQLStatement => {
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

  return sqlStatement;
};

/**
 * SQL query to get project funding source data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectFundingSourceSQL = (projectId: number): SQLStatement => {
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
    project_id =  ${projectId}
    and b.investment_action_category_id = a.investment_action_category_id
    and c.funding_source_id = b.funding_source_id;
  `;

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
): SQLStatement => {
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
): SQLStatement => {
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

  return sqlStatement;
};

/**
 * SQL query to get taxonomic coverage.
 *
 * @param {number} surveyId
 * @param {boolean} isFocal
 * @returns {SQLStatement} sql query object
 */
export const getTaxonomicCoverageSQL = (surveyId: number, isFocal: boolean): SQLStatement => {
  let focalPredicate = 'and b.is_focal';
  if (!isFocal) {
    focalPredicate = 'and not b.is_focal';
  }
  const sqlStatement: SQLStatement = SQL`
    select
      a.*
    from
      wldtaxonomic_units a,
      study_species b
    where
      a.wldtaxonomic_units_id = b.wldtaxonomic_units_id
    and b.survey_id = ${surveyId}
    `.append(focalPredicate);

  return sqlStatement;
};

/**
 * SQL query to get project IUCN conservation data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectIucnConservationSQL = (projectId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    select
      a.name level_1_name,
      b.name level_2_name,
      c.name level_3_name
    from
      iucn_conservation_action_level_1_classification a,
      iucn_conservation_action_level_2_subclassification b,
      iucn_conservation_action_level_3_subclassification c,
      project_iucn_action_classification d
    where
      d.project_id = ${projectId}
      and c.iucn_conservation_action_level_3_subclassification_id = d.iucn_conservation_action_level_3_subclassification_id
      and b.iucn_conservation_action_level_2_subclassification_id = c.iucn_conservation_action_level_2_subclassification_id
      and a.iucn_conservation_action_level_1_classification_id  = b.iucn_conservation_action_level_1_classification_id;
  `;

  return sqlStatement;
};

/**
 * SQL query to get project stakeholder partnership data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectStakeholderPartnershipSQL = (projectId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    select
      a.name
    from
      stakeholder_partnership a
    where
      a.project_id = ${projectId};
  `;

  return sqlStatement;
};

/**
 * SQL query to get project activity data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectActivitySQL = (projectId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    select
      a.name
    from
      activity a,
      project_activity b
    where
      b.project_id = ${projectId}
      and a.activity_id = b.activity_id;
  `;

  return sqlStatement;
};

/**
 * SQL query to get climate initiative data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectClimateInitiativeSQL = (projectId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    select
      a.name
    from
      climate_change_initiative a,
      project_climate_initiative b
    where
      b.project_id = ${projectId}
      and a.climate_change_initiative_id = b.climate_change_initiative_id;
  `;

  return sqlStatement;
};

/**
 * SQL query to get project first nations data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectFirstNationsSQL = (projectId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    select
      a.name
    from
      first_nations a,
      project_first_nation b
    where
      b.project_id = ${projectId}
      and a.first_nations_id = b.first_nations_id;
  `;

  return sqlStatement;
};

/**
 * SQL query to get project management actions data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectManagementActionsSQL = (projectId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    select
      a.*
    from
      management_action_type a,
      project_management_actions b
    where
      a.management_action_type_id = b.management_action_type_id
      and b.project_id =  ${projectId};
  `;

  return sqlStatement;
};

/**
 * SQL query to get survey proprietor data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyProprietorSQL = (surveyId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    select
      a.name proprietor_type_name,
      b.name first_nations_name,
      c.*
    from
      proprietor_type a,
      first_nations b,
      survey_proprietor c
    where
      c.survey_id = ${surveyId}
      and b.first_nations_id = c.first_nations_id
      and a.proprietor_type_id = c.proprietor_type_id;
  `;

  return sqlStatement;
};
