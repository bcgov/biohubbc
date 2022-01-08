import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch management action type codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getManagementActionTypeSQL = (): SQLStatement =>
  SQL`SELECT management_action_type_id as id, name from management_action_type;`;

/**
 * SQL query to fetch first nation codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getFirstNationsSQL = (): SQLStatement =>
  SQL`SELECT first_nations_id as id, name from first_nations ORDER BY name ASC;`;

/**
 * SQL query to fetch funding source codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getFundingSourceSQL = (): SQLStatement =>
  SQL`SELECT funding_source_id as id, name from funding_source ORDER BY name ASC;`;

/**
 * SQL query to fetch proprietor type codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getProprietorTypeSQL = (): SQLStatement =>
  SQL`SELECT proprietor_type_id as id, name, is_first_nation from proprietor_type;`;

/**
 * SQL query to fetch activity codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getActivitySQL = (): SQLStatement => SQL`SELECT activity_id as id, name from activity;`;

/**
 * SQL query to fetch project type codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getProjectTypeSQL = (): SQLStatement => SQL`SELECT project_type_id as id, name from project_type;`;

/**
 * SQL query to fetch investment action category codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getInvestmentActionCategorySQL = (): SQLStatement =>
  SQL`SELECT investment_action_category_id as id, funding_source_id as fs_id, name from investment_action_category ORDER BY name ASC;`;

/**
 * SQL query to fetch IUCN conservation action level 1 classification codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getIUCNConservationActionLevel1ClassificationSQL = (): SQLStatement =>
  SQL`SELECT iucn_conservation_action_level_1_classification_id as id, name from iucn_conservation_action_level_1_classification;`;

/**
 * SQL query to fetch IUCN conservation action level 2 sub-classification codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getIUCNConservationActionLevel2SubclassificationSQL = (): SQLStatement =>
  SQL`SELECT iucn_conservation_action_level_2_subclassification_id as id, iucn_conservation_action_level_1_classification_id as iucn1_id, name from iucn_conservation_action_level_2_subclassification;`;

/**
 * SQL query to fetch IUCN conservation action level 3 sub-classification codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getIUCNConservationActionLevel3SubclassificationSQL = (): SQLStatement =>
  SQL`SELECT iucn_conservation_action_level_3_subclassification_id as id, iucn_conservation_action_level_2_subclassification_id as iucn2_id, name from iucn_conservation_action_level_3_subclassification;`;

/**
 * SQL query to fetch system role codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getSystemRolesSQL = (): SQLStatement => SQL`SELECT system_role_id as id, name from system_role;`;

/**
 * SQL query to fetch project role codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getProjectRolesSQL = (): SQLStatement => SQL`SELECT project_role_id as id, name from project_role;`;

/**
 * SQL query to fetch administrative activity status type codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getAdministrativeActivityStatusTypeSQL = (): SQLStatement =>
  SQL`SELECT administrative_activity_status_type_id as id, name FROM administrative_activity_status_type;`;

/**
 * SQL query to fetch taxon codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getTaxonsSQL = (): SQLStatement =>
  SQL`
    SELECT
      wldtaxonomic_units_id as id,
      CONCAT_WS(' - ', english_name, CONCAT_WS(' ', unit_name1, unit_name2, unit_name3)) as name
    FROM
      wldtaxonomic_units
    WHERE
      tty_name = 'SPECIES'
    and
      end_date is null
    ORDER BY
      name;`;
