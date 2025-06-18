import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useMemo } from 'react';
import { Popup } from 'react-leaflet';
import { isDefined } from 'utils/Utils';

interface ISurveySpatialAnimalMortalityPopupProps {
  mortalityId: string;
}

/**
 * Returns information about a critter mortality record, shown when a mortality point is clicked on the map
 *
 * @param {ISurveySpatialAnimalMortalityPopupProps} props
 * @returns {*}
 */
export const SurveySpatialAnimalMortalityPopup = (props: ISurveySpatialAnimalMortalityPopupProps) => {
  const { mortalityId } = props;

  const critterbaseApi = useCritterbaseApi();

  const mortalityDataLoader = useDataLoader(critterbaseApi.mortality.getMortality);
  const animalDataLoader = useDataLoader(critterbaseApi.critters.getCritterSimple);

  const popupMetadata = useMemo(() => {
    if (!mortalityDataLoader.data || !animalDataLoader.data) {
      return [];
    }

    const { mortality_timestamp, location } = mortalityDataLoader.data;
    const { animal_id } = animalDataLoader.data;

    return [
      { label: 'Nickname', value: animal_id },
      {
        label: 'Location',
        value: [location?.latitude, location?.longitude]
          .filter((coord): coord is number => isDefined(coord))
          .map((coord) => coord.toFixed(6))
          .join(', ')
      },
      {
        label: 'Date',
        value: dayjs(mortality_timestamp).format(DATE_FORMAT.MediumDateTimeFormat)
      }
    ];
  }, [mortalityDataLoader.data, animalDataLoader.data]);

  return (
    <Popup
      keepInView={false}
      closeButton={true}
      autoPan={true}
      eventHandlers={{
        add: async () => {
          const mortality = await mortalityDataLoader.load(mortalityId);
          if (mortality) {
            animalDataLoader.load(mortality.critter_id);
          }
        }
      }}>
      <SurveyMapPopup
        isLoading={mortalityDataLoader.isLoading || animalDataLoader.isLoading}
        title="Mortality Details"
        metadata={popupMetadata}
        key={`mortality-feature-popup-${mortalityId}`}
      />
    </Popup>
  );
};
