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
      project.project_id as id,
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
      project.revision_count,
      project.publish_timestamp as publish_date
    from
      project
    left outer join
      project_type
        on project.project_type_id = project_type.project_type_id
    where
      project.project_id = ${projectId};
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
 * @param {boolean} isUserAdmin
 * @param {number | null} systemUserId
 * @param {any} filterFields
 * @returns {SQLStatement} sql query object
 */
export const getProjectListSQL = (
  isUserAdmin: boolean,
  systemUserId: number | null,
  filterFields?: any
): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectListSQL', message: 'params', isUserAdmin, systemUserId, filterFields });

  if (!systemUserId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      p.project_id as id,
      p.name,
      p.start_date,
      p.end_date,
      p.coordinator_agency_name,
      p.publish_timestamp,
      pt.name as project_type,
      string_agg(DISTINCT pp.number, ', ') as permits_list
    from
      project as p
    left outer join project_type as pt
      on p.project_type_id = pt.project_type_id
    left outer join permit as pp
      on p.project_id = pp.project_id
    left outer join project_funding_source as pfs
      on pfs.project_id = p.project_id
    left outer join investment_action_category as iac
      on pfs.investment_action_category_id = iac.investment_action_category_id
    left outer join funding_source as fs
      on iac.funding_source_id = fs.funding_source_id
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

    if (filterFields.permit_number) {
      sqlStatement.append(SQL` AND pp.number = ${filterFields.permit_number}`);
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

    if (filterFields.species && filterFields.species.length) {
      sqlStatement.append(SQL` AND wu.wldtaxonomic_units_id =${filterFields.species[0]}`);
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
      p.publish_timestamp,
      pt.name;
  `);

  defaultLog.debug({
    label: 'getProjectListSQL',
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
      fn.name as fn_name
    FROM
      project_first_nation pfn
    LEFT OUTER JOIN
      first_nations fn
    ON
      pfn.first_nations_id = fn.first_nations_id
    WHERE
      pfn.project_id = ${projectId}
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

/**
 * SQL query to get permits associated to a project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectPermitsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectPermitsSQL', message: 'params', projectId });

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
  `;

  defaultLog.debug({
    label: 'getProjectPermitsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
