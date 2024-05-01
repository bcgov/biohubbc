import { CircularProgress } from '@mui/material';
import Box from '@mui/system/Box';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { Feature } from 'geojson';
import { useAnimalPageContext } from 'hooks/useContext';

/**
 * Wrapper around the Survey Map component for displaying the selected animal's captures on the map
 *
 * @returns
 */
const AnimalCapturesMap = () => {
  const { critterDataLoader } = useAnimalPageContext();

  if (critterDataLoader.isLoading || !critterDataLoader.data) {
    return <CircularProgress size={40} />;
  }

  const captureMapFeatures = critterDataLoader.data.captures.map((capture) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [capture.capture_location.longitude, capture.capture_location.latitude] },
    properties: { captureId: capture.capture_id, date: capture.capture_timestamp }
  })) as Feature[];

  const staticLayers: IStaticLayer[] = captureMapFeatures.map((feature, index) => ({
    layerName: 'Captures',
    popupRecordTitle: 'Capture Location',
    features: [
      {
        key: `${feature.id}-${index}`,
        geoJSON: feature
      }
    ]
  }));

  return (
    <Box height={{ sm: 300, md: 500 }} position="relative">
      <SurveyMap isLoading={critterDataLoader.isLoading} staticLayers={staticLayers} supplementaryLayers={[]} />
    </Box>
  );
};

export default AnimalCapturesMap;
