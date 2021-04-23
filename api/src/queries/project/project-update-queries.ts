import { SQL, SQLStatement } from 'sql-template-strings';
import {
  PutCoordinatorData,
  PutLocationData,
  PutObjectivesData,
  PutProjectData,
  PutFundingSource
} from '../../models/project-update';
import { getLogger } from '../../utils/logger';
import { generateGeometryCollectionSQL } from '../generate-geometry-collection';

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
 * SQL query to get project permits.
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getPermitsByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getPermitsByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      number,
      type,
      sampling_conducted
    FROM
      project_permit
    WHERE
      p_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getPermitsByProjectSQL',
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
    label: 'getCoordinatorByProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get project information, for update purposes.
 *
 * @param {number} projectId
 * @return {*}  {(SQLStatement | null)}
 */
export const getProjectByProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectByProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      name,
      pt_id,
      start_date,
      end_date,
      revision_count
    FROM
      project
    WHERE
      id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getProjectByProjectSQL',
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

  if (!projectId) {
    return null;
  }

  if (!project && !location && !objectives && !coordinator) {
    // Nothing to update
    return null;
  }

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

    const geometrySQLStatement = SQL`geography = `;

    if (location.geometry && location.geometry.length) {
      const geometryCollectionSQL = generateGeometryCollectionSQL(location.geometry);

      geometrySQLStatement.append(SQL`
        public.geography(
          public.ST_Force2D(
            public.ST_SetSRID(
      `);

      geometrySQLStatement.append(geometryCollectionSQL);

      geometrySQLStatement.append(SQL`
        , 4326)))
      `);
    } else {
      geometrySQLStatement.append(SQL`null`);
    }

    sqlSetStatements.push(geometrySQLStatement);
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
 * SQL query to get objectives information, for update purposes.
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

/**
 * SQL query to put (insert) a project funding source row with incremented revision count.
 *
 * @param {PutFundingSource} fundingSource
 * @returns {SQLStatement} sql query object
 */
export const putProjectFundingSourceSQL = (
  fundingSource: PutFundingSource | null,
  projectId: number
): SQLStatement | null => {
  defaultLog.debug({ label: 'putProjectFundingSourceSQL', message: 'params', fundingSource, projectId });

  if (!fundingSource || !projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
      INSERT INTO project_funding_source (
        p_id,
        iac_id,
        funding_source_project_id,
        funding_amount,
        funding_start_date,
        funding_end_date,
        revision_count
      ) VALUES (
        ${projectId},
        ${fundingSource.investment_action_category},
        ${fundingSource.agency_project_id},
        ${fundingSource.funding_amount},
        ${fundingSource.start_date},
        ${fundingSource.end_date},
        ${fundingSource.revision_count + 1}
      )
      RETURNING
        id;
    `;

  defaultLog.debug({
    label: 'putProjectFundingSourceSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
