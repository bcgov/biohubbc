import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch management action type codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getManagementActionTypeSQL = (): SQLStatement => SQL`SELECT id, name from management_action_type;`;

/**
 * SQL query to fetch climate change initiative codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getClimateChangeInitiativeSQL = (): SQLStatement => SQL`SELECT id, name from climate_change_initiative;`;

/**
 * SQL query to fetch first nation codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getFirstNationsSQL = (): SQLStatement => SQL`SELECT id, name from first_nations;`;

/**
 * SQL query to fetch funding source codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getFundingSourceSQL = (): SQLStatement => SQL`SELECT id, name from funding_source;`;

/**
 * SQL query to fetch activity codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getActivitySQL = (): SQLStatement => SQL`SELECT id, name from activity;`;

/**
 * SQL query to fetch project type codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getProjectTypeSQL = (): SQLStatement => SQL`SELECT id, name from project_type;`;

/**
 * SQL query to fetch investment action category codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getInvestmentActionCategorySQL = (): SQLStatement =>
  SQL`SELECT id, fs_id, name from investment_action_category;`;

/**
 * SQL query to fetch IUCN conservation action level 1 classification codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getIUCNConservationActionLevel1ClassificationSQL = (): SQLStatement =>
  SQL`SELECT id, name from iucn_conservation_action_level_1_classification;`;

/**
 * SQL query to fetch IUCN conservation action level 2 sub-classification codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getIUCNConservationActionLevel2SubclassificationSQL = (): SQLStatement =>
  SQL`SELECT id, iucn1_id, name from iucn_conservation_action_level_2_subclassification;`;

/**
 * SQL query to fetch IUCN conservation action level 3 sub-classification codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getIUCNConservationActionLevel3SubclassificationSQL = (): SQLStatement =>
  SQL`SELECT id, iucn2_id, name from iucn_conservation_action_level_3_subclassification;`;

/**
 * SQL query to fetch system role codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getSystemRolesSQL = (): SQLStatement => SQL`SELECT id, name from system_role;`;

/**
 * SQL query to fetch administrative activity status type codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getAdministrativeActivityStatusTypeSQL = (): SQLStatement =>
  SQL`SELECT id, name FROM administrative_activity_status_type;`;
