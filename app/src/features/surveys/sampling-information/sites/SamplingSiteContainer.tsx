import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonMap, SkeletonTable } from 'components/loading/SkeletonLoaders';
import { useSamplingSiteStaticLayer } from 'features/surveys/view/survey-spatial/components/map/useSamplingSiteStaticLayer';
import SurveyMap from 'features/surveys/view/SurveyMap';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SamplingSiteTableContainer } from './table/SamplingSiteTableContainer';

/**
 * Component for managing sampling sites, methods, and periods.
 * Returns a map and data grids displaying sampling information.
 *
 * @returns {*}
 */
const SamplingSiteContainer = () => {
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  const samplingSiteStaticLayer = useSamplingSiteStaticLayer();

  const techniquesDataLoader = useDataLoader(() =>
    biohubApi.technique.getTechniquesForSurvey(surveyContext.projectId, surveyContext.surveyId)
  );

  useEffect(() => {
    techniquesDataLoader.load();
  }, [techniquesDataLoader]);

  return (
    <>
      <Toolbar sx={{ flex: '0 0 auto', pr: 3, pl: 2 }}>
        <Typography variant="h3" component="h2" flexGrow={1}>
          Sampling Sites
        </Typography>
        <Stack gap={1} direction="row">
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SAMPLING_SITES} />
          <Button
            variant="contained"
            color="primary"
            disabled={Boolean(!techniquesDataLoader.data?.pagination.total)}
            component={RouterLink}
            to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling/create`}
            startIcon={<Icon path={mdiPlus} size={0.8} />}>
            Add
          </Button>
        </Stack>
      </Toolbar>

      <Divider flexItem />

      <Box>
        <LoadingGuard
          isLoading={false}
          isLoadingFallback={
            <Box height="300px">
              <SkeletonMap />
              <SkeletonTable numberOfLines={5} />
            </Box>
          }
          isLoadingFallbackDelay={100}>
          <Box height="400px" flex="1 1 auto">
            <SurveyMap staticLayers={[samplingSiteStaticLayer]} isLoading={false} />
          </Box>
        </LoadingGuard>
      </Box>

      <SamplingSiteTableContainer />
    </>
  );
};

export default SamplingSiteContainer;
