import { IAutocompleteDataGridOption } from 'components/data-grid/autocomplete/AutocompleteDataGrid.interface';
import { getPeriodLabel } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/utils';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { MutableRefObject, useMemo, useRef } from 'react';

export type SamplingInformationCachedSite = IAutocompleteDataGridOption<number> & {
  survey_sample_site_id: number;
};

export type SamplingInformationCachedTechnique = IAutocompleteDataGridOption<number> & {
  method_technique_id: number;
  survey_sample_site_id: number;
  method_response_metric_id: number;
};

export type SamplingInformationCachedPeriod = IAutocompleteDataGridOption<number> & {
  survey_sample_period_id: number;
  survey_sample_site_id: number;
  method_technique_id: number;
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
  cachedSampleLocationsRef: MutableRefObject<SamplingInformationCacheRef | undefined>;
  initCachedSampleLocationsRef: (params: { periods?: GetSamplingPeriod[] }) => void;
  updateCachedSamplingSites: (sites: SamplingInformationCachedSite[]) => void;
  updateCachedMethodTechniques: (techniques: SamplingInformationCachedTechnique[]) => void;
  updateCachedSamplingPeriods: (periods: SamplingInformationCachedPeriod[]) => void;
  updateCachedSampleLocationsRef: (params: {
    selectedSites?: SamplingInformationCachedSite[];
    selectedTechniques?: SamplingInformationCachedTechnique[];
    selectedPeriods?: SamplingInformationCachedPeriod[];
  }) => void;
};

export const useSamplingInformationCache = (): SamplingInformationCache => {
  const cachedSampleLocationsRef = useRef<SamplingInformationCacheRef>();

  const initCachedSampleLocationsRef = (params: { periods?: GetSamplingPeriod[] }) => {
    if (!params.periods?.length) {
      return;
    }

    const sites = Array.from(
      new Map(
        params.periods.map((period) => [
          period.survey_sample_site.survey_sample_site_id,
          {
            survey_sample_site_id: period.survey_sample_site.survey_sample_site_id,
            // Satisfy the IAutocompleteDataGridOption interface
            value: period.survey_sample_site_id,
            label: period.survey_sample_site.name
          }
        ])
      ).values()
    );

    const techniques = Array.from(
      new Map(
        params.periods.map((period) => [
          period.method_technique.method_technique_id,
          {
            method_technique_id: period.method_technique.method_technique_id,
            survey_sample_site_id: period.survey_sample_site.survey_sample_site_id,
            method_response_metric_id: period.method_technique.method_response_metric_id,
            // Satisfy the IAutocompleteDataGridOption interface
            value: period.method_technique_id,
            label: period.method_technique.name
          }
        ])
      ).values()
    );

    const periods = Array.from(
      new Map(
        params.periods.map((period) => [
          period.survey_sample_period_id,
          {
            survey_sample_period_id: period.survey_sample_period_id,
            survey_sample_site_id: period.survey_sample_site.survey_sample_site_id,
            method_technique_id: period.method_technique.method_technique_id,
            // Satisfy the IAutocompleteDataGridOption interface
            value: period.survey_sample_period_id,
            label: getPeriodLabel(period)
          }
        ])
      ).values()
    );

    cachedSampleLocationsRef.current = {
      sites,
      techniques,
      periods
    };
  };

  const updateCachedSamplingSites = (sites: SamplingInformationCachedSite[]) => {
    if (!cachedSampleLocationsRef.current) {
      return;
    }

    const newSites = [];

    for (const site of sites ?? []) {
      if (
        cachedSampleLocationsRef.current.sites.findIndex(
          (item) => item.survey_sample_site_id === site.survey_sample_site_id
        ) !== -1
      ) {
        // The site is already in the cache
        continue;
      }

      newSites.push(site);
    }

    // Update the cache
    cachedSampleLocationsRef.current = {
      sites: [...cachedSampleLocationsRef.current.sites, ...newSites],
      techniques: cachedSampleLocationsRef.current.techniques,
      periods: cachedSampleLocationsRef.current.periods
    };
  };

  const updateCachedMethodTechniques = (techniques: SamplingInformationCachedTechnique[]) => {
    if (!cachedSampleLocationsRef.current) {
      return;
    }

    const newTechniques = [];

    for (const technique of techniques ?? []) {
      if (
        cachedSampleLocationsRef.current.techniques.findIndex(
          (item) => item.method_technique_id === technique.method_technique_id
        ) !== -1
      ) {
        // The technique is already in the cache
        continue;
      }

      newTechniques.push(technique);
    }

    // Update the cache
    cachedSampleLocationsRef.current = {
      sites: cachedSampleLocationsRef.current.sites,
      techniques: [...cachedSampleLocationsRef.current.techniques, ...newTechniques],
      periods: cachedSampleLocationsRef.current.periods
    };
  };

  const updateCachedSamplingPeriods = (periods: SamplingInformationCachedPeriod[]) => {
    if (!cachedSampleLocationsRef.current) {
      return;
    }

    const newPeriods = [];

    for (const period of periods ?? []) {
      if (
        cachedSampleLocationsRef.current.periods.findIndex(
          (item) => item.survey_sample_period_id === period.survey_sample_period_id
        ) !== -1
      ) {
        // The period is already in the cache
        continue;
      }

      newPeriods.push(period);
    }

    // Update the cache
    cachedSampleLocationsRef.current = {
      sites: cachedSampleLocationsRef.current.sites,
      techniques: cachedSampleLocationsRef.current.techniques,
      periods: [...cachedSampleLocationsRef.current.periods, ...newPeriods]
    };
  };

  const updateCachedSampleLocationsRef = (params: {
    selectedSites?: SamplingInformationCachedSite[];
    selectedTechniques?: SamplingInformationCachedTechnique[];
    selectedPeriods?: SamplingInformationCachedPeriod[];
  }) => {
    const { selectedSites, selectedTechniques, selectedPeriods } = params;

    if (!selectedSites?.length) {
      // If the selected sample site is null, nothing to add to the cache
      return;
    }

    if (!cachedSampleLocationsRef.current) {
      // Initialize the cache
      cachedSampleLocationsRef.current = {
        sites: selectedSites,
        techniques: [],
        periods: []
      };
    }

    const newSites = [];
    for (const site of selectedSites ?? []) {
      if (
        cachedSampleLocationsRef.current.sites.findIndex(
          (item) => item.survey_sample_site_id === site.survey_sample_site_id
        ) !== -1
      ) {
        // The site is already in the cache
        continue;
      }

      newSites.push(site);
    }

    const newTechniques = [];
    for (const technique of selectedTechniques ?? []) {
      if (
        cachedSampleLocationsRef.current.techniques.findIndex(
          (item) => item.method_technique_id === technique.method_technique_id
        ) !== -1
      ) {
        // The technique is already in the cache
        continue;
      }

      newTechniques.push(technique);
    }

    const newPeriods = [];
    for (const period of selectedPeriods ?? []) {
      if (
        cachedSampleLocationsRef.current.periods.findIndex(
          (item) => item.survey_sample_period_id === period.survey_sample_period_id
        ) !== -1
      ) {
        // The period is already in the cache
        continue;
      }

      newPeriods.push(period);
    }

    // Update the cache
    cachedSampleLocationsRef.current = {
      sites: [...cachedSampleLocationsRef.current.sites, ...newSites],
      techniques: [...cachedSampleLocationsRef.current.techniques, ...newTechniques],
      periods: [...cachedSampleLocationsRef.current.periods, ...newPeriods]
    };
  };

  return useMemo(
    () => ({
      cachedSampleLocationsRef,
      initCachedSampleLocationsRef,
      updateCachedSamplingSites,
      updateCachedMethodTechniques,
      updateCachedSamplingPeriods,
      updateCachedSampleLocationsRef
    }),
    []
  );
};
