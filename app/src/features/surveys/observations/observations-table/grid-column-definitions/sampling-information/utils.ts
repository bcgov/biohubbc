import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IAutocompleteDataGridSampleMethodOption } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/methods/SampleMethodDataGrid.interface';
import { IAutocompleteDataGridSamplePeriodOption } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/periods/SamplePeriodDataGrid.interface';
import { IAutocompleteDataGridSampleSiteOption } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/sites/SampleSiteDataGrid.interface';
import { SampleLocationCache } from 'features/surveys/observations/observations-table/ObservationsTableContainer';
import { MutableRefObject } from 'react';

export const getCurrentSite = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>
): IAutocompleteDataGridSampleSiteOption | null => {
  const currentSite = cachedSampleLocationsRef.current?.locations.find(
    (site) => site.survey_sample_site_id === dataGridProps.value
  );

  if (!currentSite) {
    return null;
  }

  return {
    ...currentSite,
    label: currentSite.name,
    value: currentSite.survey_sample_site_id
  };
};

export const getCurrentMethod = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>
): IAutocompleteDataGridSampleMethodOption | null => {
  for (const site of cachedSampleLocationsRef.current?.locations ?? []) {
    const currentMethod = site.sample_methods.find((method) => method.survey_sample_method_id === dataGridProps.value);

    if (!currentMethod) {
      continue;
    }

    return {
      ...currentMethod,
      label: currentMethod.technique.name,
      value: currentMethod.survey_sample_method_id
    };
  }

  return null;
};

export const getCurrentPeriod = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>
): IAutocompleteDataGridSamplePeriodOption | null => {
  for (const site of cachedSampleLocationsRef.current?.locations ?? []) {
    for (const method of site.sample_methods ?? []) {
      const currentPeriod = method.sample_periods.find(
        (period) => period.survey_sample_method_id === dataGridProps.value
      );

      if (!currentPeriod) {
        continue;
      }

      return {
        ...currentPeriod,
        label: `${currentPeriod.start_date} ${currentPeriod.start_time ?? ''} - ${currentPeriod.end_date} ${
          currentPeriod.end_time ?? ''
        }`,
        value: currentPeriod.survey_sample_period_id
      };
    }
  }

  return null;
};

export const getMethodsForRow = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>
): IAutocompleteDataGridSampleMethodOption[] => {
  if (!dataGridProps.row.survey_sample_site_id) {
    // If no site is selected, then no methods may be selected
    return [];
  }

  const site = cachedSampleLocationsRef.current?.locations.find(
    (site) => site.survey_sample_site_id === dataGridProps.row.survey_sample_site_id
  );

  if (!site?.sample_methods.length) {
    return [];
  }

  const x =
    site.sample_methods.map((item) => {
      return {
        ...item,
        label: item.technique.name,
        value: item.survey_sample_method_id
      };
    }) ?? [];

  return x;
};

export const getPeriodsForRow = <DataGridType extends GridValidRowModel>(
  dataGridProps: GridRenderCellParams<DataGridType>,
  cachedSampleLocationsRef: MutableRefObject<SampleLocationCache | undefined>
): IAutocompleteDataGridSamplePeriodOption[] => {
  if (!dataGridProps.row.survey_sample_site_id || !dataGridProps.row.survey_sample_method_id) {
    // If no site or method is selected, then no periods may be selected
    return [];
  }

  const periods: IAutocompleteDataGridSamplePeriodOption[] = [];

  const site = cachedSampleLocationsRef.current?.locations.find(
    (site) => site.survey_sample_site_id === dataGridProps.row.survey_sample_site_id
  );

  const method = site?.sample_methods.find(
    (item) => item.survey_sample_method_id === dataGridProps.row.survey_sample_method_id
  );

  for (const period of method?.sample_periods ?? []) {
    periods.push({
      ...period,
      label: `${period.start_date} ${period.start_time ?? ''} - ${period.end_date} ${period.end_time ?? ''}`,
      value: period.survey_sample_period_id
    });
  }

  return periods;
};
