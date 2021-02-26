import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch managemetn action type codes.
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
 * SQL query to fetch investment action category codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getInvestmentActionCategorySQL = (): SQLStatement =>
  SQL`SELECT id, fs_id, name from investment_action_category;`;
