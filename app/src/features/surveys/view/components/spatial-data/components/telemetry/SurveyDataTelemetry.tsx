import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import dayjs from 'dayjs';
import { IAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { ISurveyMapPointMetadata } from 'features/surveys/view/SurveyMap';
import { Position } from 'geojson';
import { useSurveyContext, useTelemetryDataContext } from 'hooks/useContext';
import { ITelemetry } from 'hooks/useTelemetryApi';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { useCallback, useEffect, useMemo } from 'react';
import { coloredCustomPointMarker } from 'utils/mapUtils';
import SurveyDataMap from '../map/SurveyDataMap';
import SurveyDataTelemetryTable from './table/SurveyDataTelemetryTable';

/**
 * Component to display telemetry data on a map and in a table.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const SurveyDataTelemetry = () => {
  const surveyContext = useSurveyContext();
  const { telemetryDataLoader } = useTelemetryDataContext();

  useEffect(() => {
    telemetryDataLoader.refresh(
      surveyContext.deploymentDataLoader.data?.map((deployment) => deployment.deployment_id) ?? []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyContext.deploymentDataLoader.data]);

  /**
   * Formats the metadata for a telemetry point.
   *
   * @param {ITelemetry} telemetry The telemetry data.
   * @param {IAnimalDeployment} deployment The deployment data.
   * @param {ISimpleCritterWithInternalId} critter The critter data.
   * @returns {Promise<ISurveyMapPointMetadata[]>} The formatted metadata.
   */
  const formatTelemetryMetadata = async (telemetryId: number): Promise<ISurveyMapPointMetadata[]> => {
    const telemetry = telemetryDataLoader.data?.find((telemetry) => telemetry.telemetry_id === telemetryId);
    const deployment = surveyContext.deploymentDataLoader.data?.find(
      (deployment) => deployment.deployment_id === telemetry?.deployment_id
    );
    const critter = surveyContext.critterDataLoader.data?.find(
      (critter) => critter.critter_id === deployment?.critter_id
    );

    return [
      { label: 'Device ID', value: String(deployment?.device_id) },
      { label: 'Nickname', value: critter?.animal_id ?? '' },
      {
        label: 'Location',
        value: [telemetry?.latitude, telemetry?.longitude]
          .filter((coord): coord is number => coord !== null)
          .map((coord) => coord.toFixed(6))
          .join(', ')
      },
      { label: 'Date', value: dayjs(telemetry?.acquisition_date).toISOString() }
    ];
  };

  /**
   * Combines telemetry, deployment, and critter data into a single list of telemetry points.
   *
   * @param {ITelemetry[]} telemetryData The telemetry data.
   * @param {IAnimalDeployment[]} deployments The deployment data.
   * @param {ISimpleCritterWithInternalId[]} critters The critter data.
   * @returns {IStaticLayerFeature[]} The combined list of telemetry points.
   */
  const combineTelemetryData = useCallback(
    (
      telemetryData: ITelemetry[],
      deployments: IAnimalDeployment[],
      critters: ISimpleCritterWithInternalId[]
    ): IStaticLayerFeature[] => {
      return (
        telemetryData
          ?.filter((telemetry) => telemetry.latitude !== undefined && telemetry.longitude !== undefined)
          .reduce(
            (
              acc: { deployment: IAnimalDeployment; critter: ISimpleCritterWithInternalId; telemetry: ITelemetry }[],
              telemetry: ITelemetry
            ) => {
              const deployment = deployments.find(
                (animalDeployment) => animalDeployment.deployment_id === telemetry.deployment_id
              );
              const critter = critters.find((detailedCritter) => detailedCritter.critter_id === deployment?.critter_id);
              if (critter && deployment) {
                acc.push({ deployment, critter, telemetry });
              }

              return acc;
            },
            []
          )
          .map(({ telemetry }) => {
            return {
              geoJSON: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [telemetry.longitude, telemetry.latitude] as Position
                }
              },
              key: `telemetry-${telemetry.telemetry_manual_id}`,
              icon: coloredCustomPointMarker
            };
          }) ?? []
      );
    },
    []
  );

  const telemetryPoints: IStaticLayerFeature[] = useMemo(() => {
    const deployments: IAnimalDeployment[] = surveyContext.deploymentDataLoader.data ?? [];
    const critters: ISimpleCritterWithInternalId[] = surveyContext.critterDataLoader.data ?? [];

    return combineTelemetryData(telemetryDataLoader.data ?? [], deployments, critters);
  }, [
    surveyContext.deploymentDataLoader.data,
    surveyContext.critterDataLoader.data,
    combineTelemetryData,
    telemetryDataLoader.data
  ]);

  const telemetryLayer: IStaticLayer = {
    layerName: 'Telemetry',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      opacity: 0.75
    },
    features: telemetryPoints,
    onClick: async (mapPoint: IStaticLayerFeature) => await formatTelemetryMetadata(Number(mapPoint.id))
  };

  return (
    <>
      <Box height={{ sm: 300, md: 500 }} position="relative">
        <SurveyDataMap staticLayers={[telemetryLayer]} isLoading={telemetryDataLoader.isLoading} />
      </Box>

      <Box p={2} position="relative">
        <SurveyDataTelemetryTable isLoading={telemetryDataLoader.isLoading} />
      </Box>
    </>
  );
};

export default SurveyDataTelemetry;
