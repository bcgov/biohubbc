import { IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';
import { useRef } from 'react';

export type SampleLocationCache = {
  locations: IGetSampleLocationNonSpatialDetails[];
};

export const useSampleLocationsCache = () => {
  const cachedSampleLocationsRef = useRef<SampleLocationCache>();

  const updateCachedSampleLocationsRef = (selectedSampleSites: IGetSampleLocationNonSpatialDetails[]) => {
    if (!selectedSampleSites?.length) {
      // If the selected sample site is null, nothing to add to the cache
      return;
    }

    if (!cachedSampleLocationsRef.current) {
      // Initialize the cache
      cachedSampleLocationsRef.current = {
        locations: selectedSampleSites
      };
    }

    const newSites = [];

    for (const site of selectedSampleSites) {
      if (
        cachedSampleLocationsRef.current.locations.findIndex(
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
      locations: [...cachedSampleLocationsRef.current.locations, ...newSites]
    };
  };

  return {
    cachedSampleLocationsRef,
    updateCachedSampleLocationsRef
  };
};
