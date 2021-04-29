import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-create-queries');

/**
 * SQL query to get project location.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getLocationByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getLocationByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      p.location_description,
      public.ST_asGeoJSON(p.geography) as geometry,
      pr.name,
      p.revision_count
    FROM
      project p
    LEFT OUTER JOIN
      project_region pr
    ON
      p.id = pr.p_id
    WHERE
      p.id = ${projectId}
    GROUP BY
      p.location_description,
      p.geography,
      pr.name,
      p.revision_count;
  `;

  defaultLog.debug({
    label: 'getLocationByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project stakeholder partnerships.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getStakeholderPartnershipsByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getStakeholderPartnershipsByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      name
    FROM
      stakeholder_partnership
    WHERE
      p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getStakeholderPartnershipsByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project focal species for update purposes.
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
 * SQL query to get project ancillary species for update purposes.
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
      a_id
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
      pfs.id as id,
      fs.id as agency_id,
      pfs.funding_amount::numeric::int,
      pfs.funding_start_date as start_date,
      pfs.funding_end_date as end_date,
      iac.id as investment_action_category,
      iac.name as investment_action_category_name,
      fs.name as agency_name,
      pfs.funding_source_project_id as agency_project_id,
      pfs.revision_count as revision_count
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
      pfs.id,
      fs.id,
      pfs.funding_source_project_id,
      pfs.funding_amount,
      pfs.funding_start_date,
      pfs.funding_end_date,
      iac.id,
      iac.name,
      fs.name,
      pfs.revision_count
  `;

  defaultLog.debug({
    label: 'getFundingSourceByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
