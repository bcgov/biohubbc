import Box from '@mui/system/Box';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { Feature } from 'geojson';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import { isDefined } from 'utils/Utils';

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

  // Only include captures with valid locations
  const captureMapFeatures: Feature[] = captures
    .filter(
      (capture) => isDefined(capture.capture_location?.latitude) && isDefined(capture.capture_location?.longitude)
    )
    .map(
      (capture) =>
        capture?.capture_location
          ? ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [capture.capture_location.longitude, capture.capture_location.latitude]
              },
              properties: { captureId: capture.capture_id, date: capture.capture_date }
            } as Feature)
          : null // Return null instead of undefined
    )
    .filter((feature): feature is Feature => isDefined(feature));

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
