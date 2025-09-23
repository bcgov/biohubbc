import { useEffect, useMemo } from 'react';
import { useBiohubApi } from './useBioHubApi';
import { useSurveyContext } from './useContext';
import useDataLoader from './useDataLoader';

/**
 * Hook to get combined TSNs of focal or observed species,
 * and their parent taxa TSNs.
 *
 * @returns An array:
 *   - First element: Array of TSNs for focal and observed species.
 *   - Second element: Array of TSNs including focal/observed species and their parent taxa.
 */
export const useFocalOrObservedSpeciesTsns = () => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  const observedSpeciesDataLoader = useDataLoader(() =>
    biohubApi.observation.getObservedSpecies(surveyContext.surveyId)
  );

  const hierarchyDataLoader = useDataLoader((tsns: number[]) => biohubApi.taxonomy.getTaxonHierarchyByTSNs(tsns));

  // Load observed species when component mounts
  useEffect(() => {
    observedSpeciesDataLoader.load();
  }, [observedSpeciesDataLoader]);

  // Combine focal species and observed species TSNs into a single array
  const focalSpeciesTsns = useMemo(
    () => surveyContext.surveyDataLoader.data?.surveyData.species.focal_species.map((species) => species.tsn) ?? [],
    [surveyContext.surveyDataLoader.data?.surveyData.species.focal_species]
  );

  const observedSpeciesTsns = useMemo(
    () => observedSpeciesDataLoader.data?.map((species) => species.tsn) ?? [],
    [observedSpeciesDataLoader.data]
  );

  const observedAndFocalSpeciesTsns = useMemo(
    () => [...focalSpeciesTsns, ...observedSpeciesTsns],
    [focalSpeciesTsns, observedSpeciesTsns]
  );

  // Fetch parent taxa hierarchy for combined species TSNs
  useEffect(() => {
    if (observedAndFocalSpeciesTsns.length && observedSpeciesDataLoader.data) {
      hierarchyDataLoader.load(observedAndFocalSpeciesTsns);
    }
  }, [observedAndFocalSpeciesTsns, hierarchyDataLoader, observedSpeciesDataLoader]);

  // Combine TSNs of focal/observed species with their parent taxa
  const allSpeciesWithParentsTsns = [
    ...observedAndFocalSpeciesTsns,
    ...(hierarchyDataLoader.data?.flatMap((taxon) => taxon.hierarchy) ?? [])
  ];

  // Return both observed/focal species TSNs and all species with parent taxa TSNs
  return [observedAndFocalSpeciesTsns, allSpeciesWithParentsTsns];
};
