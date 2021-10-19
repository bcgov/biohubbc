import { Point } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useIsMounted from 'hooks/useIsMounted';
import { IGetOccurrencesForViewResponseDetails } from 'interfaces/useObservationApi.interface';
import React, { useEffect, useState } from 'react';
import { FeatureGroup, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
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

    if (!occurrencesResponse || !occurrencesResponse.length) {
      // TODO: Handle error
      return;
    }

    setOccurrences(occurrencesResponse);
  };

  useEffect(() => {
    if (!isMounted()) {
      return;
    }

    getOccurrences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter out any occurrences with no geometry (as they can't be rendered on the map)
  const occurrencesToRender = (occurrences && occurrences.filter((occurrence) => occurrence.geometry)) || [];

  return (
    <FeatureGroup>
      <MarkerClusterGroup chunkedLoading>
        {occurrencesToRender.map((occurrence: IGetOccurrencesForViewResponseDetails) => {
          const { geometry, ...featureData } = occurrence;

          return (
            <Marker
              key={occurrence.occurrenceId}
              position={[(geometry!.geometry as Point).coordinates[1], (geometry!.geometry as Point).coordinates[0]]}>
              <OccurrenceFeaturePopup featureData={featureData} />
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </FeatureGroup>
  );
};

export default OccurrenceFeatureGroup;
