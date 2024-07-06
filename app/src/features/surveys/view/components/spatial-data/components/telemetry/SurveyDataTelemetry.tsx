import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import dayjs from 'dayjs';
import {
  ISurveyMapPoint,
  ISurveyMapPointMetadata,
  ISurveyMapSupplementaryLayer
} from 'features/surveys/view/SurveyMap';
import SurveyMapPopup from 'features/surveys/view/SurveyMapPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { IAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { Position } from 'geojson';
import { useSurveyContext, useTelemetryDataContext } from 'hooks/useContext';
import { ITelemetry } from 'hooks/useTelemetryApi';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { useMemo, useState } from 'react';
import { coloredCustomPointMarker } from 'utils/mapUtils';
import SurveyDataMap from '../map/SurveyDataMap';
import SurveySpatialObservationDataTable from '../observation/table/SurveySpatialObservationDataTable';

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

  const supplementaryLayer: ISurveyMapSupplementaryLayer = {
    layerName: 'Telemetry',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    popupRecordTitle: 'Telemetry',
    mapPoints: telemetryPoints
  };

  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});

  const layer: IStaticLayer = {
    layerName: supplementaryLayer.layerName,
    layerColors: {
      fillColor: supplementaryLayer.layerColors?.fillColor ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: supplementaryLayer.layerColors?.color ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features: supplementaryLayer.mapPoints.map((mapPoint: ISurveyMapPoint): IStaticLayerFeature => {
      const isLoading = !mapPointMetadata[mapPoint.key];

      return {
        key: mapPoint.key,
        geoJSON: mapPoint.feature,
        GeoJSONProps: {
          onEachFeature: (_, layer) => {
            layer.on({
              popupopen: () => {
                if (mapPointMetadata[mapPoint.key]) {
                  return;
                }
                mapPoint.onLoadMetadata().then((metadata) => {
                  setMapPointMetadata((prev) => ({ ...prev, [mapPoint.key]: metadata }));
                });
              }
            });
          },
          pointToLayer: (_, latlng) =>
            coloredCustomPointMarker({ latlng, fillColor: supplementaryLayer.layerColors?.fillColor })
        },
        popup: (
          <SurveyMapPopup
            isLoading={isLoading}
            title={supplementaryLayer.popupRecordTitle}
            metadata={mapPointMetadata[mapPoint.key]}
          />
        ),
        tooltip: <SurveyMapTooltip label={supplementaryLayer.popupRecordTitle} />
      };
    })
  };

  return (
    <>
      {/* MAP */}
      <Box height={{ sm: 300, md: 500 }} position="relative">
        <SurveyDataMap supplementaryLayers={[layer]} isLoading={telemetryDataLoader.isLoading} />
      </Box>

      {/* DATA TABLE */}
      <Box p={2} position="relative">
        <SurveySpatialObservationDataTable isLoading={telemetryDataLoader.isLoading} />
      </Box>
    </>
  );
};
