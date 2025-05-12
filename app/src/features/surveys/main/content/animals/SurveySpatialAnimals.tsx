import { mdiArrowTopRight, mdiCog } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { SurveyRoleRouteGuard } from 'components/security/RouteGuards';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { SurveySpatialAnimalCapturePopup } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalCapturePopup';
import { SurveySpatialAnimalMortalityPopup } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalMortalityPopup';
import { SurveySpatialAnimalTable } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimalTable';
import SurveyMap from 'features/surveys/view/SurveyMap';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import { coloredCustomMortalityMarker } from 'utils/mapUtils';

/**
 * Array of additional static layers to be added to the map.
 */
interface ISurveySpatialAnimalsProps {
  staticLayers?: IStaticLayer[];
}

/**
 * Container displaying map of captures and mortalities for animals in the Survey, and table of animals below the map
 *
 * @param {ISurveySpatialAnimalsProps} props
 * @returns
 */
export const SurveySpatialAnimals = (props: ISurveySpatialAnimalsProps) => {
  const surveyContext = useSurveyContext();
  const history = useHistory();
  const crittersApi = useCritterbaseApi();

  const critterIds = useMemo(
    () => surveyContext.critterDataLoader.data?.map((critter) => critter.critterbase_critter_id) ?? [],
    [surveyContext.critterDataLoader.data]
  );

  const geometryDataLoader = useDataLoader((critter_ids: string[]) =>
    crittersApi.critters.getMultipleCrittersGeometryByIds(critter_ids)
  );

  const { critterDataLoader } = useSurveyContext();
  const critterbaseApi = useCritterbaseApi();

  const critters = useMemo(() => critterDataLoader.data ?? [], [critterDataLoader.data]);

  const animalsDataLoader = useDataLoader(() =>
    critterbaseApi.critters.getMultipleCrittersByIds(critters.map((critter) => critter.critterbase_critter_id))
  );

  useEffect(() => {
    if (critters.length) {
      animalsDataLoader.load();
    }
  }, [critters, animalsDataLoader]);

  useEffect(() => {
    if (!critterIds.length) {
      return;
    }

    geometryDataLoader.load(critterIds);
  }, [critterIds, geometryDataLoader]);

  const captureLayer: IStaticLayer = {
    layerName: 'Animal Captures',
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.CAPTURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.CAPTURE_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR
    },
    features:
      geometryDataLoader.data?.captures.map((capture) => ({
        id: capture.capture_id,
        key: `capture-${capture.capture_id}`,
        geoJSON: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [capture.coordinates[1], capture.coordinates[0]]
          },
          properties: {}
        }
      })) ?? [],
    popup: (feature) => <SurveySpatialAnimalCapturePopup captureId={String(feature.id)} />,
    tooltip: (feature) => <SurveyMapTooltip title="Animal Capture" key={`mortality-tooltip-${feature.id}`} />
  };

  const mortalityLayer: IStaticLayer = {
    layerName: 'Animal Mortalities',
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.MORTALITY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.MORTALITY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      marker: coloredCustomMortalityMarker
    },
    features:
      geometryDataLoader.data?.mortalities.map((mortality) => ({
        id: mortality.mortality_id,
        key: `mortality-${mortality.mortality_id}`,
        geoJSON: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [mortality.coordinates[1], mortality.coordinates[0]]
          },
          properties: {}
        }
      })) ?? [],
    popup: (feature) => <SurveySpatialAnimalMortalityPopup mortalityId={String(feature.id)} />,
    tooltip: (feature) => <SurveyMapTooltip title="Animal Mortality" key={`capture-tooltip-${feature.id}`} />
  };

  return (
    <>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h2" flex="1 1 auto">
          Animals
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
              onClick={() => history.push(`/admin/surveys/${surveyContext.surveyId}/animals`)}
              startIcon={<Icon path={mdiCog} size={0.75}></Icon>}>
              Manage
            </Button>
          </SurveyRoleRouteGuard>
        </Stack>
      </Toolbar>

      {/* Display map with animal capture points */}
      <Box height={400} position="relative">
        <SurveyMap
          staticLayers={[...(props.staticLayers ?? []), captureLayer, mortalityLayer]}
          isLoading={geometryDataLoader.isLoading}
        />
      </Box>

      {/* Display data table with animal capture details */}
      <Box display="flex" flexDirection="column">
        <LoadingGuard
          isLoading={animalsDataLoader.isLoading || critterDataLoader.isLoading}
          isLoadingFallback={
            <Box flex="1 1 auto">
              <SkeletonTable />
            </Box>
          }
          hasNoData={!animalsDataLoader.data?.length}
          hasNoDataFallback={
            <Box flex="1 1 auto">
              <NoDataOverlay
                minHeight="400px"
                title="Add Animals"
                subtitle="Add animals that you have captured, individually identified, or found deceased"
                icon={mdiArrowTopRight}
              />
            </Box>
          }>
          <SurveySpatialAnimalTable animals={animalsDataLoader.data ?? []} />
        </LoadingGuard>
      </Box>
    </>
  );
};
