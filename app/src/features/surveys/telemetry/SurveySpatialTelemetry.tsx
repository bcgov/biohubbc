import { mdiCog } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { SurveyRoleRouteGuard } from 'components/security/Guards';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { SurveySpatialTelemetryContainer } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialTelemetryContainer';
import { SurveySpatialTelemetryPopup } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialTelemetryPopup';
import SurveyMap from 'features/surveys/view/SurveyMap';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';

/**
 * Component to display telemetry data on a map and in a table.
 *
 * @returns {*} The rendered component.
 */
export const SurveySpatialTelemetry = () => {
  const surveyContext = useSurveyContext();
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const telemetrySpatialDataLoader = useDataLoader((surveyId: number) =>
    biohubApi.telemetry.getTelemetrySpatialForSurvey(surveyId)
  );

  useEffect(() => {
    telemetrySpatialDataLoader.load(surveyContext.surveyId);
  }, [surveyContext.surveyId, telemetrySpatialDataLoader]);

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
    popup: (feature) => {
      return <SurveySpatialTelemetryPopup feature={feature} />;
    },
    tooltip: (feature) => <SurveyMapTooltip title="Telemetry" key={`telemetry-tooltip-${feature.id}`} />
  };

  return (
    <>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h2" flex="1 1 auto">
          Telemetry
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
              onClick={() => history.push('/observations/manage')}
              startIcon={<Icon path={mdiCog} size={0.75}></Icon>}>
              Manage
            </Button>
          </SurveyRoleRouteGuard>
        </Stack>
      </Toolbar>
      {/* Display map with telemetry points */}
      <Box height={{ xs: 300, md: 400 }} position="relative">
        <SurveyMap staticLayers={[layer]} isLoading={telemetrySpatialDataLoader.isLoading} />
      </Box>

      {/* Display data table with telemetry details */}
      <Box display="flex" flexDirection="column" pt={2}>
        <SurveySpatialTelemetryContainer />
      </Box>
    </>
  );
};
