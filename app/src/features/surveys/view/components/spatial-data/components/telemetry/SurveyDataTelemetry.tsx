import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import dayjs from 'dayjs';
import { ISurveyMapPoint, ISurveyMapPointMetadata } from 'features/surveys/view/SurveyMap';
import { IAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { Position } from 'geojson';
import { useSurveyContext, useTelemetryDataContext } from 'hooks/useContext';
import { ITelemetry } from 'hooks/useTelemetryApi';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { useMemo } from 'react';
import SurveyDataLayer from '../components/SurveyDataLayer';
import SurveyDataTelemetryTable from './table/SurveyDataTelemetryTable';

export const SurveyDataTelemetry = () => {
  const surveyContext = useSurveyContext();
  const { telemetryDataLoader } = useTelemetryDataContext();
  const telemetryPoints: ISurveyMapPoint[] = useMemo(() => {
    const deployments: IAnimalDeployment[] = surveyContext.deploymentDataLoader.data ?? [];
    const critters: ISimpleCritterWithInternalId[] = surveyContext.critterDataLoader.data ?? [];

    return (
      telemetryDataLoader.data
        ?.filter((telemetry) => telemetry.latitude !== undefined && telemetry.longitude !== undefined)

        // Combine all critter and deployments data into a flat list
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
            onLoadMetadata: async (): Promise<ISurveyMapPointMetadata[]> => {
              return Promise.resolve([
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
              ]);
            }
          };
        }) ?? []
    );
  }, [
    surveyContext.critterDataLoader.data,
    telemetryDataLoader.data,
    surveyContext.deploymentDataLoader.data,
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
    <SurveyDataLayer
      layerName={supplementaryLayer.layerName}
      layerColors={supplementaryLayer.layerColors}
      popupRecordTitle={supplementaryLayer.popupRecordTitle}
      mapPoints={supplementaryLayer.mapPoints}
      DataGrid={<SurveyDataTelemetryTable isLoading={telemetryDataLoader.isLoading} />}
      isLoading={telemetryDataLoader.isLoading}
    />
  );
};
