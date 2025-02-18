import { renderHook } from '@testing-library/react';
import { useSamplingInformationCache } from 'features/surveys/observations/observations-table/grid-column-definitions/sampling-information/useSamplingInformationCache';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';

// All combinations of period records
const mockBasicPeriods: GetSamplingPeriod[] = [
  {
    // all data is not null
    survey_sample_period_id: 31,
    survey_id: 1,
    survey_sample_site_id: 11,
    method_technique_id: 21,
    start_date: '2021-01-01',
    start_time: '08:00:00',
    end_date: '2022-01-01',
    end_time: '12:00:00',
    survey_sample_site: {
      survey_sample_site_id: 11,
      name: 'Site 1'
    },
    method_technique: {
      method_technique_id: 21,
      name: 'Technique 1',
      description: 'Description 1',
      method_response_metric_id: 41
    }
  },
  {
    // method technique data is null
    survey_sample_period_id: 32,
    survey_id: 1,
    survey_sample_site_id: 11,
    method_technique_id: null,
    start_date: '2021-01-01',
    start_time: '08:00:00',
    end_date: '2022-01-01',
    end_time: '12:00:00',
    survey_sample_site: {
      survey_sample_site_id: 11,
      name: 'Site 1'
    },
    method_technique: null
  },
  {
    // sample site data is null
    survey_sample_period_id: 33,
    survey_id: 1,
    survey_sample_site_id: null,
    method_technique_id: 21,
    start_date: '2021-01-01',
    start_time: '08:00:00',
    end_date: '2022-01-01',
    end_time: '12:00:00',
    survey_sample_site: null,
    method_technique: {
      method_technique_id: 21,
      name: 'Technique 1',
      description: 'Description 1',
      method_response_metric_id: 41
    }
  },
  {
    // period data is null
    survey_sample_period_id: 34,
    survey_id: 1,
    survey_sample_site_id: null,
    method_technique_id: 21,
    start_date: null,
    start_time: null,
    end_date: null,
    end_time: null,
    survey_sample_site: null,
    method_technique: {
      method_technique_id: 21,
      name: 'Technique 1',
      description: 'Description 1',
      method_response_metric_id: 41
    }
  },
  {
    // sample site and period data is null
    survey_sample_period_id: 35,
    survey_id: 1,
    survey_sample_site_id: null,
    method_technique_id: 21,
    start_date: null,
    start_time: null,
    end_date: null,
    end_time: null,
    survey_sample_site: null,
    method_technique: {
      method_technique_id: 21,
      name: 'Technique 1',
      description: 'Description 1',
      method_response_metric_id: 41
    }
  },
  {
    // method technique and period data is null
    survey_sample_period_id: 36,
    survey_id: 1,
    survey_sample_site_id: 11,
    method_technique_id: null,
    start_date: '2021-01-01',
    start_time: '08:00:00',
    end_date: '2022-01-01',
    end_time: '12:00:00',
    survey_sample_site: {
      survey_sample_site_id: 11,
      name: 'Site 1'
    },
    method_technique: null
  },
  {
    // sample site and method technique data is null
    survey_sample_period_id: 37,
    survey_id: 1,
    survey_sample_site_id: null,
    method_technique_id: null,
    start_date: '2021-01-01',
    start_time: '08:00:00',
    end_date: '2022-01-01',
    end_time: '12:00:00',
    survey_sample_site: null,
    method_technique: null
  }
];

describe('useSamplingInformationCache', () => {
  describe('useSamplingInformationCache', () => {
    it('initialized with undefined ref', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current).toBeUndefined();
    });
  });

  describe('initCachedSamplingInformationRef', () => {
    it('initializes empty when no periods provided', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: [] });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current).toEqual({
        sites: {},
        techniqueIndex: {},
        techniques: {},
        periodIndex: {},
        periods: {}
      });
    });

    it('initializes the provided periods', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.sites).toEqual({
        11: {
          survey_sample_site_id: 11,
          label: 'Site 1',
          value: 11
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniqueIndex).toEqual({
        '11': new Set([21])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniques).toEqual({
        21: {
          method_technique_id: 21,
          method_response_metric_id: 41,
          label: 'Technique 1',
          value: 21
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periodIndex).toEqual({
        '11-21': new Set([31])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periods).toEqual({
        31: {
          survey_sample_period_id: 31,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 31
        },
        32: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 32,
          value: 32
        },
        33: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 33,
          value: 33
        },
        36: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 36,
          value: 36
        },
        37: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 37,
          value: 37
        }
      });
    });
  });

  describe('updateCachedSamplingSites', () => {
    it('adds new sites', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      // Assert the initial state
      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.sites).toEqual({
        11: {
          survey_sample_site_id: 11,
          label: 'Site 1',
          value: 11
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniqueIndex).toEqual({
        '11': new Set([21])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniques).toEqual({
        21: {
          method_technique_id: 21,
          method_response_metric_id: 41,
          label: 'Technique 1',
          value: 21
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periodIndex).toEqual({
        '11-21': new Set([31])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periods).toEqual({
        31: {
          survey_sample_period_id: 31,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 31
        },
        32: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 32,
          value: 32
        },
        33: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 33,
          value: 33
        },
        36: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 36,
          value: 36
        },
        37: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 37,
          value: 37
        }
      });

      samplingInformationCache.current.updateCachedSamplingSites([
        // New
        {
          survey_sample_site_id: 120,
          label: 'Site 2',
          value: 120
        },
        // New
        {
          survey_sample_site_id: 130,
          label: 'Site 3',
          value: 130
        },
        // Existing
        {
          survey_sample_site_id: 11,
          label: 'Site 1',
          value: 11
        }
      ]);

      // Assert updated state
      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.sites).toEqual({
        // Existing
        11: {
          survey_sample_site_id: 11,
          label: 'Site 1',
          value: 11
        },
        // New
        120: {
          survey_sample_site_id: 120,
          label: 'Site 2',
          value: 120
        },
        // New
        130: {
          survey_sample_site_id: 130,
          label: 'Site 3',
          value: 130
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniqueIndex).toEqual({
        '11': new Set([21])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniques).toEqual({
        21: {
          method_technique_id: 21,
          method_response_metric_id: 41,
          label: 'Technique 1',
          value: 21
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periodIndex).toEqual({
        '11-21': new Set([31])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periods).toEqual({
        31: {
          survey_sample_period_id: 31,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 31
        },
        32: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 32,
          value: 32
        },
        33: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 33,
          value: 33
        },
        36: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 36,
          value: 36
        },
        37: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 37,
          value: 37
        }
      });
    });
  });

  describe('updateCachedMethodTechniques', () => {
    it('adds new techniques', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      // Assert the initial state
      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.sites).toEqual({
        11: {
          survey_sample_site_id: 11,
          label: 'Site 1',
          value: 11
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniqueIndex).toEqual({
        '11': new Set([21])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniques).toEqual({
        21: {
          method_technique_id: 21,
          method_response_metric_id: 41,
          label: 'Technique 1',
          value: 21
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periodIndex).toEqual({
        '11-21': new Set([31])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periods).toEqual({
        31: {
          survey_sample_period_id: 31,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 31
        },
        32: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 32,
          value: 32
        },
        33: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 33,
          value: 33
        },
        36: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 36,
          value: 36
        },
        37: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 37,
          value: 37
        }
      });

      samplingInformationCache.current.updateCachedMethodTechniques([
        // Existing
        {
          method_technique_id: 21,
          method_response_metric_id: 41,
          survey_sample_site_id: 11,
          label: 'Technique 1',
          value: 21
        },
        // New (for existing site)
        {
          method_technique_id: 240,
          method_response_metric_id: 44,
          survey_sample_site_id: 11,
          label: 'Technique 4',
          value: 240
        },
        // New (for new site)
        {
          method_technique_id: 250,
          method_response_metric_id: 45,
          survey_sample_site_id: 140,
          label: 'Technique 5',
          value: 250
        }
      ]);

      // Assert updated state
      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.sites).toEqual({
        11: {
          survey_sample_site_id: 11,
          label: 'Site 1',
          value: 11
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniqueIndex).toEqual({
        // Existing + New (for existing site)
        '11': new Set([21, 240]),
        // New (for new site)
        '140': new Set([250])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniques).toEqual({
        // Existing
        21: {
          method_technique_id: 21,
          method_response_metric_id: 41,
          label: 'Technique 1',
          value: 21
        },
        // New (for existing site)
        240: {
          method_technique_id: 240,
          method_response_metric_id: 44,
          label: 'Technique 4',
          value: 240
        },
        // New (for new site)
        250: {
          method_technique_id: 250,
          method_response_metric_id: 45,
          label: 'Technique 5',
          value: 250
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periodIndex).toEqual({
        '11-21': new Set([31])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periods).toEqual({
        31: {
          survey_sample_period_id: 31,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 31
        },
        32: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 32,
          value: 32
        },
        33: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 33,
          value: 33
        },
        36: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 36,
          value: 36
        },
        37: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 37,
          value: 37
        }
      });
    });
  });

  describe('updateCachedSamplingPeriods', () => {
    it('adds new periods', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      // Assert the initial state
      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.sites).toEqual({
        11: {
          survey_sample_site_id: 11,
          label: 'Site 1',
          value: 11
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniqueIndex).toEqual({
        '11': new Set([21])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniques).toEqual({
        21: {
          method_technique_id: 21,
          method_response_metric_id: 41,
          label: 'Technique 1',
          value: 21
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periodIndex).toEqual({
        '11-21': new Set([31])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periods).toEqual({
        31: {
          survey_sample_period_id: 31,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 31
        },
        32: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 32,
          value: 32
        },
        33: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 33,
          value: 33
        },
        36: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 36,
          value: 36
        },
        37: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 37,
          value: 37
        }
      });

      samplingInformationCache.current.updateCachedSamplingPeriods([
        {
          // Existing
          survey_sample_period_id: 31,
          survey_sample_site_id: 11,
          method_technique_id: 21,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 31
        },
        {
          // New (for existing site and technique)
          survey_sample_period_id: 340,
          survey_sample_site_id: 11,
          method_technique_id: 21,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 340
        },
        {
          // New (for existing site and new technique)
          survey_sample_period_id: 350,
          survey_sample_site_id: 11,
          method_technique_id: 240,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 350
        },
        {
          // New (for new site and existing technique)
          survey_sample_period_id: 360,
          survey_sample_site_id: 140,
          method_technique_id: 210,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 360
        },
        {
          // New (for new site and new technique)
          survey_sample_period_id: 370,
          survey_sample_site_id: 150,
          method_technique_id: 25,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 370
        }
      ]);

      // Assert updated state
      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.sites).toEqual({
        11: {
          survey_sample_site_id: 11,
          label: 'Site 1',
          value: 11
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniqueIndex).toEqual({
        '11': new Set([21])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.techniques).toEqual({
        21: {
          method_technique_id: 21,
          method_response_metric_id: 41,
          label: 'Technique 1',
          value: 21
        }
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periodIndex).toEqual({
        // Existing + New (for existing site and technique)
        '11-21': new Set([31, 340]),
        // New (for existing site and new technique)
        '11-240': new Set([350]),
        // New (for new site and existing technique)
        '140-210': new Set([360]),
        // New (for new site and new technique)
        '150-25': new Set([370])
      });

      expect(samplingInformationCache.current.cachedSamplingInformationRef.current?.periods).toEqual({
        // Existing
        31: {
          survey_sample_period_id: 31,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 31
        },
        32: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 32,
          value: 32
        },
        33: {
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          survey_sample_period_id: 33,
          value: 33
        },
        // New (for existing site and technique)
        340: {
          survey_sample_period_id: 340,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 340
        },
        // New (for existing site and new technique)
        350: {
          survey_sample_period_id: 350,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 350
        },
        36: {
          survey_sample_period_id: 36,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 36
        },
        // New (for new site and existing technique)
        360: {
          survey_sample_period_id: 360,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 360
        },
        37: {
          survey_sample_period_id: 37,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 37
        },
        // New (for new site and new technique)
        370: {
          survey_sample_period_id: 370,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 370
        }
      });
    });
  });

  describe('getCurrentSite', () => {
    it('returns an existing site', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      const response = samplingInformationCache.current.getCurrentSite(11);

      expect(response).toEqual({
        survey_sample_site_id: 11,
        label: 'Site 1',
        value: 11
      });
    });

    it('returns null if the site does not exist', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      const response = samplingInformationCache.current.getCurrentSite(999);

      expect(response).toBeNull();
    });
  });

  describe('getCurrentTechnique', () => {
    it('returns an existing technique', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      const response = samplingInformationCache.current.getCurrentTechnique(21);

      expect(response).toEqual({
        method_technique_id: 21,
        method_response_metric_id: 41,
        label: 'Technique 1',
        value: 21
      });
    });

    it('returns null if the technique does not exist', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      const response = samplingInformationCache.current.getCurrentTechnique(999);

      expect(response).toBeNull();
    });
  });

  describe('getCurrentPeriod', () => {
    it('returns an existing period', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      const response = samplingInformationCache.current.getCurrentPeriod(31);

      expect(response).toEqual({
        survey_sample_period_id: 31,
        label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
        value: 31
      });
    });

    it('returns null if the period does not exist', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      const response = samplingInformationCache.current.getCurrentPeriod(999);

      expect(response).toBeNull();
    });
  });

  describe('getTechniquesForRow', () => {
    it('returns an array of matching techniques', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      const response = samplingInformationCache.current.getTechniquesForRow(11);

      expect(response).toEqual([
        {
          method_technique_id: 21,
          method_response_metric_id: 41,
          label: 'Technique 1',
          value: 21
        }
      ]);
    });

    it('returns an empty array if no techniques match', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      const response = samplingInformationCache.current.getTechniquesForRow(999);

      expect(response).toEqual([]);
    });
  });

  describe('getPeriodsForRow', () => {
    it('returns an array of matching periods', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      const response = samplingInformationCache.current.getPeriodsForRow(11, 21);

      expect(response).toEqual([
        {
          survey_sample_period_id: 31,
          label: '2021-01-01 08:00:00 - 2022-01-01 12:00:00',
          value: 31
        }
      ]);
    });

    it('returns an empty array if no periods match', () => {
      const { result: samplingInformationCache } = renderHook(() => useSamplingInformationCache());

      samplingInformationCache.current.initCachedSamplingInformationRef({ periods: mockBasicPeriods });

      const response = samplingInformationCache.current.getPeriodsForRow(999, 999);

      expect(response).toEqual([]);
    });
  });
});
