import { IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useSurveyContext, useTelemetryDataContext } from 'hooks/useContext';
import { Popup } from 'react-leaflet';

export interface ISurveySpatialTelemetryPopupProps {
  feature: IStaticLayerFeature;
}

/**
 * Renders a popup for telemetry data on the map.
 *
 * TODO: This currently relies on the telemetry, deployment, and critter data loaders to already be loaded. The
 * improvement would be to fetch that data when the popup is opened, based on the provided feature ID.
 *
 * @param {ISurveySpatialTelemetryPopupProps} props
 * @return {*}
 */
export const SurveySpatialTelemetryPopup = (props: ISurveySpatialTelemetryPopupProps) => {
  const { feature } = props;

  const surveyContext = useSurveyContext();
  const telemetryDataContext = useTelemetryDataContext();

  const deploymentDataLoader = telemetryDataContext.deploymentsDataLoader;
  const telemetryDataLoader = telemetryDataContext.telemetryDataLoader;

  const getTelemetryMetadata = () => {
    const telemetryId = feature.id;

    const telemetryRecord = telemetryDataLoader.data?.find((telemetry) => telemetry.telemetry_id === telemetryId);

    if (!telemetryRecord) {
      return [{ label: 'Telemetry ID', value: telemetryId }];
    }

    const deploymentRecord = deploymentDataLoader.data?.deployments.find(
      (deployment) => deployment.deployment2_id === telemetryRecord.deployment_id
    );

    if (!deploymentRecord) {
      return [
        { label: 'Telemetry ID', value: telemetryId },
        {
          label: 'Location',
          value: [telemetryRecord.latitude, telemetryRecord.longitude]
            .filter((coord): coord is number => coord !== null)
            .map((coord) => coord.toFixed(6))
            .join(', ')
        },
        { label: 'Date', value: dayjs(telemetryRecord?.acquisition_date).toISOString() }
      ];
    }

    const critterRecord = surveyContext.critterDataLoader.data?.find(
      (critter) => critter.critter_id === deploymentRecord.critter_id
    );

    if (!critterRecord) {
      return [
        { label: 'Telemetry ID', value: telemetryId },
        { label: 'Device ID', value: String(deploymentRecord.device_id) },
        {
          label: 'Location',
          value: [telemetryRecord.latitude, telemetryRecord.longitude]
            .filter((coord): coord is number => coord !== null)
            .map((coord) => coord.toFixed(6))
            .join(', ')
        },
        { label: 'Date', value: dayjs(telemetryRecord?.acquisition_date).toISOString() }
      ];
    }

    return [
      { label: 'Telemetry ID', value: telemetryId },
      { label: 'Device ID', value: String(deploymentRecord.device_id) },
      { label: 'Nickname', value: critterRecord.animal_id ?? '' },
      {
        label: 'Location',
        value: [telemetryRecord?.latitude, telemetryRecord?.longitude]
          .filter((coord): coord is number => coord !== null)
          .map((coord) => coord.toFixed(6))
          .join(', ')
      },
      { label: 'Date', value: dayjs(telemetryRecord?.acquisition_date).format(DATE_FORMAT.LongDateTimeFormat) }
    ];
  };

  return (
    <Popup keepInView={false} closeButton={true} autoPan={true}>
      <SurveyMapPopup
        isLoading={false}
        title="Telemetry Location"
        metadata={getTelemetryMetadata()}
        key={`telemetry-feature-popup-${feature.id}`}
      />
    </Popup>
  );
};
