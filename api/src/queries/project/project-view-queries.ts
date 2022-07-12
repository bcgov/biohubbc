import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get a single project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
    SELECT
      project.project_id as id,
      project.uuid,
      project.project_type_id as pt_id,
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
      project.revision_count
    from
      project
    left outer join
      project_type
        on project.project_type_id = project_type.project_type_id
    where
      project.project_id = ${projectId};
  `;
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
  if (!systemUserId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      p.project_id as id,
      p.name,
      p.start_date,
      p.end_date,
      p.coordinator_agency_name as coordinator_agency,
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
    left outer join survey as s
      on s.project_id = p.project_id
    left outer join study_species as sp
      on sp.survey_id = s.survey_id
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
      sqlStatement.append(SQL` AND sp.wldtaxonomic_units_id =${filterFields.species[0]}`);
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
      pt.name;
  `);

  return sqlStatement;
};

/**
 * SQL query to get IUCN action classifications.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getIUCNActionClassificationByProjectSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
    SELECT
      ical1c.iucn_conservation_action_level_1_classification_id as classification,
      ical2s.iucn_conservation_action_level_2_subclassification_id as subClassification1,
      ical3s.iucn_conservation_action_level_3_subclassification_id as subClassification2
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
      ical1c.iucn_conservation_action_level_1_classification_id,
      ical2s.iucn_conservation_action_level_2_subclassification_id,
      ical3s.iucn_conservation_action_level_3_subclassification_id;
  `;
};

/**
 * SQL query to get project indigenous partnerships.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getIndigenousPartnershipsByProjectSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
    SELECT
      fn.first_nations_id as id,
      fn.name as first_nations_name
    FROM
      project_first_nation pfn
    LEFT OUTER JOIN
      first_nations fn
    ON
      pfn.first_nations_id = fn.first_nations_id
    WHERE
      pfn.project_id = ${projectId}
    GROUP BY
      fn.first_nations_id,
      fn.name;
  `;
};

/**
 * SQL query to get project stakeholder partnerships.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getStakeholderPartnershipsByProjectSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
    SELECT
      name as partnership_name
    FROM
      stakeholder_partnership
    WHERE
      project_id = ${projectId};
  `;
};

/**
 * SQL query to get permits associated to a project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectPermitsSQL = (projectId: number): SQLStatement | null => {
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
  `;
};

/**
 * SQL query to get project location.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getLocationByProjectSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
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
};

/**
 * SQL query to get project activities.
 *
 * @param {string} projectId
 * @returns {SQLStatement} sql query object
 */

export const getActivitiesByProjectSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
    SELECT
      activity_id
    from
      project_activity
    where project_id = ${projectId};
  `;
};

/**
 * SQL query to get funding source data
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getFundingSourceByProjectSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
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
};
