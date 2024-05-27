import Box from '@mui/system/Box';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { Feature } from 'geojson';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';

interface IAnimalCapturesMapProps {
  captures: ICaptureResponse[];
  isLoading: boolean;
}

/**
 * Wrapper around the Survey Map component for displaying the selected animal's captures on the map
 *
 * @param {IAnimalCapturesMapProps} props
 * @return {*}
 */
export const AnimalCapturesMap = (props: IAnimalCapturesMapProps) => {
  const { captures, isLoading } = props;

  const captureMapFeatures = captures.map((capture) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [capture.capture_location.longitude, capture.capture_location.latitude] },
    properties: { captureId: capture.capture_id, date: capture.capture_timestamp }
  })) as Feature[];

  const staticLayers: IStaticLayer[] = captureMapFeatures.map((feature, index) => ({
    layerName: 'Captures',
    popupRecordTitle: 'Capture Location',
    features: [
      {
        key: `${feature.geometry}-${index}`,
        geoJSON: feature
      }
    ]
  }));

  return (
    <Box height={{ sm: 250, md: 400 }} position="relative">
      <SurveyMap isLoading={isLoading} staticLayers={staticLayers} supplementaryLayers={[]} />
    </Box>
  );
};
