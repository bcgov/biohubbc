import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to fetch managemetn action type codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getManagementActionTypeSQL = (): SQLStatement => SQL`SELECT * from management_action_type;`;

/**
 * SQL query to fetch climate change initiative codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getClimateChangeInitiativeSQL = (): SQLStatement => SQL`SELECT * from climate_change_initiative;`;

/**
 * SQL query to fetch land based investment strategy codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getLandBasedInvestmentStrategySQL = (): SQLStatement => SQL`SELECT * from land_based_investment_strategy;`;

/**
 * SQL query to fetch funding agency codes.
 *
 * @returns {SQLStatement} sql query object
 */
export const getFundingAgencySQL = (): SQLStatement => SQL`SELECT * from funding_agency;`;
