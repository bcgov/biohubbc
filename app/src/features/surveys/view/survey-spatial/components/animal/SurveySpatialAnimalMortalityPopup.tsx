import { IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICritterDetailedResponse, IMortalityResponse } from 'interfaces/useCritterApi.interface';
import { Popup } from 'react-leaflet';

export interface ISurveySpatialAnimalMortalityPopupProps {
  feature: IStaticLayerFeature;
}

/**
 * Renders a popup for animal mortality data on the map.
 *
 * @param {ISurveySpatialAnimalMortalityPopupProps} props
 * @return {*}
 */
export const SurveySpatialAnimalMortalityPopup = (props: ISurveySpatialAnimalMortalityPopupProps) => {
  const { feature } = props;

  const critterbaseApi = useCritterbaseApi();

  // Data loader for mortality details
  const mortalityDataLoader = useDataLoader((mortalityId) => critterbaseApi.mortality.getMortality(mortalityId));

  // Data loader for animal details
  const animalDataLoader = useDataLoader(async (critterId: string) => {
    const animalData: ICritterDetailedResponse = await critterbaseApi.critters.getDetailedCritter(critterId);
    return animalData;
  });

  // Combine mortality and animal data into metadata for the popup
  const getMortalityMetadata = (mortality: IMortalityResponse, animal?: ICritterDetailedResponse) => {
    const metadata = [
      { label: 'Nickname', value: animal?.animal_id ?? 'Loading...' },
      { label: 'Date', value: dayjs(mortality.mortality_timestamp).format(DATE_FORMAT.LongDateTimeFormat) },
      {
        label: 'Coordinates',
        value: [mortality.location?.latitude ?? null, mortality.location?.longitude ?? null]
          .filter((coord): coord is number => coord !== null)
          .map((coord) => coord.toFixed(6))
          .join(', ')
      }
    ];

    return metadata;
  };

  return (
    <Popup
      keepInView={false}
      closeButton={true}
      autoPan={true}
      eventHandlers={{
        add: () => {
          // Load mortality data and subsequently load animal data using critter_id
          mortalityDataLoader.load(String(feature.id)).then((mortality) => {
            if (mortality?.critter_id) {
              animalDataLoader.load(mortality.critter_id);
            }
          });
        }
      }}>
      <SurveyMapPopup
        isLoading={mortalityDataLoader.isLoading || !mortalityDataLoader.isReady || animalDataLoader.isLoading}
        title="Mortality Details"
        metadata={mortalityDataLoader.data ? getMortalityMetadata(mortalityDataLoader.data, animalDataLoader.data) : []}
        key={`mortality-feature-popup-${feature.id}`}
      />
    </Popup>
  );
};
