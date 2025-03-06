import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { MutableRefObject, useRef } from 'react';
import { getDateTimeLabel } from 'utils/datetime';

export type SamplingInformationCachedSite = IAutocompleteFieldOption<number> & {
  survey_sample_site_id: number;
};

export type SamplingInformationCachedTechnique = IAutocompleteFieldOption<number> & {
  method_technique_id: number;
  method_response_metric_id: number;
};

export type SamplingInformationCachedPeriod = IAutocompleteFieldOption<number> & {
  survey_sample_period_id: number;
};

export type IndexKey = string;

export type SamplingInformationCacheRef = {
  /**
   * A unique list of sample sites mapped by survey sample site id.
   *
   * @type {Record<number, SamplingInformationCachedSite>}
   */
  sites: Record<number, SamplingInformationCachedSite>;
  /**
   * A mapping of method technique keys to sample site ids.
   *
   * Note: The key is the site id.
   *
   * @type {Record<IndexKey, Set<number>>}
   */
  techniqueIndex: Record<IndexKey, Set<number>>;
  /**
   * A unique list of method techniques mapped by method technique id.
   *
   * @type {Record<number, SamplingInformationCachedTechnique>}
   */
  techniques: Record<number, SamplingInformationCachedTechnique>;
  /**
   * A mapping of method technique keys to sample period ids.
   *
   * Note: The key is a combination of the site id and technique id.
   *
   * @type {Record<IndexKey, Set<number>>}
   */
  periodIndex: Record<IndexKey, Set<number>>;
  /**
   * A unique list of sampling periods mapped by survey sample period id.
   *
   * @type {Record<number, SamplingInformationCachedPeriod>}
   */
  periods: Record<number, SamplingInformationCachedPeriod>;
};

export type SamplingInformationCache = {
  cachedSamplingInformationRef: MutableRefObject<SamplingInformationCacheRef | undefined>;
  initCachedSamplingInformationRef: (params: { periods?: GetSamplingPeriod[] }) => void;
  updateCachedSamplingSites: (sites: SamplingInformationCachedSite[]) => void;
  updateCachedMethodTechniques: (
    techniques: (SamplingInformationCachedTechnique & { survey_sample_site_id: number | null })[]
  ) => void;
  updateCachedSamplingPeriods: (
    periods: (SamplingInformationCachedPeriod & {
      survey_sample_site_id: number | null;
      method_technique_id: number | null;
    })[]
  ) => void;
  getCurrentSite: (surveySampleSiteId: number) => SamplingInformationCachedSite | null;
  getCurrentTechnique: (methodTechniqueId: number) => SamplingInformationCachedTechnique | null;
  getCurrentPeriod: (surveySamplePeriodId: number) => SamplingInformationCachedPeriod | null;
  getTechniquesForRow: (surveySampleSiteId: number | null) => SamplingInformationCachedTechnique[];
  getPeriodsForRow: (
    surveySampleSiteId: number | null,
    methodTechniqueId: number | null
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
      cachedSamplingInformationRef.current = {
        sites: {},
        techniqueIndex: {},
        techniques: {},
        periodIndex: {},
        periods: {}
      };

      return;
    }

    const sitesMap: Record<string, SamplingInformationCachedSite> = {};
    const techniqueIndex: Record<string, Set<number>> = {};
    const techniquesMap: Record<string, SamplingInformationCachedTechnique> = {};
    const periodIndex: Record<string, Set<number>> = {};
    const periodsMap: Record<string, SamplingInformationCachedPeriod> = {};

    params.periods.forEach((period) => {
      if (_isValidSamplingSite(period) && !sitesMap[period.survey_sample_site_id]) {
        sitesMap[period.survey_sample_site_id] = {
          survey_sample_site_id: period.survey_sample_site_id,
          // Satisfy the IAutocompleteDataGridOption interface
          value: period.survey_sample_site_id,
          label: period.survey_sample_site.name
        };
      }

      if (_isValidMethodTechnique(period) && !techniquesMap[period.method_technique_id]) {
        techniquesMap[period.method_technique_id] = {
          method_technique_id: period.method_technique_id,
          method_response_metric_id: period.method_technique.method_response_metric_id,
          // Satisfy the IAutocompleteDataGridOption interface
          value: period.method_technique.method_technique_id,
          label: period.method_technique.name
        };

        if (period.survey_sample_site_id) {
          // If the technique has a parent site, ensure it is indexed
          techniqueIndex[_getSiteTechniqueKey(period.survey_sample_site_id)] = (
            techniqueIndex[_getSiteTechniqueKey(period.survey_sample_site_id)] ?? new Set<number>()
          ).add(period.method_technique.method_technique_id);
        }
      }

      if (_isValidSamplingPeriod(period) && !periodsMap[period.survey_sample_period_id]) {
        periodsMap[period.survey_sample_period_id] = {
          survey_sample_period_id: period.survey_sample_period_id,
          // Satisfy the IAutocompleteDataGridOption interface
          value: period.survey_sample_period_id,
          label: getDateTimeLabel(period.start_date, period.start_time, period.end_date, period.end_time)
        };

        if (period.survey_sample_site_id && period.method_technique_id) {
          // If the period has a parent technique, ensure it is indexed
          periodIndex[_getTechniquePeriodKey(period.survey_sample_site_id, period.method_technique_id)] = (
            periodIndex[_getTechniquePeriodKey(period.survey_sample_site_id, period.method_technique_id)] ??
            new Set<number>()
          ).add(period.survey_sample_period_id);
        }
      }
    });

    cachedSamplingInformationRef.current = {
      sites: sitesMap,
      techniqueIndex: techniqueIndex,
      techniques: techniquesMap,
      periodIndex: periodIndex,
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
      if (!newSitesMap[site.survey_sample_site_id]) {
        // If the site is not already in the map, add it
        newSitesMap[site.survey_sample_site_id] = site;
      }
    }

    // Update the cache
    cachedSamplingInformationRef.current = {
      sites: newSitesMap,
      techniqueIndex: cachedSamplingInformationRef.current.techniqueIndex,
      techniques: cachedSamplingInformationRef.current.techniques,
      periodIndex: cachedSamplingInformationRef.current.periodIndex,
      periods: cachedSamplingInformationRef.current.periods
    };
  };

  /**
   * Update the cache with new method techniques. Will ignore techniques that are already in the cache.
   *
   * @param {((SamplingInformationCachedTechnique & { survey_sample_site_id: number | null })[])} techniques
   * @return {*}
   */
  const updateCachedMethodTechniques = (
    techniques: (SamplingInformationCachedTechnique & { survey_sample_site_id: number | null })[]
  ) => {
    if (!cachedSamplingInformationRef.current) {
      return;
    }

    const techniquesMap = cachedSamplingInformationRef.current.techniques;
    const techniquesIndex = cachedSamplingInformationRef.current.techniqueIndex;

    for (const technique of techniques) {
      if (!techniquesMap[technique.method_technique_id]) {
        // If the technique is not already in the map, add it
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { survey_sample_site_id, ...rest } = technique;
        techniquesMap[technique.method_technique_id] = rest;
      }

      if (technique.survey_sample_site_id) {
        // If the technique has a parent site, ensure it is indexed
        techniquesIndex[_getSiteTechniqueKey(technique.survey_sample_site_id)] = (
          techniquesIndex[_getSiteTechniqueKey(technique.survey_sample_site_id)] ?? new Set()
        ).add(technique.method_technique_id);
      }
    }

    // Update the cache
    cachedSamplingInformationRef.current = {
      sites: cachedSamplingInformationRef.current.sites,
      techniqueIndex: techniquesIndex,
      techniques: techniquesMap,
      periodIndex: cachedSamplingInformationRef.current.periodIndex,
      periods: cachedSamplingInformationRef.current.periods
    };
  };

  /**
   * Update the cache with new sampling periods. Will ignore periods that are already in the cache.
   *
   * @param {((SamplingInformationCachedPeriod & {
   *       survey_sample_site_id: number | null;
   *       method_technique_id: number | null;
   *     })[])} periods
   * @return {*}
   */
  const updateCachedSamplingPeriods = (
    periods: (SamplingInformationCachedPeriod & {
      survey_sample_site_id: number | null;
      method_technique_id: number | null;
    })[]
  ) => {
    if (!cachedSamplingInformationRef.current) {
      return;
    }

    const periodsMap = cachedSamplingInformationRef.current.periods;
    const periodIndex = cachedSamplingInformationRef.current.periodIndex;

    for (const period of periods) {
      if (!periodsMap[period.survey_sample_period_id]) {
        // If the period is not already in the map, add it
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { survey_sample_site_id, method_technique_id, ...rest } = period;
        periodsMap[period.survey_sample_period_id] = rest;
      }

      if (period.survey_sample_site_id && period.method_technique_id) {
        // If the technique has a parent site, ensure it is indexed
        periodIndex[_getTechniquePeriodKey(period.survey_sample_site_id, period.method_technique_id)] = (
          periodIndex[_getTechniquePeriodKey(period.survey_sample_site_id, period.method_technique_id)] ?? new Set()
        ).add(period.survey_sample_period_id);
      }
    }

    // Update the cache
    cachedSamplingInformationRef.current = {
      sites: cachedSamplingInformationRef.current.sites,
      techniqueIndex: cachedSamplingInformationRef.current.techniqueIndex,
      techniques: cachedSamplingInformationRef.current.techniques,
      periodIndex: periodIndex,
      periods: periodsMap
    };
  };

  /**
   * Return the site object for the provided site id.
   *
   * @param {(number | null)} surveySampleSiteId
   * @return {*}  {(SamplingInformationCachedSite | null)}
   */
  const findSite = (surveySampleSiteId: number | null): SamplingInformationCachedSite | null => {
    if (!surveySampleSiteId) {
      return null;
    }

    return cachedSamplingInformationRef.current?.sites[surveySampleSiteId] ?? null;
  };

  /**
   * Return the technique object for the provided technique id.
   *
   * @param {(number | null)} techniqueId
   * @return {*}  {(SamplingInformationCachedTechnique | null)}
   */
  const findTechnique = (methodTechniqueId: number | null): SamplingInformationCachedTechnique | null => {
    if (!methodTechniqueId) {
      return null;
    }

    return cachedSamplingInformationRef.current?.techniques[methodTechniqueId] ?? null;
  };

  /**
   * Return the period object for the provided period id.
   *
   * @param {(number | null)} surveySamplePeriodId
   * @return {*}  {(SamplingInformationCachedPeriod | null)}
   */
  const findPeriod = (surveySamplePeriodId: number | null): SamplingInformationCachedPeriod | null => {
    if (!surveySamplePeriodId) {
      return null;
    }

    return cachedSamplingInformationRef.current?.periods[surveySamplePeriodId] ?? null;
  };

  /**
   * Get the currently selected site for the row.
   *
   * @param {number} surveySampleSiteId
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
   * @param {(number | null)} surveySampleSiteId
   * @return {*}  {SamplingInformationCachedTechnique[]}
   */
  const getTechniquesForRow = (surveySampleSiteId: number | null): SamplingInformationCachedTechnique[] => {
    if (!surveySampleSiteId) {
      return [];
    }

    // Get all technique ids for the provided site id
    const methodTechniqueIds: number[] = Array.from(
      cachedSamplingInformationRef.current?.techniqueIndex[_getSiteTechniqueKey(surveySampleSiteId)] ??
        new Set<number>()
    );

    // Get all techniques for the matching technique ids
    return methodTechniqueIds
      .map((methodTechniqueId) => cachedSamplingInformationRef.current?.techniques[methodTechniqueId])
      .filter((value): value is SamplingInformationCachedTechnique => value !== undefined);
  };

  /**
   * Get all valid periods for the currently selected site and technique.
   *
   * @param {(number | null)} surveySampleSiteId
   * @param {(number | null)} methodTechniqueId
   * @return {*}  {SamplingInformationCachedPeriod[]}
   */
  const getPeriodsForRow = (
    surveySampleSiteId: number | null,
    methodTechniqueId: number | null
  ): SamplingInformationCachedPeriod[] => {
    if (!surveySampleSiteId || !methodTechniqueId) {
      return [];
    }

    // Get all period ids for the provided technique id
    const samplePeriodIds: number[] = Array.from(
      cachedSamplingInformationRef.current?.periodIndex[
        _getTechniquePeriodKey(surveySampleSiteId, methodTechniqueId)
      ] ?? new Set<number>()
    );

    // Get all periods for the matching period ids
    return samplePeriodIds
      .map((samplePeriodId) => cachedSamplingInformationRef.current?.periods[samplePeriodId])
      .filter((value): value is SamplingInformationCachedPeriod => value !== undefined);
  };

  /**
   * Get a key for the site technique index.
   *
   * @param {(number | null)} surveySampleSiteId
   * @return {*}  {IndexKey}
   */
  const _getSiteTechniqueKey = (surveySampleSiteId: number): IndexKey => {
    return `${surveySampleSiteId}`;
  };

  /**
   * Get a key for the technique period index.
   *
   * @param {(number | null)} surveySampleSiteId
   * @param {(number | null)} methodTechniqueId
   * @return {*}  {IndexKey}
   */
  const _getTechniquePeriodKey = (surveySampleSiteId: number, methodTechniqueId: number): IndexKey => {
    return `${surveySampleSiteId}-${methodTechniqueId}`;
  };

  /**
   * Type guard to check if the provided sampling period has valid sample site data.
   *
   * @param {GetSamplingPeriod} period
   * @return {*}  {(period is GetSamplingPeriod & {
   *     survey_sample_site_id: NonNullable<GetSamplingPeriod['survey_sample_site_id']>;
   *     survey_sample_site: NonNullable<GetSamplingPeriod['survey_sample_site']>;
   *   })}
   */
  const _isValidSamplingSite = (
    period: GetSamplingPeriod
  ): period is GetSamplingPeriod & {
    survey_sample_site_id: NonNullable<GetSamplingPeriod['survey_sample_site_id']>;
    survey_sample_site: NonNullable<GetSamplingPeriod['survey_sample_site']>;
  } => {
    return period.survey_sample_site_id !== null && period.survey_sample_site !== null;
  };

  /**
   * Type guard to check if the provided sampling period has valid method technique data.
   *
   * @param {GetSamplingPeriod} period
   * @return {*}  {(period is GetSamplingPeriod & {
   *     method_technique_id: NonNullable<GetSamplingPeriod['method_technique_id']>;
   *     method_technique: NonNullable<GetSamplingPeriod['method_technique']>;
   *   })}
   */
  const _isValidMethodTechnique = (
    period: GetSamplingPeriod
  ): period is GetSamplingPeriod & {
    method_technique_id: NonNullable<GetSamplingPeriod['method_technique_id']>;
    method_technique: NonNullable<GetSamplingPeriod['method_technique']>;
  } => {
    return period.method_technique_id !== null && period.method_technique !== null;
  };

  /**
   * Type guard to check if the provided sampling period has valid sample period data.
   *
   * @param {GetSamplingPeriod} period
   * @return {*}  {(period is GetSamplingPeriod & {
   *     start_date: NonNullable<GetSamplingPeriod['start_date']>;
   *     end_date: NonNullable<GetSamplingPeriod['end_date']>;
   *   })}
   */
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
