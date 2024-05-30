import Box from '@mui/system/Box';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { Feature } from 'geojson';
import { IMortalityResponse } from 'interfaces/useCritterApi.interface';
import { isDefined } from 'utils/Utils';

interface IAnimalMortalityMapProps {
  mortality: IMortalityResponse[];
  isLoading: boolean;
}

/**
 * Wrapper around the Survey Map component for displaying the selected animal's mortality on the map
 *
 * @param {IAnimalMortalityMapProps} props
 * @return {*}
 */
export const AnimalMortalityMap = (props: IAnimalMortalityMapProps) => {
  const { mortality, isLoading } = props;

  const mortalityMapFeatures = mortality
    .filter((mortality) => isDefined(mortality.location?.latitude) && isDefined(mortality.location.longitude))
    .map((mortality) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [mortality.location.longitude, mortality.location.latitude]
      },
      properties: { mortalityId: mortality.mortality_id, date: mortality.mortality_timestamp }
    })) as Feature[];

  const staticLayers: IStaticLayer[] = mortalityMapFeatures.map((feature, index) => ({
    layerName: 'Mortality',
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
