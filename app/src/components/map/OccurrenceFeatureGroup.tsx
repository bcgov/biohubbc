import { useBiohubApi } from 'hooks/useBioHubApi';
import useIsMounted from 'hooks/useIsMounted';
import { IGetOccurrencesForViewResponseDetails } from 'interfaces/useObservationApi.interface';
import React, { useEffect, useState } from 'react';
import { FeatureGroup, GeoJSON } from 'react-leaflet';
import { OccurrenceFeaturePopup } from './OccurrenceFeaturePopup';

interface IOccurrenceFeatureGroupProps {
  occurrenceSubmissionId: number;
}

/**
 * Used to render a layer with occurrence features.
 * @param {*} props
 * @return {*}
 */
const OccurrenceFeatureGroup: React.FC<IOccurrenceFeatureGroupProps> = (props) => {
  const biohubApi = useBiohubApi();
  const isMounted = useIsMounted();

  const [occurrences, setOccurrences] = useState<IGetOccurrencesForViewResponseDetails[]>([]);

  const getOccurrences = async () => {
    const occurrencesResponse = await biohubApi.observation.getOccurrencesForView(props.occurrenceSubmissionId);

    if (!occurrencesResponse) {
      // Handle error
    }

    setOccurrences(occurrencesResponse);
  };

  useEffect(() => {
    if (!isMounted()) {
      return;
    }

    getOccurrences();
  }, []);

  return (
    <FeatureGroup>
      {occurrences &&
        occurrences?.map((occurrence) => {
          const { geometry, ...featureData } = occurrence;

          return (
            <GeoJSON data={occurrence.geometry} key={`feature`}>
              <OccurrenceFeaturePopup featureData={featureData} />
            </GeoJSON>
          );
        })}
    </FeatureGroup>
  );
};

export default OccurrenceFeatureGroup;
