import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { useSurveyContext } from 'hooks/useContext';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SamplingTechniqueCardContainer } from './components/SamplingTechniqueCardContainer';

/**
 * Renders a list of techniques.
 *
 * @return {*}
 */
export const SamplingTechniqueContainer = () => {
  const surveyContext = useSurveyContext();

  useEffect(() => {
    console.log('refreshing techniques');
    surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyContext.projectId, surveyContext.surveyId]);

  const techniqueCount = surveyContext.techniqueDataLoader.data?.count ?? 0;
  const techniques = surveyContext.techniqueDataLoader.data?.techniques ?? [];

  return (
    <Stack
      flexDirection="column"
      height="100%"
      sx={{
        overflow: 'hidden'
      }}>
      <Toolbar
        disableGutters
        sx={{
          flex: '0 0 auto',
          pr: 3,
          pl: 2
        }}>
        <Typography variant="h3" component="h2" flexGrow={1}>
          Techniques &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({techniqueCount})
          </Typography>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to={'sampling/techniques/create'}
          startIcon={<Icon path={mdiPlus} size={0.8} />}>
          Add
        </Button>
      </Toolbar>

      <Divider flexItem></Divider>

      <LoadingGuard
        isLoading={surveyContext.techniqueDataLoader.isLoading || !surveyContext.techniqueDataLoader.isReady}
        fallback={<SkeletonTable />}
        delay={200}>
        <SamplingTechniqueCardContainer techniques={techniques} />
      </LoadingGuard>
    </Stack>
  );
};
