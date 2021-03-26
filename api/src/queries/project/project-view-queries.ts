import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-view-queries');

/**
 * SQL query to get a single project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      project.id,
      project.pt_id,
      project_type.name as pt_name,
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
      public.ST_asGeoJSON(project.geography) as geometry,
      project.create_date,
      project.create_user,
      project.update_date,
      project.update_user,
      project.revision_count
    from
      project
    left outer join
      project_type
        on project.pt_id = project_type.id
    where
      project.id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all projects.
 *
 * @param {string} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectListSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectListSQL', message: 'getProjectListSQL' });

  // TODO these fields were chosen arbitrarily based on having a small
  const sqlStatement = SQL`
    SELECT
      p.id,
      p.name,
      p.start_date,
      p.end_date,
      p.location_description,
      string_agg(DISTINCT pr.name, ', ') as regions_name_list,
      string_agg(DISTINCT pfs.name, ', ') as focal_species_name_list
    from
      project as p
    left outer join project_region as pr
      on p.id = pr.p_id
    left outer join focal_species as pfs
      on p.id = pfs.p_id
    group by
      p.id,
      p.name,
      p.start_date,
      p.end_date,
      p.location_description;
  `;

  defaultLog.debug({
    label: 'getProjectListSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all projects.
 *
 * @param {string} projectId
 * @returns {SQLStatement} sql query object
 */

export const getRegionsByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getRegionsByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      name
    from
      project_region
    where p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getRegionsByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project activities.
 *
 * @param {string} projectId
 * @returns {SQLStatement} sql query object
 */

export const getActivitiesByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getActivitiesByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      a_id,
      revision_count
    from
      project_activity
    where p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getActivitiesByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project climate initiatives.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getClimateInitiativesByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getClimateInitiativesByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      id,
      cci_id,
      revision_count
    from
      project_climate_initiative
    where p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getClimateInitiativesByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project focal species.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getFocalSpeciesByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getFocalSpeciesByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      name
    FROM
      focal_species
    where p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getFocalSpeciesByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project ancillary species.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getAncillarySpeciesByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getAncillarySpeciesByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      name
    FROM
      ancillary_species
    where p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getAncillarySpeciesByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get IUCN action classifications.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getIUCNActionClassificationByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getIUCNActionClassificationByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      ical1c.name as classification,
      ical2s.name as subClassification1,
      ical3s.name as subClassification2
    FROM
      project_iucn_action_classification as piac
    LEFT OUTER JOIN
      iucn_conservation_action_level_3_subclassification as ical3s
    ON
      piac.iucn3_id = ical3s.id
    LEFT OUTER JOIN
      iucn_conservation_action_level_2_subclassification as ical2s
    ON
      ical3s.iucn2_id = ical2s.id
    LEFT OUTER JOIN
      iucn_conservation_action_level_1_classification as ical1c
    ON
      ical2s.iucn1_id = ical1c.id
    WHERE
      piac.p_id = ${projectId}
    GROUP BY
      ical2s.name,
      ical1c.name,
      ical3s.name;
  `;

  defaultLog.debug({
    label: 'getIUCNActionClassificationByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get funding source data
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getFundingSourceByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getFundingSourceByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      pfs.funding_source_project_id as agency_id,
      pfs.funding_amount,
      pfs.funding_start_date as start_date,
      pfs.funding_end_date as end_date,
      iac.name as investment_action_category,
      fs.name as agency_name
    FROM
      project_funding_source as pfs
    LEFT OUTER JOIN
      investment_action_category as iac
    ON
      pfs.iac_id = iac.id
    LEFT OUTER JOIN
      funding_source as fs
    ON
      iac.fs_id = fs.id
    WHERE
      pfs.p_id = ${projectId}
    GROUP BY
      pfs.funding_source_project_id,
      pfs.funding_amount,
      pfs.funding_start_date,
      pfs.funding_end_date,
      iac.name,
      fs.name
  `;

  defaultLog.debug({
    label: 'getFundingSourceByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project indigenous partnerships.
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getIndigenousPartnershipsByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getIndigenousPartnershipsByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      fn.name
    FROM
      project_first_nation pfn
    LEFT OUTER JOIN
      first_nations fn
    ON
      pfn.fn_id = fn.id
    WHERE
      pfn.p_id = ${projectId}
    GROUP BY
      fn.name;
  `;

  defaultLog.debug({
    label: 'getIndigenousPartnershipsByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
