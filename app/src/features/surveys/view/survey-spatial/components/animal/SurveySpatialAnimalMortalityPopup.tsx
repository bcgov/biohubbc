import { IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { IMortalityResponse } from 'interfaces/useCritterApi.interface';
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

  const mortalityDataLoader = useDataLoader((mortalityId) => critterbaseApi.mortality.getMortality(mortalityId));

  const getMortalityMetadata = (mortality: IMortalityResponse) => {
    return [
      { label: 'Mortality ID', value: String(mortality.mortality_id) },
      { label: 'Date', value: String(mortality.mortality_timestamp) },
      {
        label: 'Coords',
        value: [mortality.location?.latitude ?? null, mortality.location?.longitude ?? null]
          .filter((coord): coord is number => coord !== null)
          .map((coord) => coord.toFixed(6))
          .join(', ')
      }
    ];
  };

  return (
    <Popup
      keepInView={false}
      closeButton={true}
      autoPan={true}
      eventHandlers={{
        add: () => {
          mortalityDataLoader.load(String(feature.id));
        },
        remove: () => {
          mortalityDataLoader.clearData();
        }
      }}>
      <SurveyMapPopup
        isLoading={mortalityDataLoader.isLoading || !mortalityDataLoader.isReady}
        title="Observation"
        metadata={mortalityDataLoader.data ? getMortalityMetadata(mortalityDataLoader.data) : []}
        key={`mortality-feature-popup-${feature.id}`}
      />
    </Popup>
  );
};
