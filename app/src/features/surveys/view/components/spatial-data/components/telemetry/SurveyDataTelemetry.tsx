import Box from '@mui/material/Box';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import dayjs from 'dayjs';
import { IAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { ISurveyMapPoint, ISurveyMapPointMetadata } from 'features/surveys/view/SurveyMap';
import { Position } from 'geojson';
import { useSurveyContext, useTelemetryDataContext } from 'hooks/useContext';
import { ITelemetry } from 'hooks/useTelemetryApi';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { useCallback, useEffect, useMemo } from 'react';
import SurveyDataLayer from '../map/SurveyDataMapContainer';
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
  }, [surveyContext.deploymentDataLoader.data, telemetryDataLoader]);

  /**
   * Formats the metadata for a telemetry point.
   *
   * @param {ITelemetry} telemetry The telemetry data.
   * @param {IAnimalDeployment} deployment The deployment data.
   * @param {ISimpleCritterWithInternalId} critter The critter data.
   * @returns {Promise<ISurveyMapPointMetadata[]>} The formatted metadata.
   */
  const formatTelemetryMetadata = async (
    telemetry: ITelemetry,
    deployment: IAnimalDeployment,
    critter: ISimpleCritterWithInternalId
  ): Promise<ISurveyMapPointMetadata[]> => {
    return [
      { label: 'Device ID', value: String(deployment.device_id) },
      { label: 'Nickname', value: critter.animal_id ?? '' },
      {
        label: 'Location',
        value: [telemetry.latitude, telemetry.longitude]
          .filter((coord): coord is number => coord !== null)
          .map((coord) => coord.toFixed(6))
          .join(', ')
      },
      { label: 'Date', value: dayjs(telemetry.acquisition_date).toISOString() }
    ];
  };

  /**
   * Combines telemetry, deployment, and critter data into a single list of telemetry points.
   *
   * @param {ITelemetry[]} telemetryData The telemetry data.
   * @param {IAnimalDeployment[]} deployments The deployment data.
   * @param {ISimpleCritterWithInternalId[]} critters The critter data.
   * @returns {ISurveyMapPoint[]} The combined list of telemetry points.
   */
  const combineTelemetryData = useCallback(
    (
      telemetryData: ITelemetry[],
      deployments: IAnimalDeployment[],
      critters: ISimpleCritterWithInternalId[]
    ): ISurveyMapPoint[] => {
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
          .map(({ telemetry, deployment, critter }) => {
            return {
              feature: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [telemetry.longitude, telemetry.latitude] as Position
                }
              },
              key: `telemetry-${telemetry.telemetry_manual_id}`,
              onLoadMetadata: () => formatTelemetryMetadata(telemetry, deployment, critter)
            };
          }) ?? []
      );
    },
    []
  );

  const telemetryPoints: ISurveyMapPoint[] = useMemo(() => {
    const deployments: IAnimalDeployment[] = surveyContext.deploymentDataLoader.data ?? [];
    const critters: ISimpleCritterWithInternalId[] = surveyContext.critterDataLoader.data ?? [];

    return combineTelemetryData(telemetryDataLoader.data ?? [], deployments, critters);
  }, [
    surveyContext.deploymentDataLoader.data,
    surveyContext.critterDataLoader.data,
    combineTelemetryData,
    telemetryDataLoader.data
  ]);

  const supplementaryLayer = {
    layerName: 'Telemetry',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      opacity: 0.75
    },
    popupRecordTitle: 'Telemetry',
    mapPoints: telemetryPoints
  };

  return (
    <>
      <SurveyDataLayer
        layerName={supplementaryLayer.layerName}
        layerColors={supplementaryLayer.layerColors}
        popupRecordTitle={supplementaryLayer.popupRecordTitle}
        mapPoints={supplementaryLayer.mapPoints}
        isLoading={telemetryDataLoader.isLoading}
      />

      <Box p={2} position="relative">
        <SurveyDataTelemetryTable isLoading={telemetryDataLoader.isLoading} />
      </Box>
    </>
  );
};

export default SurveyDataTelemetry;
