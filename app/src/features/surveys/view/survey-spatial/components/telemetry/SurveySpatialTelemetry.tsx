import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { IAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { SurveySpatialMap } from 'features/surveys/view/survey-spatial/components/map/SurveySpatialMap';
import { SurveySpatialTelemetryTable } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialTelemetryTable';
import { Position } from 'geojson';
import { useSurveyContext, useTelemetryDataContext } from 'hooks/useContext';
import { ITelemetry } from 'hooks/useTelemetryApi';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { useCallback, useEffect, useMemo } from 'react';

/**
 * Component to display telemetry data on a map and in a table.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const SurveySpatialTelemetry = () => {
  const surveyContext = useSurveyContext();
  const { telemetryDataLoader } = useTelemetryDataContext();

  useEffect(() => {
    telemetryDataLoader.refresh(
      surveyContext.deploymentDataLoader.data?.map((deployment) => deployment.deployment_id) ?? []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyContext.deploymentDataLoader.data]);

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
              id: telemetry.telemetry_manual_id,
              key: `telemetry-${telemetry.telemetry_manual_id}`,
              geoJSON: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [telemetry.longitude, telemetry.latitude] as Position
                }
              }
              //   icon: coloredCustomPointMarker
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
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      opacity: 0.75
    },
    features: telemetryPoints
  };

  return (
    <>
      <Box height={{ sm: 300, md: 500 }} position="relative">
        <SurveySpatialMap staticLayers={[telemetryLayer]} isLoading={telemetryDataLoader.isLoading} />
      </Box>

      <Box p={2} position="relative">
        <SurveySpatialTelemetryTable isLoading={telemetryDataLoader.isLoading} />
      </Box>
    </>
  );
};
