import { CircularProgress, Skeleton } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { SurveySpatialContainer } from 'features/surveys/view/survey-spatial/SurveySpatialContainer';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect } from 'react';

export const SurveyOverviewPage = () => {
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);
  const biohubApi = useBiohubApi();

  const checklistDataLoader = useDataLoader(() => biohubApi.checklist.getSurveyChecklist(surveyContext.surveyId));

  useEffect(() => {
    checklistDataLoader.load();
    codesContext.codesDataLoader.load();
  }, [checklistDataLoader, codesContext.codesDataLoader]);
  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <LoadingGuard
        isLoading={codesContext.codesDataLoader.isLoading || surveyContext.surveyDataLoader.isLoading}
        isLoadingFallbackDelay={600}
        isLoadingFallback={
          <Box sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Skeleton variant="rectangular" width="100px" height="30px" />
              <Skeleton variant="rectangular" width="100%" height="150px" />
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" width="100%" height="75px" />
              ))}
            </Stack>
          </Box>
        }>
        <SurveySpatialContainer />
      </LoadingGuard>
    </>
  );
};
