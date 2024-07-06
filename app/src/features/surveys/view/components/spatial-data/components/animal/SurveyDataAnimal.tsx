import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import {
  ISurveyMapPoint,
  ISurveyMapPointMetadata,
  ISurveyMapSupplementaryLayer
} from 'features/surveys/view/SurveyMap';
import SurveyMapPopup from 'features/surveys/view/SurveyMapPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo, useState } from 'react';
import { createGeoJSONPoint } from 'utils/Utils';
import { coloredCustomPointMarker } from 'utils/mapUtils';
import SurveyDataMap from '../map/SurveyDataMap';
import SurveySpatialObservationDataTable from '../observation/table/SurveySpatialObservationDataTable';

export const SurveyDataAnimal = () => {
  const surveyContext = useSurveyContext();

  const { surveyId, projectId } = surveyContext;

  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});

  const biohubApi = useBiohubApi();
  const critterbaseApi = useCritterbaseApi();

  const animalDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCrittersDetailed(projectId, surveyId));

  useEffect(() => {
    animalDataLoader.load();
  }, []);

  const animals = animalDataLoader.data;

  const capturePoints: ISurveyMapPoint[] = useMemo(() => {
    const points: ISurveyMapPoint[] = [];

    // Iterate over animals array
    for (const animal of animals ?? []) {
      // Iterate over captures array within each animal
      for (const capture of animal.captures ?? []) {
        if (capture.capture_location && capture.capture_location.latitude && capture.capture_location.longitude) {
          const point: ISurveyMapPoint = {
            feature: {
              type: 'Feature',
              properties: {},
              geometry: createGeoJSONPoint(capture.capture_location.latitude, capture.capture_location.longitude)
            },
            key: `capture-${capture.capture_id}`,
            onLoadMetadata: async (): Promise<ISurveyMapPointMetadata[]> => {
              const response = await critterbaseApi.capture.getCapture(capture.capture_id);

              return [
                { label: 'Capture ID', value: String(response.capture_id) },
                { label: 'Date', value: String(response.capture_date) },
                {
                  label: 'Coords',
                  value: [response.capture_location?.latitude ?? null, response.capture_location?.longitude ?? null]
                    .filter((coord): coord is number => coord !== null)
                    .map((coord) => coord.toFixed(6))
                    .join(', ')
                },
                {
                  label: 'Time',
                  value: capture.capture_time ?? ''
                }
              ];
            }
          };

          points.push(point);
        }
      }
    }

    return points;
  }, [biohubApi.observation, animals, projectId, surveyId]);

  const supplementaryLayer: ISurveyMapSupplementaryLayer = {
    layerName: 'Species Observations',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    popupRecordTitle: 'Species Observations',
    mapPoints: capturePoints
  };

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
        <SurveyDataMap supplementaryLayers={[layer]} isLoading={animalDataLoader.isLoading} />
      </Box>

      {/* DATA TABLE */}
      <Box p={2} position="relative">
        <SurveySpatialObservationDataTable isLoading={animalDataLoader.isLoading} />
      </Box>
    </>
  );
};
