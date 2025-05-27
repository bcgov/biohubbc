import { useCallback } from 'react';
import useDataLoader from './useDataLoader';
import { useBiohubApi } from './useBioHubApi';
import { useAuthStateContext } from './useAuthStateContext';

/**
 * Custom hook to load all surveys (no filtering).
 */
export const useAllSurveys = () => {
  const biohubApi = useBiohubApi();
  const { simsUserWrapper } = useAuthStateContext();
  // Only load surveys where the user is a coordinator
  const surveysDataLoader = useDataLoader(() =>
    biohubApi.survey.findSurveys(undefined, { system_user_id: simsUserWrapper.systemUserId })
  );

  // Optionally, provide a reload function
  const reload = useCallback(() => {
    surveysDataLoader.load();
  }, [surveysDataLoader]);

  return {
    surveysDataLoader,
    reload
  };
};
