import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { IAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { SurveySpatialMap } from 'features/surveys/view/survey-spatial/components/map/SurveySpatialMap';
import { SurveySpatialTelemetryPopup } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialTelemetryPopup';
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
  const telemetryContext = useTelemetryDataContext();

  // Load deployments data
  useEffect(() => {
    surveyContext.deploymentDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyContext.projectId, surveyContext.surveyId]);

  // Load telemetry data for all deployments
  useEffect(() => {
    if (!surveyContext.deploymentDataLoader.data?.length) {
      // No deployments data, therefore no telemetry data to load
      return;
    }

    telemetryContext.telemetryDataLoader.refresh(
      surveyContext.deploymentDataLoader.data?.map((deployment) => deployment.deployment_id) ?? []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyContext.deploymentDataLoader.data]);

  /**
   * Combines telemetry, deployment, and critter data into a single list of telemetry points.
   *
   * @param {ITelemetry[]} telemetry The telemetry data.
   * @param {IAnimalDeployment[]} deployments The deployment data.
   * @param {ISimpleCritterWithInternalId[]} critters The critter data.
   * @returns {IStaticLayerFeature[]} The combined list of telemetry points.
   */
  const combineTelemetryData = useCallback(
    (
      telemetry: ITelemetry[],
      deployments: IAnimalDeployment[],
      critters: ISimpleCritterWithInternalId[]
    ): IStaticLayerFeature[] => {
      return (
        telemetry
          ?.filter((telemetry) => telemetry.latitude !== undefined && telemetry.longitude !== undefined)
          .reduce(
            (
              acc: {
                deployment: IAnimalDeployment;
                critter: ISimpleCritterWithInternalId;
                telemetry: ITelemetry;
              }[],
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
              id: telemetry.id,
              key: `telemetry-id-${telemetry.id}`,
              geoJSON: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [telemetry.longitude, telemetry.latitude] as Position
                }
              }
            };
          }) ?? []
      );
    },
    []
  );

  const telemetryPoints: IStaticLayerFeature[] = useMemo(() => {
    const telemetry = telemetryContext.telemetryDataLoader.data ?? [];
    const deployments = surveyContext.deploymentDataLoader.data ?? [];
    const critters = surveyContext.critterDataLoader.data ?? [];

    return combineTelemetryData(telemetry, deployments, critters);
  }, [
    combineTelemetryData,
    surveyContext.critterDataLoader.data,
    surveyContext.deploymentDataLoader.data,
    telemetryContext.telemetryDataLoader.data
  ]);

  const telemetryLayer: IStaticLayer = {
    layerName: 'Telemetry',
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      opacity: 0.75
    },
    features: telemetryPoints,
    popup: (feature) => <SurveySpatialTelemetryPopup feature={feature} />
  };

  return (
    <>
      <Box height={{ sm: 300, md: 500 }} position="relative">
        <SurveySpatialMap staticLayers={[telemetryLayer]} isLoading={telemetryContext.telemetryDataLoader.isLoading} />
      </Box>

      <Box p={2} position="relative">
        <SurveySpatialTelemetryTable isLoading={telemetryContext.telemetryDataLoader.isLoading} />
      </Box>
    </>
  );
};
