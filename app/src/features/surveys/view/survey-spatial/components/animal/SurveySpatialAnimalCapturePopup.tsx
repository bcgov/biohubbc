import { IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import { Popup } from 'react-leaflet';

export interface ISurveySpatialAnimalCapturePopupProps {
  feature: IStaticLayerFeature;
}

export const SurveySpatialAnimalCapturePopup = (props: ISurveySpatialAnimalCapturePopupProps) => {
  const { feature } = props;

  const critterbaseApi = useCritterbaseApi();

  const captureDataLoader = useDataLoader((captureId) => critterbaseApi.capture.getCapture(captureId));

  const getCaptureMetadata = (capture: ICaptureResponse) => {
    return [
      { label: 'Capture ID', value: String(capture.capture_id) },
      { label: 'Date', value: dayjs(capture.capture_date).format(DATE_FORMAT.LongDateTimeFormat) },
      { label: 'Time', value: String(capture.capture_time ?? '') },
      {
        label: 'Coordinates',
        value: [capture.release_location?.latitude ?? null, capture.release_location?.longitude ?? null]
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
          captureDataLoader.load(String(feature.id));
        },
        remove: () => {
          captureDataLoader.clearData();
        }
      }}>
      <SurveyMapPopup
        isLoading={captureDataLoader.isLoading || !captureDataLoader.isReady}
        title="Capture"
        metadata={captureDataLoader.data ? getCaptureMetadata(captureDataLoader.data) : []}
        key={`capture-feature-popup-${feature.id}`}
      />
    </Popup>
  );
};