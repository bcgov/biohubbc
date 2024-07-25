import { IStaticLayerFeature } from 'components/map/components/StaticLayers';
// import dayjs from 'dayjs';
// import { IAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
// import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
// import { useSurveyContext } from 'hooks/useContext';
// import useDataLoader from 'hooks/useDataLoader';
// import { ITelemetry, useTelemetryApi } from 'hooks/useTelemetryApi';
// import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
// import { Popup } from 'react-leaflet';

export interface ISurveySpatialTelemetryPopupProps {
  feature: IStaticLayerFeature;
}

export const SurveySpatialTelemetryPopup = (props: ISurveySpatialTelemetryPopupProps) => {
  if (!props.feature) {
    return <></>;
  }

  return <></>;

  //   const { feature } = props;
  //   const surveyContext = useSurveyContext();
  //   const telemetryApi = useTelemetryApi();
  //   const telemetryDataLoader = useDataLoader(telemetryApi.getAllTelemetryByDeploymentIds);
  //   //   const critterbaseApi = useCritterbaseApi();
  //   //   const critterDataLoader = useDataLoader(biohubApi.survey.getSurveyCritters);
  //   const telemetry = telemetryDataLoader.data?.find((telemetry) => telemetry.telemetry_id === telemetryId);
  //   const deployment = surveyContext.deploymentDataLoader.data?.find(
  //     (deployment) => deployment.deployment_id === telemetry?.deployment_id
  //   );
  //   const critter = surveyContext.critterDataLoader.data?.find(
  //     (critter) => critter.critter_id === deployment?.critter_id
  //   );
  //   const getTelemetryMetadata = (
  //     telemetry: ITelemetry[],
  //     deployment: IAnimalDeployment,
  //     critter: ISimpleCritterWithInternalId
  //   ) => {
  //     return [
  //       { label: 'Device ID', value: String(deployment?.device_id) },
  //       { label: 'Nickname', value: critter?.animal_id ?? '' },
  //       {
  //         label: 'Location',
  //         value: [telemetry?.latitude, telemetry?.longitude]
  //           .filter((coord): coord is number => coord !== null)
  //           .map((coord) => coord.toFixed(6))
  //           .join(', ')
  //       },
  //       { label: 'Date', value: dayjs(telemetry?.acquisition_date).toISOString() }
  //     ];
  //   };
  //   return (
  //     <Popup
  //       keepInView={false}
  //       closeButton={true}
  //       autoPan={true}
  //       eventHandlers={{
  //         add: () => {
  //           telemetryDataLoader.load([String(feature.id)]);
  //         },
  //         remove: () => {
  //           telemetryDataLoader.clearData();
  //         }
  //       }}>
  //       <SurveyMapPopup
  //         isLoading={telemetryDataLoader.isLoading || !telemetryDataLoader.isReady}
  //         title="Observation"
  //         metadata={telemetryDataLoader.data ? getTelemetryMetadata(telemetryDataLoader.data, deployment, critter) : []}
  //         key={`mortality-feature-popup-${feature.id}`}
  //       />
  //     </Popup>
  //   );
};
