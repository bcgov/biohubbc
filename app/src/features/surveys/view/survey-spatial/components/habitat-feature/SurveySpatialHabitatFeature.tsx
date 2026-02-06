import Box from '@mui/material/Box';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { HabitatFeatureTableContextProvider } from 'contexts/habitatFeatureTableContext';
import { SurveySpatialHabitatFeaturePointPopup } from 'features/surveys/view/survey-spatial/components/habitat-feature/SurveySpatialHabitatFeaturePointPopup';
import SurveyMap from 'features/surveys/view/SurveyMap';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SurveyHabitatFeaturesGeometry } from 'interfaces/useSurveyHabitatFeatureApi.interface';
import { useEffect, useMemo, useRef } from 'react';
import { coloredCustomHabitatFeatureMarker } from 'utils/mapUtils';
import { SurveySpatialHabitatFeatureTableContainer } from './SurveySpatialHabitatFeatureTableContainer';

interface ISurveySpatialHabitatFeatureProps {
  /**
   * Array of additional static layers to be added to the map.
   */
  staticLayers: IStaticLayer[];
}

/**
 * Container displaying a map of Habitat Features in the Survey
 *
 * @param {ISurveySpatialHabitatFeatureProps} props - The props for the component.
 * @returns {*} {JSX.Element}
 */
export const SurveySpatialHabitatFeature = (props: ISurveySpatialHabitatFeatureProps) => {
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  const habitatFeaturesGeometryDataLoader = useDataLoader(() =>
    biohubApi.habitatFeature.getSurveyHabitatFeaturesGeometry(surveyContext.projectId, surveyContext.surveyId)
  );

  const loadRef = useRef(habitatFeaturesGeometryDataLoader.load);
  loadRef.current = habitatFeaturesGeometryDataLoader.load;
  useEffect(() => {
    loadRef.current();
  }, [surveyContext.projectId, surveyContext.surveyId]);

  const habitatFeatures: SurveyHabitatFeaturesGeometry | undefined = habitatFeaturesGeometryDataLoader.data;

  const habitatFeaturePoints: IStaticLayerFeature[] = useMemo(() => {
    return (
      habitatFeatures?.surveyHabitatFeaturesGeometry.map((item) => ({
        id: Number(item.survey_habitat_feature_id),
        key: `habitat-feature-${item.survey_habitat_feature_id}`,
        geoJSON: {
          type: 'Feature',
          properties: {},
          geometry: item.geometry
        }
      })) ?? []
    );
  }, [habitatFeatures?.surveyHabitatFeaturesGeometry]);

  const habitatFeatureLayer: IStaticLayer = {
    layerName: 'Habitat Features',
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.HABITAT_FEATURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.HABITAT_FEATURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      marker: coloredCustomHabitatFeatureMarker
    },
    features: habitatFeaturePoints,
    popup: (feature) => {
      return <SurveySpatialHabitatFeaturePointPopup feature={feature} />;
    },
    tooltip: (feature) => <SurveyMapTooltip title="Habitat Feature" key={`habitat-feature-tooltip-${feature.id}`} />
  };

  return (
    <>
      {/* Display map with habitat feature points */}
      <Box height={{ xs: 300, md: 500 }} position="relative">
        <SurveyMap
          staticLayers={[...props.staticLayers, habitatFeatureLayer]}
          isLoading={habitatFeaturesGeometryDataLoader.isLoading}
        />
      </Box>

      {/* Display data table with habitat feature details */}
      <Box height={{ xs: 300, md: 500 }} display="flex" flexDirection="column">
        <HabitatFeatureTableContextProvider>
          <SurveySpatialHabitatFeatureTableContainer />
        </HabitatFeatureTableContextProvider>
      </Box>
    </>
  );
};
