import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get project first nations data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectFirstNationsSQL = (projectId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    SELECT
      first_nations.name
    FROM
      first_nations
    JOIN
      project_first_nation
    ON
      project_first_nation.first_nations_id = first_nations.first_nations_id
    WHERE
      project_first_nation.project_id = ${projectId};
  `;

  return sqlStatement;
};

/**
 * SQL query to get project iucn classifications data.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getIUCNClassificationsDetailsSQL = (projectId: number): SQLStatement => {
  const sqlStatement: SQLStatement = SQL`
    SELECT
      iucn_conservation_action_level_1_classification.name level_1_name,
      iucn_conservation_action_level_2_subclassification.name level_2_name,
      iucn_conservation_action_level_3_subclassification.name level_3_name
    FROM
      iucn_conservation_action_level_1_classification
    JOIN
      iucn_conservation_action_level_2_subclassification
    ON
      iucn_conservation_action_level_1_classification.iucn_conservation_action_level_1_classification_id
      = iucn_conservation_action_level_2_subclassification.iucn_conservation_action_level_1_classification_id
    JOIN
      iucn_conservation_action_level_3_subclassification
    ON
      iucn_conservation_action_level_2_subclassification.iucn_conservation_action_level_2_subclassification_id
      = iucn_conservation_action_level_3_subclassification.iucn_conservation_action_level_2_subclassification_id
    JOIN
      project_iucn_action_classification
    ON
      iucn_conservation_action_level_3_subclassification.iucn_conservation_action_level_3_subclassification_id
      = project_iucn_action_classification.iucn_conservation_action_level_3_subclassification_id
    WHERE
      project_iucn_action_classification.project_id = ${projectId};
  `;

  return sqlStatement;
};
