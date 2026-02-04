import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { MutableRefObject, useMemo, useRef } from 'react';
import { getDateTimeLabel } from 'utils/datetime';

// TODO: Update to use the logic from the other useSamplingInformationCache file (deprecate this one?).
// It has improved logic and is more up-to-date. Both caches could probably be merged, with the context specific
// functions being moved to separate utils file or something similar.

function _isValidSamplingSite(period: GetSamplingPeriod): period is GetSamplingPeriod & {
  survey_sample_site_id: NonNullable<GetSamplingPeriod['survey_sample_site_id']>;
  survey_sample_site: NonNullable<GetSamplingPeriod['survey_sample_site']>;
} {
  return period.survey_sample_site_id !== null && period.survey_sample_site !== null;
}

function _isValidMethodTechnique(period: GetSamplingPeriod): period is GetSamplingPeriod & {
  method_technique_id: NonNullable<GetSamplingPeriod['method_technique_id']>;
  method_technique: NonNullable<GetSamplingPeriod['method_technique']>;
} {
  return period.method_technique_id !== null && period.method_technique !== null;
}

function _isValidSamplingPeriod(period: GetSamplingPeriod): period is GetSamplingPeriod & {
  start_date: NonNullable<GetSamplingPeriod['start_date']>;
  end_date: NonNullable<GetSamplingPeriod['end_date']>;
} {
  return period.start_date !== null && period.end_date !== null;
}

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

  return useMemo(() => {
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
            value: period.survey_sample_site_id,
            label: period.survey_sample_site.name
          });
        }
        if (_isValidMethodTechnique(period) && !techniquesMap.has(period.method_technique.method_technique_id)) {
          techniquesMap.set(period.method_technique.method_technique_id, {
            method_technique_id: period.method_technique.method_technique_id,
            survey_sample_site_id: period.survey_sample_site_id,
            method_response_metric_id: period.method_technique.method_response_metric_id,
            value: period.method_technique.method_technique_id,
            label: period.method_technique.name
          });
        }
        if (_isValidSamplingPeriod(period) && !periodsMap.has(period.survey_sample_period_id)) {
          periodsMap.set(period.survey_sample_period_id, {
            survey_sample_period_id: period.survey_sample_period_id,
            survey_sample_site_id: period.survey_sample_site_id,
            method_technique_id: period.method_technique_id,
            value: period.survey_sample_period_id,
            label: getDateTimeLabel(period.start_date, period.start_time, period.end_date, period.end_time)
          });
        }
      });
      cachedSamplingInformationRef.current = { sites: sitesMap, techniques: techniquesMap, periods: periodsMap };
    };

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
      cachedSamplingInformationRef.current = {
        sites: newSitesMap,
        techniques: cachedSamplingInformationRef.current.techniques,
        periods: cachedSamplingInformationRef.current.periods
      };
    };

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
      cachedSamplingInformationRef.current = {
        sites: cachedSamplingInformationRef.current.sites,
        techniques: newTechniquesMap,
        periods: cachedSamplingInformationRef.current.periods
      };
    };

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
      cachedSamplingInformationRef.current = {
        sites: cachedSamplingInformationRef.current.sites,
        techniques: cachedSamplingInformationRef.current.techniques,
        periods: newPeriodsMap
      };
    };

    const getCurrentSite = (surveySampleSiteId: number): SamplingInformationCachedSite | null =>
      cachedSamplingInformationRef.current?.sites.get(surveySampleSiteId) ?? null;

    const getCurrentTechnique = (methodTechniqueId: number): SamplingInformationCachedTechnique | null =>
      cachedSamplingInformationRef.current?.techniques.get(methodTechniqueId) ?? null;

    const getCurrentPeriod = (surveySamplePeriodId: number): SamplingInformationCachedPeriod | null =>
      cachedSamplingInformationRef.current?.periods.get(surveySamplePeriodId) ?? null;

    const getTechniquesForRow = (surveySampleSiteId?: number | null): SamplingInformationCachedTechnique[] =>
      surveySampleSiteId
        ? Array.from(cachedSamplingInformationRef.current?.techniques.values() ?? []).filter(
            (t) => t.survey_sample_site_id === surveySampleSiteId
          )
        : [];

    const getPeriodsForRow = (methodTechniqueId?: number | null): SamplingInformationCachedPeriod[] =>
      methodTechniqueId
        ? Array.from(cachedSamplingInformationRef.current?.periods.values() ?? []).filter(
            (p) => p.method_technique_id === methodTechniqueId
          )
        : [];

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
  }, [cachedSamplingInformationRef]);
};
