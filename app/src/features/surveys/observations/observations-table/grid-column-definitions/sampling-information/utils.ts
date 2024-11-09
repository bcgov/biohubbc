import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IAutocompleteDataGridSampleMethodOption } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/methods/SampleMethodDataGrid.interface';
import { IAutocompleteDataGridSamplePeriodOption } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/periods/SamplePeriodDataGrid.interface';
import { IAutocompleteDataGridSampleSiteOption } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/sites/SampleSiteDataGrid.interface';
import { SampleLocationCache } from 'features/surveys/observations/observations-table/ObservationsTableContainer';
import { IGetSampleLocationNonSpatialDetails, IGetSamplePeriodRecord } from 'interfaces/useSamplingSiteApi.interface';
import { MutableRefObject } from 'react';

/**
 * Given a site id and sample location cache, find the site object.
 *
 * @param {(number | undefined)} siteId
 * @param {(SampleLocationCache | undefined)} cache
 */
const findSite = (siteId: number | undefined, cache: SampleLocationCache | undefined) =>
  cache?.locations.find((site) => site.survey_sample_site_id === siteId);

/**
 * Given a sample site object and method id, find the method object.
 *
 * @param {(IGetSampleLocationNonSpatialDetails | undefined)} site
 * @param {(number | undefined)} methodId
 */
const findMethod = (site: IGetSampleLocationNonSpatialDetails | undefined, methodId: number | undefined) =>
  site?.sample_methods.find((method) => method.survey_sample_method_id === methodId);

/**
 * Transform a sampling option to be compatible with the autocomplete control.
 *
 * @template T
 * @param {T} item
 * @param {string} label
 * @param {number} value
 * @return {*}  {(T & { label: string; value: number })}
 */
const formatOption = <T>(item: T, label: string, value: number): T & { label: string; value: number } => ({
  ...item,
  label,
  value
});

/**
 * Get the label for a period.
 *
 * @param {(IGetSamplePeriodRecord | null)} period
 * @return {*}
 */
const getPeriodLabel = (period: IGetSamplePeriodRecord | null) => {
  if (!period) {
    return '';
  }
  return `${period.start_date} ${period.start_time ?? ''} - ${period.end_date} ${period.end_time ?? ''}`;
};

/**
 * Get the currently selected site for the row.
 *
 * @template DataGridType
 * @param {GridRenderCellParams<DataGridType>} dataGridProps
 * @param {(MutableRefObject<SampleLocationCache | undefined>)} cachedSampleLocationsRef
 * @return {*}  {(IAutocompleteDataGridSampleSiteOption | null)}
 */
export const getCurrentSite = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>
): IAutocompleteDataGridSampleSiteOption | null => {
  const currentSite = findSite(dataGridProps.value as number, cachedSampleLocationsRef.current);
  return currentSite ? formatOption(currentSite, currentSite.name, currentSite.survey_sample_site_id) : null;
};

/**
 * Get the currently selected method for the row.
 *
 * @template DataGridType
 * @param {GridRenderCellParams<DataGridType>} dataGridProps
 * @param {(MutableRefObject<SampleLocationCache | undefined>)} cachedSampleLocationsRef
 * @return {*}  {(IAutocompleteDataGridSampleMethodOption | null)}
 */
export const getCurrentMethod = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>
): IAutocompleteDataGridSampleMethodOption | null => {
  for (const site of cachedSampleLocationsRef.current?.locations ?? []) {
    const currentMethod = findMethod(site, dataGridProps.value as number);
    if (currentMethod) {
      return formatOption(currentMethod, currentMethod.technique.name, currentMethod.survey_sample_method_id);
    }
  }
  return null;
};

/**
 * Get the currently selected period for the row.
 *
 * @template DataGridType
 * @param {GridRenderCellParams<DataGridType>} dataGridProps
 * @param {(MutableRefObject<SampleLocationCache | undefined>)} cachedSampleLocationsRef
 * @return {*}  {(IAutocompleteDataGridSamplePeriodOption | null)}
 */
export const getCurrentPeriod = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>
): IAutocompleteDataGridSamplePeriodOption | null => {
  for (const site of cachedSampleLocationsRef.current?.locations ?? []) {
    for (const method of site.sample_methods ?? []) {
      const currentPeriod = method.sample_periods.find(
        (period) => period.survey_sample_period_id === dataGridProps.value
      );
      if (currentPeriod) {
        return formatOption(currentPeriod, getPeriodLabel(currentPeriod), currentPeriod.survey_sample_period_id);
      }
    }
  }
  return null;
};

/**
 * Get all valid methods for the currently selected site.
 *
 * @template DataGridType
 * @param {GridRenderCellParams<DataGridType>} dataGridProps
 * @param {(MutableRefObject<SampleLocationCache | undefined>)} cachedSampleLocationsRef
 * @return {*}  {IAutocompleteDataGridSampleMethodOption[]}
 */
export const getMethodsForRow = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>
): IAutocompleteDataGridSampleMethodOption[] => {
  const site = findSite(dataGridProps.row.survey_sample_site_id, cachedSampleLocationsRef.current);
  return (site?.sample_methods ?? []).map((method) =>
    formatOption(method, method.technique.name, method.survey_sample_method_id)
  );
};

/**
 * Get all valid periods for the currently selected site and method.
 *
 * @template DataGridType
 * @param {GridRenderCellParams<DataGridType>} dataGridProps
 * @param {(MutableRefObject<SampleLocationCache | undefined>)} cachedSampleLocationsRef
 * @return {*}  {IAutocompleteDataGridSamplePeriodOption[]}
 */
export const getPeriodsForRow = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>
): IAutocompleteDataGridSamplePeriodOption[] => {
  const site = findSite(dataGridProps.row.survey_sample_site_id, cachedSampleLocationsRef.current);
  const method = findMethod(site, dataGridProps.row.survey_sample_method_id);
  return (method?.sample_periods ?? []).map((period) =>
    formatOption(period, getPeriodLabel(period), period.survey_sample_period_id)
  );
};
