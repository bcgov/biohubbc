import { useBiohubApi } from 'hooks/useBioHubApi';
import useIsMounted from 'hooks/useIsMounted';
import React, { useEffect } from 'react';
import { FeatureGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

interface IOccurrenceFeatureGroupProps {
  projectId: number;
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

  const getOccurrences = async () => {
    const occurrencesResponse = await biohubApi.dwca.getOccurrencesForView(
      props.projectId,
      props.occurrenceSubmissionId
    );

    if (!occurrencesResponse || !occurrencesResponse.length) {
      // TODO: Handle error
      return;
    }
  };

  useEffect(() => {
    if (!isMounted()) {
      return;
    }

    getOccurrences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markersToRender: React.ReactNode[] = [];

  return (
    <FeatureGroup>
      <MarkerClusterGroup chunkedLoading>{markersToRender}</MarkerClusterGroup>
    </FeatureGroup>
  );
};

export default OccurrenceFeatureGroup;
