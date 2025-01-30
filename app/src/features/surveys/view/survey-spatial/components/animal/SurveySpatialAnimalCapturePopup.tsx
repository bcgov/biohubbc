import { IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICaptureResponse, ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import { Popup } from 'react-leaflet';

export interface ISurveySpatialAnimalCapturePopupProps {
  feature: IStaticLayerFeature;
}

/**
 * Renders a popup for animal capture data on the map.
 *
 * @param {ISurveySpatialAnimalCapturePopupProps} props
 * @return {*}
 */
export const SurveySpatialAnimalCapturePopup = (props: ISurveySpatialAnimalCapturePopupProps) => {
  const { feature } = props;

  const critterbaseApi = useCritterbaseApi();

  // Data loader for capture details
  const captureDataLoader = useDataLoader((captureId) => critterbaseApi.capture.getCapture(captureId));

  // Data loader for animal details
  const animalDataLoader = useDataLoader(async (critterId: string) => {
    const animalData: ICritterDetailedResponse = await critterbaseApi.critters.getDetailedCritter(critterId);
    return animalData;
  });

  // Combine capture and animal data into metadata for the popup
  const getPopupMetadata = (capture: ICaptureResponse, animal?: ICritterDetailedResponse) => {
    const metadata = [
      { label: 'Nickname', value: animal?.animal_id ?? 'Loading...' },
      { label: 'Date', value: dayjs(capture.capture_date).format(DATE_FORMAT.LongDateTimeFormat) },
      {
        label: 'Coordinates',
        value: [capture.release_location?.latitude ?? null, capture.release_location?.longitude ?? null]
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
          // Load capture data and subsequently load animal data using critter_id
          captureDataLoader.load(String(feature.id)).then((capture) => {
            if (capture?.critter_id) {
              animalDataLoader.load(capture.critter_id);
            }
          });
        }
      }}>
      <SurveyMapPopup
        isLoading={captureDataLoader.isLoading || !captureDataLoader.isReady || animalDataLoader.isLoading}
        title="Capture Details"
        metadata={captureDataLoader.data ? getPopupMetadata(captureDataLoader.data, animalDataLoader.data) : []}
        key={`capture-feature-popup-${feature.id}`}
      />
    </Popup>
  );
};
