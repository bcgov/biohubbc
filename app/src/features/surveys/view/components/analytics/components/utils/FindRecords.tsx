import { IGetSampleLocationDetails } from 'interfaces/useSamplingSiteApi.interface';
import { isEqual } from 'lodash-es';

/**
 * Finds a specific sample site within an array of sampling locations
 *
 * @param sampleSites
 * @param survey_sample_site_id
 * @returns
 */
export const findSampleSite = (sampleSites: IGetSampleLocationDetails[], survey_sample_site_id: number) =>
  sampleSites.find((site) => isEqual(survey_sample_site_id, site.survey_sample_site_id));

/**
 * Finds a specific sample method within an array of sampling locations
 *
 * @param sampleSites
 * @param survey_sample_method_id
 * @returns
 */
export const findSampleMethod = (sampleSites: IGetSampleLocationDetails[], survey_sample_method_id: number) =>
  sampleSites
    .flatMap((site) => site.sample_methods)
    .find((method) => isEqual(survey_sample_method_id, method.survey_sample_method_id));

/**
 * Finds a specific sampling period within an array of sampling locations
 *
 * @param sampleSites
 * @param survey_sample_period_id
 * @returns
 */
export const findSamplePeriod = (sampleSites: IGetSampleLocationDetails[], survey_sample_period_id: number) =>
  sampleSites
    .flatMap((site) => site.sample_methods)
    .flatMap((method) => method.sample_periods)
    .find((period) => isEqual(survey_sample_period_id, period.survey_sample_period_id));
