import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import SurveyObservationTabularDataContainer from 'features/surveys/view/components/data-container/SurveyObservationTabularDataContainer.tsx';
import { SurveySpatialMap } from 'features/surveys/view/survey-spatial/components/map/SurveySpatialMap';
import { SurveySpatialObservationPointPopup } from 'features/surveys/view/survey-spatial/components/observation/SurveySpatialObservationPointPopup';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { IGetSurveyObservationsGeometryResponse } from 'interfaces/useObservationApi.interface';
import { useEffect, useMemo } from 'react';
import { coloredCustomObservationMarker } from 'utils/mapUtils';

/**
 * Component to display survey observation data on a map and in a table.
 */
export const SurveySpatialObservation = () => {
  const surveyContext = useSurveyContext();
  const { surveyId, projectId } = surveyContext;
  const biohubApi = useBiohubApi();

  const observationsGeometryDataLoader = useDataLoader(() =>
    biohubApi.observation.getObservationsGeometry(projectId, surveyId)
  );

  useEffect(() => {
    observationsGeometryDataLoader.load();
  }, [observationsGeometryDataLoader]);

  const observations: IGetSurveyObservationsGeometryResponse | undefined = observationsGeometryDataLoader.data;

  const observationPoints: IStaticLayerFeature[] = useMemo(() => {
    return (
      observations?.surveyObservationsGeometry.map((item) => ({
        id: Number(item.survey_observation_id),
        key: `observation-${item.survey_observation_id}`,
        geoJSON: {
          type: 'Feature',
          properties: {},
          geometry: item.geometry
        }
      })) ?? []
    );
  }, [observations?.surveyObservationsGeometry]);

  const observationLayer: IStaticLayer = {
    layerName: 'Species Observations',
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      marker: coloredCustomObservationMarker
    },
    features: observationPoints,
    popup: (feature) => {
      return <SurveySpatialObservationPointPopup feature={feature} />;
    },
    tooltip: (feature) => <SurveyMapTooltip title="Observation" key={`observation-tooltip-${feature.id}`} />
  };

  return (
    <>
      {/* Display map with observation points */}
      <Box height={{ sm: 300, md: 500 }} position="relative">
        <SurveySpatialMap staticLayers={[observationLayer]} isLoading={observationsGeometryDataLoader.isLoading} />
      </Box>

      {/* Display data table with observation details */}
      <Box p={2} position="relative">
        <SurveyObservationTabularDataContainer isLoading={observationsGeometryDataLoader.isLoading} />
      </Box>
    </>
  );
};
