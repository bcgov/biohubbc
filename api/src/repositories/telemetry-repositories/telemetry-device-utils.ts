import { Knex } from 'knex';
import { getKnex } from '../../database/db';
import { DeviceAdvancedFilters } from './telemetry-device-repository.interface';

/**
 * Generate the devices list query based on user access and filters.
 *
 * @param {boolean} isUserAdmin
 * @param {number | null} systemUserId The system user id of the user making the request
 * @param {DeviceAdvancedFilters} filterFields
 * @return {*}  {Knex.QueryBuilder}
 */
export function makeFindDevicesQuery(
  isUserAdmin: boolean,
  systemUserId: number | null,
  filterFields: DeviceAdvancedFilters
): Knex.QueryBuilder {
  const knex = getKnex();

  const getSurveyIdsQuery = knex.select<any, { survey_id: number }>(['survey_id']).from('survey');

  // Ensure that users can only see devices from surveys that they are participating in, unless they are an administrator.
  if (!isUserAdmin) {
    getSurveyIdsQuery.whereIn('survey.survey_id', (subqueryBuilder) =>
      subqueryBuilder
        .select('survey.survey_id')
        .from('survey')
        .leftJoin('survey_member', 'survey_member.survey_id', 'survey.survey_id')
        .where('survey_member.system_user_id', systemUserId)
    );
  }

  if (filterFields.system_user_id) {
    getSurveyIdsQuery.whereIn('p.survey_id', (subQueryBuilder) => {
      subQueryBuilder.select('survey_id').from('survey_member').where('system_user_id', filterFields.system_user_id);
    });
  }

  const getDevicesQuery = knex
    .select([
      'device.device_id',
      'device.survey_id',
      'device.device_key',
      'device.serial',
      'device.device_make_id',
      'device.model',
      'device.comment'
    ])
    .from('device')
    // Join device_make table to get device make name for use in the keyword search
    .innerJoin('device_make', 'device.device_make_id', 'device_make.device_make_id')
    .whereIn('device.survey_id', getSurveyIdsQuery);

  // Keyword Search filter
  if (filterFields.keyword) {
    const keywordMatch = `%${filterFields.keyword}%`;
    getDevicesQuery.where((subQueryBuilder) => {
      subQueryBuilder
        .where('device.model', 'ilike', keywordMatch)
        .orWhere('device.comment', 'ilike', keywordMatch)
        .orWhere('device_make.name', 'ilike', keywordMatch);

      // If the keyword is a number, also match on device serial
      if (!isNaN(Number(filterFields.keyword))) {
        subQueryBuilder.orWhere('device.serial', Number(filterFields.keyword));
      }
    });
  }

  return getDevicesQuery;
}
