import { mdiCog } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SurveyRoleRouteGuard } from 'components/security/RouteGuards';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { SurveySpatialHabitatFeaturePointPopup } from 'features/surveys/view/survey-spatial/components/habitat-feature/SurveySpatialHabitatFeaturePointPopup';
import SurveyMap from 'features/surveys/view/SurveyMap';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { SurveyHabitatFeaturesGeometry } from 'interfaces/useSurveyHabitatFeatureApi.interface';
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import { coloredCustomHabitatFeatureMarker } from 'utils/mapUtils';
import { SurveySpatialHabitatFeatureTableContainer } from './table/SurveySpatialHabitatFeatureTableContainer';

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
  const history = useHistory();

  const habitatFeaturesGeometryDataLoader = useDataLoader(() =>
    biohubApi.habitatFeature.getSurveyHabitatFeaturesGeometry(surveyContext.surveyId)
  );

  useEffect(() => {
    habitatFeaturesGeometryDataLoader.load();
  }, [habitatFeaturesGeometryDataLoader]);

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
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h2" flex="1 1 auto">
          Observations
        </Typography>
        <Stack gap={1} direction="row">
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SURVEY_DATA} />
          <SurveyRoleRouteGuard
            validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button
              variant="contained"
              color="primary"
              aria-label="Manage Survey Data"
              onClick={() => history.push(`/admin/surveys/${surveyContext.surveyId}/observations`)}
              startIcon={<Icon path={mdiCog} size={0.75}></Icon>}>
              Manage
            </Button>
          </SurveyRoleRouteGuard>
        </Stack>
      </Toolbar>

      {/* Display map with habitat feature points */}
      <Box height={{ xs: 300, md: 500 }} position="relative">
        <SurveyMap
          staticLayers={[...props.staticLayers, habitatFeatureLayer]}
          isLoading={habitatFeaturesGeometryDataLoader.isLoading}
        />
      </Box>

      {/* Display data table with habitat feature details */}
      <Box height={{ xs: 300, md: 500 }} display="flex" flexDirection="column">
        <SurveySpatialHabitatFeatureTableContainer />
      </Box>
    </>
  );
};
