import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import {
  SamplingInformationCachedPeriod,
  SamplingInformationCachedSite,
  SamplingInformationCachedTechnique,
  SamplingInformationCacheRef
} from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';
import { MutableRefObject } from 'react';

/**
 * Given a site id and sample location cache, find the site object.
 *
 * @param {(number | undefined)} siteId
 * @param {(SamplingInformationCacheRef | undefined)} cache
 */
const findSite = (siteId: number | undefined, cache: SamplingInformationCacheRef | undefined) =>
  cache?.sites.find((site) => site.survey_sample_site_id === siteId);

/**
 * Given a technique id and sample location cache, find the technique object.
 *
 * @param {(number | undefined)} techniqueId
 * @param {(SamplingInformationCacheRef | undefined)} cache
 */
const findTechnique = (techniqueId: number | undefined, cache: SamplingInformationCacheRef | undefined) =>
  cache?.techniques.find((technique) => technique.method_technique_id === techniqueId);

/**
 * Given a period id and sample location cache, find the period object.
 *
 * @param {(number | undefined)} periodId
 * @param {(SamplingInformationCacheRef | undefined)} cache
 */
const findPeriod = (periodId: number | undefined, cache: SamplingInformationCacheRef | undefined) =>
  cache?.periods.find((period) => period.survey_sample_period_id === periodId);

/**
 * Get the label for a period.
 *
 * @template PeriodType A type that has at least start_date, start_time, end_date, and end_time properties.
 * @param {PeriodType} period
 * @return {*}
 */
export const getPeriodLabel = <
  PeriodType extends { start_date: string; start_time: string | null; end_date: string; end_time: string | null }
>(
  period: PeriodType
) => {
  return `${period.start_date} ${period.start_time ?? ''} - ${period.end_date} ${period.end_time ?? ''}`;
};

/**
 * Get the currently selected site for the row.
 *
 * @template DataGridType
 * @param {GridRenderCellParams<DataGridType>} dataGridProps
 * @param {(MutableRefObject<SamplingInformationCacheRef | undefined>)} cachedSampleLocationsRef
 * @return {*}  {(SamplingInformationCachedSite | null)}
 */
export const getCurrentSite = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SamplingInformationCacheRef | undefined>
): SamplingInformationCachedSite | null => {
  return findSite(dataGridProps.value as number, cachedSampleLocationsRef.current) ?? null;
};

/**
 * Get the currently selected method technique for the row.
 *
 * @template DataGridType
 * @param {GridRenderCellParams<DataGridType>} dataGridProps
 * @param {(MutableRefObject<SamplingInformationCacheRef | undefined>)} cachedSampleLocationsRef
 * @return {*}  {(SamplingInformationCachedTechnique | null)}
 */
export const getCurrentTechnique = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SamplingInformationCacheRef | undefined>
): SamplingInformationCachedTechnique | null => {
  return findTechnique(dataGridProps.value as number, cachedSampleLocationsRef.current) ?? null;
};

/**
 * Get the currently selected period for the row.
 *
 * @template DataGridType
 * @param {GridRenderCellParams<DataGridType>} dataGridProps
 * @param {(MutableRefObject<SamplingInformationCacheRef | undefined>)} cachedSampleLocationsRef
 * @return {*}  {(SamplingInformationCachedPeriod | null)}
 */
export const getCurrentPeriod = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SamplingInformationCacheRef | undefined>
): SamplingInformationCachedPeriod | null => {
  return findPeriod(dataGridProps.value as number, cachedSampleLocationsRef.current) ?? null;
};

/**
 * Get all valid techniques for the currently selected site.
 *
 * @param {(number | undefined)} survey_sample_site_id
 * @param {(MutableRefObject<SamplingInformationCacheRef | undefined>)} cachedSampleLocationsRef
 * @return {*}  {SamplingInformationCachedTechnique[]}
 */
export const getTechniquesForRow = (
  survey_sample_site_id: number | undefined,
  cachedSampleLocationsRef: MutableRefObject<SamplingInformationCacheRef | undefined>
): SamplingInformationCachedTechnique[] => {
  const site = findSite(survey_sample_site_id, cachedSampleLocationsRef.current);

  if (!site) {
    return [];
  }

  const matchingTechniques = cachedSampleLocationsRef.current?.techniques.filter((technique) => {
    return technique.survey_sample_site_id === site.survey_sample_site_id;
  });

  return matchingTechniques ?? [];
};

/**
 * Get all valid periods for the currently selected site and technique.
 *
 * @param {(number | undefined)} survey_sample_site_id
 * @param {(number | undefined)} method_technique_id
 * @param {(MutableRefObject<SamplingInformationCacheRef | undefined>)} cachedSampleLocationsRef
 * @return {*}  {SamplingInformationCachedPeriod[]}
 */
export const getPeriodsForRow = (
  survey_sample_site_id: number | undefined,
  method_technique_id: number | undefined,
  cachedSampleLocationsRef: MutableRefObject<SamplingInformationCacheRef | undefined>
): SamplingInformationCachedPeriod[] => {
  const site = findSite(survey_sample_site_id, cachedSampleLocationsRef.current);
  const technique = findTechnique(method_technique_id, cachedSampleLocationsRef.current);

  if (!site || !technique) {
    return [];
  }

  const matchingPeriods = cachedSampleLocationsRef.current?.periods.filter((period) => {
    return (
      period.survey_sample_site_id === site.survey_sample_site_id &&
      period.method_technique_id === technique.method_technique_id
    );
  });

  return matchingPeriods ?? [];
};
