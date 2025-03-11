import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { MutableRefObject, useRef } from 'react';
import { getDateTimeLabel } from 'utils/datetime';

// TODO: Update to use the logic from the other useSamplingInformationCache file (deprecate this one?).
// It has improved logic and is more up-to-date. Both caches could probably be merged, with the context specific
// functions being moved to separate utils file or something similar.

export type SamplingInformationCachedSite = IAutocompleteFieldOption<number> & {
  survey_sample_site_id: number;
};

export type SamplingInformationCachedTechnique = IAutocompleteFieldOption<number> & {
  method_technique_id: number;
  survey_sample_site_id: number | null;
  method_response_metric_id: number;
};

export type SamplingInformationCachedPeriod = IAutocompleteFieldOption<number> & {
  survey_sample_period_id: number;
  survey_sample_site_id: number | null;
  method_technique_id: number | null;
};

export type SamplingInformationCacheRef = {
  // A unique list of sample sites
  sites: Map<number, SamplingInformationCachedSite>;
  // A unique list of techniques
  techniques: Map<number, SamplingInformationCachedTechnique>;
  // A unique list of sampling periods
  periods: Map<number, SamplingInformationCachedPeriod>;
};

export type SamplingInformationCache = {
  cachedSamplingInformationRef: MutableRefObject<SamplingInformationCacheRef | undefined>;
  initCachedSamplingInformationRef: (params: { periods?: GetSamplingPeriod[] }) => void;
  updateCachedSamplingSites: (sites: SamplingInformationCachedSite[]) => void;
  updateCachedMethodTechniques: (techniques: SamplingInformationCachedTechnique[]) => void;
  updateCachedSamplingPeriods: (periods: SamplingInformationCachedPeriod[]) => void;
  getCurrentSite: (surveySampleSiteId: number) => SamplingInformationCachedSite | null;
  getCurrentTechnique: (methodTechniqueId: number) => SamplingInformationCachedTechnique | null;
  getCurrentPeriod: (surveySamplePeriodId: number) => SamplingInformationCachedPeriod | null;
  getTechniquesForRow: (survey_sample_site_id: number | null) => SamplingInformationCachedTechnique[];
  getPeriodsForRow: (method_technique_id: number | null) => SamplingInformationCachedPeriod[];
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
      cachedSamplingInformationRef.current = {
        sites: new Map(),
        techniques: new Map(),
        periods: new Map()
      };

      return;
    }

    const sitesMap: Map<number, SamplingInformationCachedSite> = new Map();
    const techniquesMap: Map<number, SamplingInformationCachedTechnique> = new Map();
    const periodsMap: Map<number, SamplingInformationCachedPeriod> = new Map();

    params.periods.forEach((period) => {
      if (_isValidSamplingSite(period) && !sitesMap.has(period.survey_sample_site_id)) {
        sitesMap.set(period.survey_sample_site_id, {
          survey_sample_site_id: period.survey_sample_site_id,
          // Satisfy the IAutocompleteDataGridOption interface
          value: period.survey_sample_site_id,
          label: period.survey_sample_site.name
        });
      }

      if (_isValidMethodTechnique(period) && !techniquesMap.has(period.method_technique.method_technique_id)) {
        techniquesMap.set(period.method_technique.method_technique_id, {
          method_technique_id: period.method_technique.method_technique_id,
          survey_sample_site_id: period.survey_sample_site_id,
          method_response_metric_id: period.method_technique.method_response_metric_id,
          // Satisfy the IAutocompleteDataGridOption interface
          value: period.method_technique.method_technique_id,
          label: period.method_technique.name
        });
      }

      if (_isValidSamplingPeriod(period) && !periodsMap.has(period.survey_sample_period_id)) {
        periodsMap.set(period.survey_sample_period_id, {
          survey_sample_period_id: period.survey_sample_period_id,
          survey_sample_site_id: period.survey_sample_site_id,
          method_technique_id: period.method_technique_id,
          // Satisfy the IAutocompleteDataGridOption interface
          value: period.survey_sample_period_id,
          label: getDateTimeLabel(period.start_date, period.start_time, period.end_date, period.end_time)
        });
      }
    });

    cachedSamplingInformationRef.current = {
      sites: sitesMap,
      techniques: techniquesMap,
      periods: periodsMap
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

    const newSitesMap = cachedSamplingInformationRef.current.sites;

    for (const site of sites) {
      if (!newSitesMap.has(site.survey_sample_site_id)) {
        newSitesMap.set(site.survey_sample_site_id, site);
      }
    }

    // Update the cache
    cachedSamplingInformationRef.current = {
      sites: newSitesMap,
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

    const newTechniquesMap = cachedSamplingInformationRef.current.techniques;

    for (const technique of techniques) {
      if (!newTechniquesMap.has(technique.method_technique_id)) {
        newTechniquesMap.set(technique.method_technique_id, technique);
      }
    }

    // Update the cache
    cachedSamplingInformationRef.current = {
      sites: cachedSamplingInformationRef.current.sites,
      techniques: newTechniquesMap,
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

    const newPeriodsMap = cachedSamplingInformationRef.current.periods;

    for (const period of periods) {
      if (!newPeriodsMap.has(period.survey_sample_period_id)) {
        newPeriodsMap.set(period.survey_sample_period_id, period);
      }
    }

    // Update the cache
    cachedSamplingInformationRef.current = {
      sites: cachedSamplingInformationRef.current.sites,
      techniques: cachedSamplingInformationRef.current.techniques,
      periods: newPeriodsMap
    };
  };

  /**
   * Return the site object for the provided site id.
   *
   * @param {(number | null)} [siteId]
   * @return {*}  {(SamplingInformationCachedSite | null)}
   */
  const findSite = (siteId?: number | null): SamplingInformationCachedSite | null => {
    if (!siteId) {
      return null;
    }

    return cachedSamplingInformationRef.current?.sites.get(siteId) ?? null;
  };

  /**
   * Return the technique object for the provided technique id.
   *
   * @param {(number | null)} [techniqueId]
   * @return {*}  {(SamplingInformationCachedTechnique | null)}
   */
  const findTechnique = (techniqueId?: number | null): SamplingInformationCachedTechnique | null => {
    if (!techniqueId) {
      return null;
    }

    return cachedSamplingInformationRef.current?.techniques.get(techniqueId) ?? null;
  };

  /**
   * Return the period object for the provided period id.
   *
   * @param {(number | null)} [periodId]
   * @return {*}  {(SamplingInformationCachedPeriod | null)}
   */
  const findPeriod = (periodId?: number | null): SamplingInformationCachedPeriod | null => {
    if (!periodId) {
      return null;
    }

    return cachedSamplingInformationRef.current?.periods.get(periodId) ?? null;
  };

  /**
   * Get the currently selected site for the row.
   *
   * @template DataGridType
   * @param {GridRenderCellParams<DataGridType>} dataGridProps
   * @param {(MutableRefObject<SamplingInformationCacheRef | undefined>)} cachedSamplingInformationRef
   * @return {*}  {(SamplingInformationCachedSite | null)}
   */
  const getCurrentSite = (surveySampleSiteId: number): SamplingInformationCachedSite | null => {
    return findSite(surveySampleSiteId) ?? null;
  };

  /**
   * Get the currently selected method technique for the row.
   *
   * @param {number} methodTechniqueId
   * @return {*}  {(SamplingInformationCachedTechnique | null)}
   */
  const getCurrentTechnique = (methodTechniqueId: number): SamplingInformationCachedTechnique | null => {
    return findTechnique(methodTechniqueId) ?? null;
  };

  /**
   * Get the currently selected period for the row.
   *
   * @param {number} surveySamplePeriodId
   * @return {*}  {(SamplingInformationCachedPeriod | null)}
   */
  const getCurrentPeriod = (surveySamplePeriodId: number): SamplingInformationCachedPeriod | null => {
    return findPeriod(surveySamplePeriodId) ?? null;
  };

  /**
   * Get all valid techniques for the currently selected site.
   *
   * @param {(number | null)} [surveySampleSiteId]
   * @return {*}  {SamplingInformationCachedTechnique[]}
   */
  const getTechniquesForRow = (surveySampleSiteId?: number | null): SamplingInformationCachedTechnique[] => {
    if (!surveySampleSiteId) {
      return [];
    }

    return Array.from(cachedSamplingInformationRef.current?.techniques.values() ?? []).filter((technique) => {
      return technique.survey_sample_site_id === surveySampleSiteId;
    });
  };

  /**
   * Get all valid periods for the currently selected site and technique.
   *
   * @param {(number | null)} [methodTechniqueId]
   * @return {*}  {SamplingInformationCachedPeriod[]}
   */
  const getPeriodsForRow = (methodTechniqueId?: number | null): SamplingInformationCachedPeriod[] => {
    if (!methodTechniqueId) {
      return [];
    }

    return Array.from(cachedSamplingInformationRef.current?.periods.values() ?? []).filter((period) => {
      return period.method_technique_id === methodTechniqueId;
    });
  };

  const _isValidSamplingSite = (
    period: GetSamplingPeriod
  ): period is GetSamplingPeriod & {
    survey_sample_site_id: NonNullable<GetSamplingPeriod['survey_sample_site_id']>;
    survey_sample_site: NonNullable<GetSamplingPeriod['survey_sample_site']>;
  } => {
    return period.survey_sample_site_id !== null && period.survey_sample_site !== null;
  };

  const _isValidMethodTechnique = (
    period: GetSamplingPeriod
  ): period is GetSamplingPeriod & {
    method_technique_id: NonNullable<GetSamplingPeriod['method_technique_id']>;
    method_technique: NonNullable<GetSamplingPeriod['method_technique']>;
  } => {
    return period.method_technique_id !== null && period.method_technique !== null;
  };

  const _isValidSamplingPeriod = (
    period: GetSamplingPeriod
  ): period is GetSamplingPeriod & {
    start_date: NonNullable<GetSamplingPeriod['start_date']>;
    end_date: NonNullable<GetSamplingPeriod['end_date']>;
  } => {
    return period.start_date !== null && period.end_date !== null;
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
