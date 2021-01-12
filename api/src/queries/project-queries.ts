import { SQL, SQLStatement } from 'sql-template-strings';
import { PostProjectObject } from '../models/project';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/project-queries');

/**
 * SQL query to insert a new project.
 *
 * @param {PostProjectObject} project
 * @returns {SQLStatement} sql query object
 */
export const postProjectSQL = (project: PostProjectObject): SQLStatement | null => {
  defaultLog.debug({ label: 'postProjectSQL', message: 'params', PostProjectObject });

  if (!project) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project (
      name,
      objectives,
      scientific_collection_permit_number,
      management_recovery_action,
      location_description,
      start_date,
      end_date,
      results,
      caveats,
      comments
    ) VALUES (
      ${project.name},
      ${project.objectives},
      ${project.scientific_collection_permit_number},
      ${project.management_recovery_action},
      ${project.location_description},
      ${project.start_date},
      ${project.end_date},
      ${project.results},
      ${project.caveats},
      ${project.comments},
      ${project.create_date},
      ${project.create_user},
      ${project.update_date},
      ${project.update_user},
      ${project.revision_count},
    )
    RETURNING
      *
  `;

  defaultLog.debug({
    label: 'postProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

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
      id,
      name,
      objectives,
      scientific_collection_permit_number,
      management_recovery_action,
      location_description,
      start_date,
      end_date,
      results,
      caveats,
      comments,
      create_date,
      create_user,
      update_date,
      update_user,
      revision_count
    from
      project
    where
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
 * SQL query to get all projects.
 *
 * @param {string} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectsSQL = (projectId: string): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectsSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  // TODO these fields were chosen arbitarily based on having a small
  const sqlStatement = SQL`
    SELECT
      id,
      name,
      scientific_collection_permit_number,
      management_recovery_action,
      start_date,
      end_date
    from
      project;
  `;

  defaultLog.debug({
    label: 'getProjectsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
