import { IDBConnection } from '../database/db';
import {
  getClimateChangeInitiativeSQL,
  getFundingAgencySQL,
  getLandBasedInvestmentStrategySQL,
  getManagementActionTypeSQL
} from '../queries/code-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('queries/code-queries');

export interface IAllCodeSets {
  management_action_type: object;
  climate_change_initiative: object;
  land_based_investment_strategy: object;
  funding_agency: object;
}

/**
 * Function that fetches all code sets.
 *
 * @param {PoolClient} connection
 * @returns {IAllCodeSets} an object containing all code sets
 */
export async function getAllCodeSets(connection: IDBConnection): Promise<IAllCodeSets | null> {
  defaultLog.debug({ message: 'getAllCodeSets' });

  if (!connection) {
    return null;
  }

  await connection.open();

  const [
    management_action_type,
    climate_change_initiative,
    land_based_investment_strategy,
    funding_agency
  ] = await Promise.all([
    await connection.query(getManagementActionTypeSQL().text),
    await connection.query(getClimateChangeInitiativeSQL().text),
    await connection.query(getLandBasedInvestmentStrategySQL().text),
    await connection.query(getFundingAgencySQL().text)
  ]);

  await connection.commit();

  connection.release();

  const result: IAllCodeSets = {
    management_action_type: (management_action_type && management_action_type.rows) || [],
    climate_change_initiative: (climate_change_initiative && climate_change_initiative.rows) || [],
    land_based_investment_strategy: (land_based_investment_strategy && land_based_investment_strategy.rows) || [],
    funding_agency: (funding_agency && funding_agency.rows) || []
  };

  return result;
}
