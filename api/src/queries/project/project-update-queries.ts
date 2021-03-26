import { SQL, SQLStatement } from 'sql-template-strings';
import { PutCoordinatorData, PutLocationData, PutObjectivesData, PutProjectData } from '../../models/project-update';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-update-queries');

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
      ical1c.id as classification,
      ical2s.id as subClassification1,
      ical3s.id as subClassification2
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
      ical2s.id,
      ical1c.id,
      ical3s.id;
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
      fn.id
    FROM
      project_first_nation pfn
    LEFT OUTER JOIN
      first_nations fn
    ON
      pfn.fn_id = fn.id
    WHERE
      pfn.p_id = ${projectId}
    GROUP BY
      fn.id;
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
 * SQL query to get coordinator information, for update purposes.
 *
 * @param {number} projectId
 * @return {*}  {(SQLStatement | null)}
 */
export const getCoordinatorByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getCoordinatorByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }
  const sqlStatement = SQL`
    SELECT
      id,
      coordinator_first_name,
      coordinator_last_name,
      coordinator_email_address,
      coordinator_agency_name,
      coordinator_public,
      revision_count
    FROM
      project
    WHERE
      id = ${projectId};
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
 * SQL query to update a project row.
 *
 * @param {(PutProjectData & PutLocationData & PutCoordinatorData & PutObjectivesData)} project
 * @returns {SQLStatement} sql query object
 */
export const putProjectSQL = (
  projectId: number,
  project: PutProjectData | null,
  location: PutLocationData | null,
  objectives: PutObjectivesData | null,
  coordinator: PutCoordinatorData | null,
  revision_count: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'putProjectSQL',
    message: 'params',
    projectId,
    project,
    location,
    objectives,
    coordinator,
    revision_count
  });

  const sqlStatement: SQLStatement = SQL`UPDATE project SET `;

  const sqlSetStatements: SQLStatement[] = [];

  if (project) {
    sqlSetStatements.push(SQL`pt_id = ${project.type}`);
    sqlSetStatements.push(SQL`name = ${project.name}`);
    sqlSetStatements.push(SQL`start_date = ${project.start_date}`);
    sqlSetStatements.push(SQL`end_date = ${project.end_date}`);
  }

  if (location) {
    sqlSetStatements.push(SQL`location_description = ${location.location_description}`);
    // TODO geometry conversion wizardry
    // sqlSetStatements.push(SQL`objectives = ${location.geometry},`)
  }

  if (objectives) {
    sqlSetStatements.push(SQL`objectives = ${objectives.objectives}`);
    sqlSetStatements.push(SQL`caveats = ${objectives.caveats}`);
  }

  if (coordinator) {
    sqlSetStatements.push(SQL`coordinator_first_name = ${coordinator.first_name}`);
    sqlSetStatements.push(SQL`coordinator_last_name = ${coordinator.last_name}`);
    sqlSetStatements.push(SQL`coordinator_email_address = ${coordinator.email_address}`);
    sqlSetStatements.push(SQL`coordinator_agency_name = ${coordinator.coordinator_agency}`);
    sqlSetStatements.push(SQL`coordinator_public = ${coordinator.share_contact_details}`);
  }

  sqlSetStatements.forEach((item, index) => {
    sqlStatement.append(item);
    if (index < sqlSetStatements.length - 1) {
      sqlStatement.append(',');
    }
  });

  sqlStatement.append(SQL`
    WHERE
      id = ${projectId}
    AND
      revision_count = ${revision_count};
  `);

  defaultLog.debug({
    label: 'putProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get coordinator information, for update purposes.
 *
 * @param {number} projectId
 * @return {*}  {(SQLStatement | null)}
 */
export const getObjectivesByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getObjectivesByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }
  const sqlStatement = SQL`
    SELECT
      objectives,
      caveats,
      revision_count
    FROM
      project
    WHERE
      id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getObjectivesByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
