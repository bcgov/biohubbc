import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { Popup } from 'react-leaflet';

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

  const formatPopupMetadata = () => {
    if (!mortalityDataLoader.data || !animalDataLoader.data) return [];

    const { mortality_timestamp, location } = mortalityDataLoader.data;
    const { animal_id } = animalDataLoader.data;

    return [
      { label: 'Nickname', value: animal_id },
      {
        label: 'Date',
        // Critterbase does not provide time as its own string so mortalities without time data will erroneously show 12:00 AM in the popup
        value: dayjs(mortality_timestamp).format(DATE_FORMAT.MediumDateTimeFormat)
      },
      {
        label: 'Coordinates',
        value: [location?.latitude, location?.longitude]
          .filter(Boolean)
          .map((coord) => coord!.toFixed(6))
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
        add: async () => {
          const mortality = await mortalityDataLoader.load(mortalityId);
          if (mortality) animalDataLoader.load(mortality.critter_id);
        }
      }}>
      <SurveyMapPopup
        isLoading={mortalityDataLoader.isLoading || animalDataLoader.isLoading}
        title="Mortality Details"
        metadata={formatPopupMetadata()}
        key={`mortality-feature-popup-${mortalityId}`}
      />
    </Popup>
  );
};
