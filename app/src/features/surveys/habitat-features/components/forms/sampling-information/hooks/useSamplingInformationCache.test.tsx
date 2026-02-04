import { renderHook } from '@testing-library/react';
import { useSamplingInformationCache } from 'features/surveys/habitat-features/components/forms/sampling-information/hooks/useSamplingInformationCache';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';

const mockPeriod: GetSamplingPeriod = {
  survey_sample_period_id: 1,
  survey_id: 1,
  survey_sample_site_id: 10,
  method_technique_id: 20,
  start_date: '2024-01-01',
  start_time: '08:00:00',
  end_date: '2024-01-02',
  end_time: '17:00:00',
  survey_sample_site: { survey_sample_site_id: 10, name: 'Site A' },
  method_technique: {
    method_technique_id: 20,
    name: 'Technique A',
    description: null,
    method_response_metric_id: 1
  }
};

describe('useSamplingInformationCache', () => {
  describe('reference stability', () => {
    it('returns the same object reference across re-renders', () => {
      const { result, rerender } = renderHook(() => useSamplingInformationCache());

      const first = result.current;
      expect(first).toBeDefined();

      rerender();
      const second = result.current;
      rerender();
      const third = result.current;

      expect(second).toBe(first);
      expect(third).toBe(first);
    });

    it('returns the same function references across re-renders', () => {
      const { result, rerender } = renderHook(() => useSamplingInformationCache());

      const init1 = result.current.initCachedSamplingInformationRef;
      const getPeriod1 = result.current.getCurrentPeriod;

      rerender();
      const init2 = result.current.initCachedSamplingInformationRef;
      const getPeriod2 = result.current.getCurrentPeriod;

      expect(init2).toBe(init1);
      expect(getPeriod2).toBe(getPeriod1);
    });
  });

  describe('behavior', () => {
    it('initializes cache and getCurrentPeriod returns expected label', () => {
      const { result } = renderHook(() => useSamplingInformationCache());

      result.current.initCachedSamplingInformationRef({ periods: [mockPeriod] });

      const period = result.current.getCurrentPeriod(1);
      expect(period).not.toBeNull();
      expect(period?.survey_sample_period_id).toBe(1);
      expect(period?.label).toBeDefined();
    });
  });
});
