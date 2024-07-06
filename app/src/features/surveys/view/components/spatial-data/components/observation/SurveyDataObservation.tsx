import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
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
import useDataLoader from 'hooks/useDataLoader';
import { IGetSurveyObservationsGeometryResponse } from 'interfaces/useObservationApi.interface';
import { useEffect, useMemo, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';
import { coloredCustomPointMarker } from 'utils/mapUtils';
import SurveyDataMap from '../map/SurveyDataMap';
import SurveySpatialObservationDataTable from './table/SurveySpatialObservationDataTable';

export const SurveyDataObservation = () => {
  const surveyContext = useSurveyContext();

  const { surveyId, projectId } = surveyContext;

  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});
  const biohubApi = useBiohubApi();

  const observationsGeometryDataLoader = useDataLoader(() =>
    biohubApi.observation.getObservationsGeometry(projectId, surveyId)
  );

  useEffect(() => {
    observationsGeometryDataLoader.load();
  }, []);

  const observations: IGetSurveyObservationsGeometryResponse | undefined = observationsGeometryDataLoader.data;

  //   Map data
  const observationPoints: ISurveyMapPoint[] = useMemo(() => {
    return (
      observations?.surveyObservationsGeometry.map((observation) => {
        const point: ISurveyMapPoint = {
          feature: {
            type: 'Feature',
            properties: {},
            geometry: observation.geometry
          },

          key: `observation-${observation.survey_observation_id}`,
          onLoadMetadata: async (): Promise<ISurveyMapPointMetadata[]> => {
            const response = await biohubApi.observation.getObservationRecord(
              projectId,
              surveyId,
              observation.survey_observation_id
            );

            return [
              { label: 'Taxon ID', value: String(response.itis_tsn) },
              { label: 'Count', value: String(response.count) },
              {
                label: 'Coords',
                value: [response.latitude, response.longitude]
                  .filter((coord): coord is number => coord !== null)
                  .map((coord) => coord.toFixed(6))
                  .join(', ')
              },
              {
                label: 'Date',
                value: getFormattedDate(
                  response.observation_time ? DATE_FORMAT.ShortMediumDateTimeFormat : DATE_FORMAT.ShortMediumDateFormat,
                  `${response.observation_date} ${response.observation_time}`
                )
              }
            ];
          }
        };

        return point;
      }) ?? []
    );
  }, [biohubApi.observation, observations, projectId, surveyId]);

  const supplementaryLayer: ISurveyMapSupplementaryLayer = {
    layerName: 'Species Observations',
    layerColors: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    popupRecordTitle: 'Species Observations',
    mapPoints: observationPoints
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
        <SurveyDataMap supplementaryLayers={[layer]} isLoading={observationsGeometryDataLoader.isLoading} />
      </Box>

      {/* DATA TABLE */}
      <Box p={2} position="relative">
        <SurveySpatialObservationDataTable isLoading={observationsGeometryDataLoader.isLoading} />
      </Box>
    </>
  );
};
