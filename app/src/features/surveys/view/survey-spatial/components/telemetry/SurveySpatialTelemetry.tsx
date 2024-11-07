import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { SurveySpatialMap } from 'features/surveys/view/survey-spatial/components/map/SurveySpatialMap';
import { SurveySpatialTelemetryTable } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialTelemetryTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo } from 'react';

interface ISurveySpatialTelemetryProps {
  popup: ((feature: IStaticLayerFeature) => React.ReactElement) | undefined;
  tooltip: ((feature: IStaticLayerFeature) => React.ReactElement) | undefined;
}

/**
 * Component to display telemetry data on a map and in a table.
 *
 * @returns {*} The rendered component.
 */
export const SurveySpatialTelemetry = (props: ISurveySpatialTelemetryProps) => {
  const { tooltip, popup } = props;

  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();

  const telemetrySpatialDataLoader = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.telemetry.getTelemetrySpatialForSurvey(projectId, surveyId)
  );

  useEffect(() => {
    telemetrySpatialDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [surveyContext.projectId, surveyContext.surveyId, telemetrySpatialDataLoader]);

  const points: IStaticLayerFeature[] = useMemo(() => {
    const points: IStaticLayerFeature[] = [];

    for (const item of telemetrySpatialDataLoader.data?.telemetry ?? []) {
      if (!item.geometry) {
        // Skip invalid points
        continue;
      }

      points.push({
        id: item.telemetry_id,
        key: `telemetry-${item.telemetry_id}`,
        geoJSON: {
          type: 'Feature',
          properties: {},
          geometry: item.geometry
        }
      });
    }

    return points;
  }, [telemetrySpatialDataLoader.data?.telemetry]);

  const layer: IStaticLayer = {
    layerName: 'Telemetry',
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      opacity: 0.75
    },
    features: points,
    popup,
    tooltip
  };

  return (
    <>
      {/* Display map with telemetry points */}
      <Box height={{ xs: 300, md: 500 }} position="relative">
        <SurveySpatialMap staticLayers={[layer]} isLoading={telemetrySpatialDataLoader.isLoading} />
      </Box>

      {/* Display data table with telemetry details */}
      <Box height={{ xs: 300, md: 500 }} p={2} position="relative">
        <SurveySpatialTelemetryTable isLoading={telemetrySpatialDataLoader.isLoading} />
      </Box>
    </>
  );
};
