import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-create-queries');

/**
 * SQL query to get public (published) project location.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getLocationByPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getLocationByPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      p.location_description,
      p.geojson as geometry,
      p.revision_count
    FROM
      project p
    WHERE
      p.project_id = ${projectId}
    AND p.publish_timestamp is not null
    GROUP BY
      p.location_description,
      p.geojson,
      p.revision_count;
  `;

  defaultLog.debug({
    label: 'getLocationByPublicProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

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

  defaultLog.debug({
    label: 'getLocationByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project stakeholder partnerships for a public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getStakeholderPartnershipsByPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getStakeholderPartnershipsByPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      sp.name as sp_name
    FROM
      stakeholder_partnership as sp
    LEFT OUTER JOIN
      project as p
    ON
      p.project_id = sp.project_id
    WHERE
      sp.project_id = ${projectId}
    AND
      p.publish_timestamp is not null;
  `;

  defaultLog.debug({
    label: 'getStakeholderPartnershipsByPublicProjectSQL',
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
      name as sp_name
    FROM
      stakeholder_partnership
    WHERE
      project_id = ${projectId};
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
 * SQL query to get public (published) project activities.
 *
 * @param {string} projectId
 * @returns {SQLStatement} sql query object
 */

export const getActivitiesByPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getActivitiesByPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      activity_id
    from
      project_activity as pa
    LEFT OUTER JOIN
      project as p
    ON
      p.project_id = pa.project_id
    where pa.project_id = ${projectId}
    and p.publish_timestamp is not null;
  `;

  defaultLog.debug({
    label: 'getActivitiesByPublicProjectSQL',
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
      activity_id
    from
      project_activity
    where project_id = ${projectId};
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
 * SQL query to get funding source data for a public (published) project
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getFundingSourceByPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getFundingSourceByPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

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
      pfs.revision_count as revision_count
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
      project as p
    ON
      pfs.project_id = p.project_id
    WHERE
      pfs.project_id = ${projectId}
    AND
      p.publish_timestamp is not null
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
      pfs.revision_count
  `;

  defaultLog.debug({
    label: 'getFundingSourceByPublicProjectSQL',
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
      pfs.project_funding_source_id as id,
      fs.funding_source_id as agency_id,
      pfs.funding_amount::numeric::int,
      pfs.funding_start_date as start_date,
      pfs.funding_end_date as end_date,
      iac.investment_action_category_id as investment_action_category,
      iac.name as investment_action_category_name,
      fs.name as agency_name,
      pfs.funding_source_project_id as agency_project_id,
      pfs.revision_count as revision_count
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
