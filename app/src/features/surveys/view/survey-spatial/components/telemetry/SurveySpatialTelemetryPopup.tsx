import { IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { IAllTelemetry } from 'interfaces/useTelemetryApi.interface';
import { Popup } from 'react-leaflet';

export interface ISurveySpatialTelemetryPopupProps {
  feature: IStaticLayerFeature;
}

/**
 * Renders a popup for telemetry data on the map.
 *
 *
 * @param {ISurveySpatialTelemetryPopupProps} props
 * @return {*}
 */
export const SurveySpatialTelemetryPopup = (props: ISurveySpatialTelemetryPopupProps) => {
  const { feature } = props;

  const biohubAPi = useBiohubApi();

  const surveyContext = useSurveyContext();

  const telemetryDataLoader = useDataLoader((telemetryId: string) =>
    biohubAPi.telemetry.getTelemetryById(surveyContext.surveyId, telemetryId)
  );

  const getTelemetryMetadata = (telemetry: IAllTelemetry) => {
    return [
      { label: 'Telemetry ID', value: telemetry.telemetry_id },
      { label: 'Deployment ID', value: String(telemetry.deployment_id) },
      { label: 'Nickname', value: telemetry.critter_id ?? '' },
      {
        label: 'Location',
        value: [telemetry?.latitude, telemetry?.longitude]
          .filter((coord): coord is number => coord !== null)
          .map((coord) => coord.toFixed(6))
          .join(', ')
      },
      {
        label: 'Date',
        value: dayjs(telemetry.acquisition_date).format(DATE_FORMAT.MediumDateFormat)
      },
      {
        label: 'Time',
        value: dayjs(telemetry.acquisition_date).format(DATE_FORMAT.TimeFormat)
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
          telemetryDataLoader.load(String(feature.id));
        }
      }}>
      <SurveyMapPopup
        isLoading={telemetryDataLoader.isLoading || !telemetryDataLoader.isReady}
        title="Telemetry Point"
        metadata={telemetryDataLoader.data ? getTelemetryMetadata(telemetryDataLoader.data.telemetry) : []}
        key={`telemetry-feature-popup-${feature.id}`}
      />
    </Popup>
  );
};
