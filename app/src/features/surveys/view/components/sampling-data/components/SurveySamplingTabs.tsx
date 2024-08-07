import { mdiAutoFix, mdiCalendarRange, mdiMapMarker } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { SamplingPeriodTable } from 'features/surveys/sampling-information/periods/table/SamplingPeriodTable';
import { SurveySitesTable } from 'features/surveys/view/components/sampling-data/components/SurveySitesTable';
import { SurveyTechniquesTable } from 'features/surveys/view/components/sampling-data/components/SurveyTechniquesTable';
import { useSurveyContext } from 'hooks/useContext';
import { useEffect, useState } from 'react';

export enum SurveySamplingView {
  TECHNIQUES = 'TECHNIQUES',
  SITES = 'SITES',
  PERIODS = 'PERIODS'
}

export const SurveySamplingTabs = () => {
  const surveyContext = useSurveyContext();

  const [activeView, setActiveView] = useState<SurveySamplingView>(SurveySamplingView.TECHNIQUES);

  useEffect(() => {
    // Refresh the data for the active view if the project or survey ID changes
    if (activeView === SurveySamplingView.TECHNIQUES) {
      surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    }
    if (activeView === SurveySamplingView.SITES) {
      surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  useEffect(() => {
    // Load the data initially once per tab, if/when the active view changes
    if (activeView === SurveySamplingView.TECHNIQUES) {
      surveyContext.techniqueDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
    }
    if (activeView === SurveySamplingView.SITES) {
      surveyContext.sampleSiteDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
    }
  }, [
    activeView,
    surveyContext.techniqueDataLoader,
    surveyContext.sampleSiteDataLoader,
    surveyContext.projectId,
    surveyContext.surveyId
  ]);

  const techniquesCount = surveyContext.techniqueDataLoader.data?.count;
  const sampleSitesCount = surveyContext.sampleSiteDataLoader.data?.sampleSites.length;
  const samplePeriodsCount = surveyContext.sampleSiteDataLoader.data?.sampleSites.reduce(
    (acc, site) => acc + site.sample_methods.reduce((acc, method) => acc + method.sample_periods.length, 0),
    0
  );

  return (
    <>
      <Box p={2} display="flex" flexDirection="row" justifyContent="space-between">
        <ToggleButtonGroup
          value={activeView}
          onChange={(_, view) => {
            if (!view) {
              // An active view must be selected at all times
              return;
            }

            setActiveView(view);
          }}
          exclusive
          sx={{
            display: 'flex',
            gap: 1,
            '& Button': {
              py: 0.25,
              px: 1.5,
              border: 'none',
              borderRadius: '4px !important',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.02rem'
            }
          }}>
          <ToggleButton
            key="sampling-techniques-view"
            component={Button}
            color="primary"
            startIcon={<Icon path={mdiAutoFix} size={0.75} />}
            value={SurveySamplingView.TECHNIQUES}>
            {`${SurveySamplingView.TECHNIQUES} (${techniquesCount ?? 0})`}
          </ToggleButton>
          <ToggleButton
            key="sampling-sites-view"
            component={Button}
            color="primary"
            startIcon={<Icon path={mdiMapMarker} size={0.75} />}
            value={SurveySamplingView.SITES}>
            {`${SurveySamplingView.SITES} (${sampleSitesCount ?? 0})`}
          </ToggleButton>
          <ToggleButton
            key="sampling-sites-view"
            component={Button}
            color="primary"
            startIcon={<Icon path={mdiCalendarRange} size={0.75} />}
            value={SurveySamplingView.PERIODS}>
            {`${SurveySamplingView.PERIODS} (${samplePeriodsCount ?? 0})`}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box px={2} py={0.5}>
        {activeView === SurveySamplingView.TECHNIQUES && (
          <Box position="relative">
            <LoadingGuard
              isLoading={surveyContext.techniqueDataLoader.isLoading || !surveyContext.techniqueDataLoader.isReady}
              fallback={<SkeletonTable />}
              delay={200}>
              <SurveyTechniquesTable techniques={surveyContext.techniqueDataLoader.data} />
            </LoadingGuard>
          </Box>
        )}

        {activeView === SurveySamplingView.SITES && (
          <Box position="relative">
            <LoadingGuard
              isLoading={surveyContext.sampleSiteDataLoader.isLoading || !surveyContext.sampleSiteDataLoader.isReady}
              fallback={<SkeletonTable />}
              delay={200}>
              <SurveySitesTable sites={surveyContext.sampleSiteDataLoader.data} />
            </LoadingGuard>
          </Box>
        )}

        {activeView === SurveySamplingView.PERIODS && (
          <Box position="relative">
            <LoadingGuard
              isLoading={surveyContext.sampleSiteDataLoader.isLoading || !surveyContext.sampleSiteDataLoader.isReady}
              fallback={<SkeletonTable />}
              delay={200}>
              <SamplingPeriodTable sites={surveyContext.sampleSiteDataLoader.data} />
            </LoadingGuard>
          </Box>
        )}
      </Box>
    </>
  );
};
