import { GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { MutableRefObject, useRef } from 'react';
import { getDateTimeLabel } from 'utils/datetime';

export type SamplingInformationCachedSite = IAutocompleteDataGridOption<number> & {
  survey_sample_site_id: number;
};

export type SamplingInformationCachedTechnique = IAutocompleteDataGridOption<number> & {
  method_technique_id: number;
  survey_sample_site_id: number | null;
  method_response_metric_id: number;
};

export type SamplingInformationCachedPeriod = IAutocompleteDataGridOption<number> & {
  survey_sample_period_id: number;
  survey_sample_site_id: number | null;
  method_technique_id: number | null;
};

export type SamplingInformationCacheRef = {
  // A unique list of sample sites
  sites: SamplingInformationCachedSite[];
  // A unique list of techniques
  techniques: SamplingInformationCachedTechnique[];
  // A unique list of sampling periods
  periods: SamplingInformationCachedPeriod[];
};

export type SamplingInformationCache = {
  cachedSamplingInformationRef: MutableRefObject<SamplingInformationCacheRef | undefined>;
  initCachedSamplingInformationRef: (params: { periods?: GetSamplingPeriod[] }) => void;
  updateCachedSamplingSites: (sites: SamplingInformationCachedSite[]) => void;
  updateCachedMethodTechniques: (techniques: SamplingInformationCachedTechnique[]) => void;
  updateCachedSamplingPeriods: (periods: SamplingInformationCachedPeriod[]) => void;
  getCurrentSite: <DataGridType extends GridValidRowModel>(
    dataGridProps: GridRenderCellParams<DataGridType>
  ) => SamplingInformationCachedSite | null;
  getCurrentTechnique: <DataGridType extends GridValidRowModel>(
    dataGridProps: GridRenderCellParams<DataGridType>
  ) => SamplingInformationCachedTechnique | null;
  getCurrentPeriod: <DataGridType extends GridValidRowModel>(
    dataGridProps: GridRenderCellParams<DataGridType>
  ) => SamplingInformationCachedPeriod | null;
  getTechniquesForRow: (survey_sample_site_id: number | undefined) => SamplingInformationCachedTechnique[];
  getPeriodsForRow: (
    survey_sample_site_id: number | undefined,
    method_technique_id: number | undefined
  ) => SamplingInformationCachedPeriod[];
};

/**
 * A hook to manage a cache of sampling information.
 *
 * Provides methods to initialize the cache, update the cache with new data, and retrieve data from the cache.
 *
 * @return {*}  {SamplingInformationCache}
 */
export const useSamplingInformationCache = (): SamplingInformationCache => {
  const cachedSamplingInformationRef = useRef<SamplingInformationCacheRef>();

  /**
   * Initialize the cache with the provided sampling periods.
   *
   * @param {{ periods?: GetSamplingPeriod[] }} params
   * @return {*}
   */
  const initCachedSamplingInformationRef = (params: { periods?: GetSamplingPeriod[] }) => {
    if (!params.periods?.length) {
      // No periods to initialize with
      return;
    }

    if (cachedSamplingInformationRef.current) {
      // Already initialized
      return;
    }

    const sitesMap = new Map<number, SamplingInformationCachedSite>();
    params.periods.forEach((period) => {
      if (!period.survey_sample_site_id || !period.survey_sample_site) {
        return;
      }

      sitesMap.set(period.survey_sample_site.survey_sample_site_id, {
        survey_sample_site_id: period.survey_sample_site.survey_sample_site_id,
        // Satisfy the IAutocompleteDataGridOption interface
        value: period.survey_sample_site_id,
        label: period.survey_sample_site.name
      });
    });
    const sites = Array.from(sitesMap.values());

    const techniquesMap = new Map<number, SamplingInformationCachedTechnique>();
    params.periods.forEach((period) => {
      if (!period.method_technique_id || !period.method_technique) {
        return;
      }

      techniquesMap.set(period.method_technique.method_technique_id, {
        method_technique_id: period.method_technique.method_technique_id,
        survey_sample_site_id: period.survey_sample_site?.survey_sample_site_id ?? null, // Default to null if not available
        method_response_metric_id: period.method_technique.method_response_metric_id,
        // Satisfy the IAutocompleteDataGridOption interface
        value: period.method_technique_id,
        label: period.method_technique.name
      });
    });
    const techniques = Array.from(techniquesMap.values());

    const periodsMap = new Map<number, SamplingInformationCachedPeriod>();
    params.periods.forEach((period) => {
      if (!period.start_date || !period.end_date) {
        return;
      }

      periodsMap.set(period.survey_sample_period_id, {
        survey_sample_period_id: period.survey_sample_period_id,
        survey_sample_site_id: period.survey_sample_site?.survey_sample_site_id ?? null,
        method_technique_id: period.method_technique?.method_technique_id ?? null,
        // Satisfy the IAutocompleteDataGridOption interface
        value: period.survey_sample_period_id,
        label: getDateTimeLabel(period.start_date, period.start_time, period.end_date, period.end_time)
      });
    });
    const periods = Array.from(periodsMap.values());

    cachedSamplingInformationRef.current = {
      sites,
      techniques,
      periods
    };
  };

  /**
   * Update the cache with new sampling sites. Will ignore sites that are already in the cache.
   *
   * @param {SamplingInformationCachedSite[]} sites
   * @return {*}
   */
  const updateCachedSamplingSites = (sites: SamplingInformationCachedSite[]) => {
    if (!cachedSamplingInformationRef.current) {
      return;
    }

    const newSites = [];

    for (const site of sites ?? []) {
      if (
        cachedSamplingInformationRef.current.sites.findIndex(
          (item) => item.survey_sample_site_id === site.survey_sample_site_id
        ) !== -1
      ) {
        // The site is already in the cache
        continue;
      }

      newSites.push(site);
    }

    // Update the cache
    cachedSamplingInformationRef.current = {
      sites: [...cachedSamplingInformationRef.current.sites, ...newSites],
      techniques: cachedSamplingInformationRef.current.techniques,
      periods: cachedSamplingInformationRef.current.periods
    };
  };

  /**
   * Update the cache with new method techniques. Will ignore techniques that are already in the cache.
   *
   * @param {SamplingInformationCachedTechnique[]} techniques
   * @return {*}
   */
  const updateCachedMethodTechniques = (techniques: SamplingInformationCachedTechnique[]) => {
    if (!cachedSamplingInformationRef.current) {
      return;
    }

    const newTechniques = [];

    for (const technique of techniques ?? []) {
      if (
        cachedSamplingInformationRef.current.techniques.findIndex(
          (item) => item.method_technique_id === technique.method_technique_id
        ) !== -1
      ) {
        // The technique is already in the cache
        continue;
      }

      newTechniques.push(technique);
    }

    // Update the cache
    cachedSamplingInformationRef.current = {
      sites: cachedSamplingInformationRef.current.sites,
      techniques: [...cachedSamplingInformationRef.current.techniques, ...newTechniques],
      periods: cachedSamplingInformationRef.current.periods
    };
  };

  /**
   * Update the cache with new sampling periods. Will ignore periods that are already in the cache.
   *
   * @param {SamplingInformationCachedPeriod[]} periods
   * @return {*}
   */
  const updateCachedSamplingPeriods = (periods: SamplingInformationCachedPeriod[]) => {
    if (!cachedSamplingInformationRef.current) {
      return;
    }

    const newPeriods = [];

    for (const period of periods ?? []) {
      if (
        cachedSamplingInformationRef.current.periods.findIndex(
          (item) => item.survey_sample_period_id === period.survey_sample_period_id
        ) !== -1
      ) {
        // The period is already in the cache
        continue;
      }

      newPeriods.push(period);
    }

    // Update the cache
    cachedSamplingInformationRef.current = {
      sites: cachedSamplingInformationRef.current.sites,
      techniques: cachedSamplingInformationRef.current.techniques,
      periods: [...cachedSamplingInformationRef.current.periods, ...newPeriods]
    };
  };

  /**
   * Return the site object for the provided site id.
   *
   * @param {(number | undefined)} siteId
   * @param {(SamplingInformationCacheRef | undefined)} cache
   */
  const findSite = (siteId: number | undefined) =>
    cachedSamplingInformationRef.current?.sites.find((site) => site.survey_sample_site_id === siteId);

  /**
   * Return the technique object for the provided technique id.
   *
   * @param {(number | undefined)} techniqueId
   * @param {(SamplingInformationCacheRef | undefined)} cache
   */
  const findTechnique = (techniqueId: number | undefined) =>
    cachedSamplingInformationRef.current?.techniques.find((technique) => technique.method_technique_id === techniqueId);

  /**
   * Return the period object for the provided period id.
   *
   * @param {(number | undefined)} periodId
   * @param {(SamplingInformationCacheRef | undefined)} cache
   */
  const findPeriod = (periodId: number | undefined) =>
    cachedSamplingInformationRef.current?.periods.find((period) => period.survey_sample_period_id === periodId);

  /**
   * Get the currently selected site for the row.
   *
   * @template DataGridType
   * @param {GridRenderCellParams<DataGridType>} dataGridProps
   * @param {(MutableRefObject<SamplingInformationCacheRef | undefined>)} cachedSamplingInformationRef
   * @return {*}  {(SamplingInformationCachedSite | null)}
   */
  const getCurrentSite = <DataGridType extends GridValidRowModel>(
    dataGridProps: GridRenderCellParams<DataGridType>
  ): SamplingInformationCachedSite | null => {
    return findSite(dataGridProps.value as number) ?? null;
  };

  /**
   * Get the currently selected method technique for the row.
   *
   * @template DataGridType
   * @param {GridRenderCellParams<DataGridType>} dataGridProps
   * @param {(MutableRefObject<SamplingInformationCacheRef | undefined>)} cachedSamplingInformationRef
   * @return {*}  {(SamplingInformationCachedTechnique | null)}
   */
  const getCurrentTechnique = <DataGridType extends GridValidRowModel>(
    dataGridProps: GridRenderCellParams<DataGridType>
  ): SamplingInformationCachedTechnique | null => {
    return findTechnique(dataGridProps.value as number) ?? null;
  };

  /**
   * Get the currently selected period for the row.
   *
   * @template DataGridType
   * @param {GridRenderCellParams<DataGridType>} dataGridProps
   * @param {(MutableRefObject<SamplingInformationCacheRef | undefined>)} cachedSamplingInformationRef
   * @return {*}  {(SamplingInformationCachedPeriod | null)}
   */
  const getCurrentPeriod = <DataGridType extends GridValidRowModel>(
    dataGridProps: GridRenderCellParams<DataGridType>
  ): SamplingInformationCachedPeriod | null => {
    return findPeriod(dataGridProps.value as number) ?? null;
  };

  /**
   * Get all valid techniques for the currently selected site.
   *
   * @param {(number | undefined)} survey_sample_site_id
   * @param {(MutableRefObject<SamplingInformationCacheRef | undefined>)} cachedSamplingInformationRef
   * @return {*}  {SamplingInformationCachedTechnique[]}
   */
  const getTechniquesForRow = (survey_sample_site_id: number | undefined): SamplingInformationCachedTechnique[] => {
    const site = findSite(survey_sample_site_id);

    if (!site) {
      return [];
    }

    const matchingTechniques = cachedSamplingInformationRef.current?.techniques.filter((technique) => {
      return technique.survey_sample_site_id === site.survey_sample_site_id;
    });

    return matchingTechniques ?? [];
  };

  /**
   * Get all valid periods for the currently selected site and technique.
   *
   * @param {(number | undefined)} survey_sample_site_id
   * @param {(number | undefined)} method_technique_id
   * @param {(MutableRefObject<SamplingInformationCacheRef | undefined>)} cachedSamplingInformationRef
   * @return {*}  {SamplingInformationCachedPeriod[]}
   */
  const getPeriodsForRow = (
    survey_sample_site_id: number | undefined,
    method_technique_id: number | undefined
  ): SamplingInformationCachedPeriod[] => {
    const site = findSite(survey_sample_site_id);
    const technique = findTechnique(method_technique_id);

    if (!site || !technique) {
      return [];
    }

    const matchingPeriods = cachedSamplingInformationRef.current?.periods.filter((period) => {
      return (
        period.survey_sample_site_id === site.survey_sample_site_id &&
        period.method_technique_id === technique.method_technique_id
      );
    });

    return matchingPeriods ?? [];
  };

  return {
    cachedSamplingInformationRef,
    initCachedSamplingInformationRef,
    updateCachedSamplingSites,
    updateCachedMethodTechniques,
    updateCachedSamplingPeriods,
    getCurrentSite,
    getCurrentTechnique,
    getCurrentPeriod,
    getTechniquesForRow,
    getPeriodsForRow
  };
};
