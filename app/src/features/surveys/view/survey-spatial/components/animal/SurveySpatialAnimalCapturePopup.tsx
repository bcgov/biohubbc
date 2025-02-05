import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { Popup } from 'react-leaflet';

interface ISurveySpatialAnimalCapturePopupProps {
  captureId: string;
}

/**
 * Returns information about a critter capture record, shown when a capture point is clicked on the map
 *
 * @param {ISurveySpatialAnimalCapturePopupProps} props
 * @returns {*}
 */
export const SurveySpatialAnimalCapturePopup = (props: ISurveySpatialAnimalCapturePopupProps) => {
  const { captureId } = props;

  const critterbaseApi = useCritterbaseApi();

  const captureDataLoader = useDataLoader(() => critterbaseApi.capture.getCapture(captureId));
  const animalDataLoader = useDataLoader(critterbaseApi.critters.getCritterSimple);

  const formatPopupMetadata = () => {
    if (!captureDataLoader.data || !animalDataLoader.data) return [];

    const { capture_date, capture_time, capture_location } = captureDataLoader.data;
    const { animal_id } = animalDataLoader.data;

    return [
      { label: 'Nickname', value: animal_id },
      { label: 'Date', value: dayjs(capture_date).format(DATE_FORMAT.LongDateTimeFormat) },
      { label: 'Time', value: String(capture_time ?? '') },
      {
        label: 'Coordinates',
        value: [capture_location?.latitude, capture_location?.longitude]
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
        add: async () => {
          const capture = await captureDataLoader.load();
          // Fetch critter information to get the animal's nickname to display, which isn't included in the capture response
          if (capture) animalDataLoader.load(capture.critter_id);
        }
      }}>
      <SurveyMapPopup
        isLoading={captureDataLoader.isLoading || animalDataLoader.isLoading}
        title="Capture Details"
        metadata={formatPopupMetadata()}
        key={`capture-feature-popup-${captureId}`}
      />
    </Popup>
  );
};
