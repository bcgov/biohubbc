/**
 * Key used to cache column visiblity in sessionStorage
 */
export const SIMS_TELEMETRY_HIDDEN_COLUMNS = 'SIMS_TELEMETRY_HIDDEN_COLUMNS';

/**
 * Key used to cache column visiblity in sessionStorage
 */
export const SIMS_OBSERVATIONS_HIDDEN_COLUMNS = 'SIMS_OBSERVATIONS_HIDDEN_COLUMNS';

/**
 * Key used to cache the additional user-defined measurement columns added to the observations table.
 *
 * Should store a JSON stringified array of `GridColDef` objects.
 */
export const SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS = 'SIMS_OBSERVATIONS_MEASUREMENT_COLUMNS';

/**
 * Get a session storage key which is unique to the provided survey id.
 *
 * @param {number} surveyId
 * @param {string} sessionStorageKey
 * @return {*}  {string}
 */
export const getSurveySessionStorageKey = (surveyId: number, sessionStorageKey: string): string => {
  return `${sessionStorageKey}_survey_${surveyId}`;
};
