import { CircularProgress } from '@mui/material';
import Box from '@mui/system/Box';
import SurveyMap, { ISurveyMapPointMetadata } from 'features/surveys/view/SurveyMap';
import { Feature } from 'geojson';
import { useAnimalPageContext } from 'hooks/useContext';

const AnimalCapturesMap = () => {
  const { critterDataLoader } = useAnimalPageContext();

  if (critterDataLoader.isLoading || !critterDataLoader.data) {
    return <CircularProgress size={40} />;
  }

  //   const captureMapFeatures = critterDataLoader.data.captures.map((capture) => ({
  //     type: 'Feature',
  //     geometry: { type: 'Point', coordinates: [capture.capture_location.longitude, capture.capture_location.latitude] },
  //     properties: { captureId: capture.capture_id }
  //   })) as Feature[];

  const captureMapFeatures = [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-120.4, 51.3] },
      properties: { captureId: 1 }
    }
  ] as Feature[];

  const supplementaryLayers = captureMapFeatures.map((feature, index) => ({
    layerName: 'Captures',
    popupRecordTitle: 'Capture Location',
    mapPoints: [
      {
        key: `${feature.id}-${index}`,
        feature: feature,
        onLoadMetadata: async (): Promise<ISurveyMapPointMetadata[]> => {
          return Promise.resolve([{ label: 'Capture ID', value: String(feature.properties?.captureId) }]);
        }
      }
    ]
  }));

  return (
    <Box height={{ sm: 300, md: 500 }} position="relative">
      <SurveyMap isLoading={critterDataLoader.isLoading} staticLayers={[]} supplementaryLayers={supplementaryLayers} />
    </Box>
  );
};

export default AnimalCapturesMap;
