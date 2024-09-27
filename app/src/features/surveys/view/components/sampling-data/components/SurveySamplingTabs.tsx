import { mdiArrowTopRight, mdiAutoFix, mdiCalendarRange, mdiMapMarker } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import {
  ISamplingSitePeriodRowData,
  SamplingPeriodTable
} from 'features/surveys/sampling-information/periods/table/SamplingPeriodTable';
import {
  ISurveySitesRowData,
  SurveySitesTable
} from 'features/surveys/view/components/sampling-data/components/SurveySitesTable';
import {
  ISurveyTechniqueRowData,
  SurveyTechniquesTable
} from 'features/surveys/view/components/sampling-data/components/SurveyTechniquesTable';
import { useSurveyContext } from 'hooks/useContext';
import { useEffect, useMemo, useState } from 'react';

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

  const techniques: ISurveyTechniqueRowData[] =
    surveyContext.techniqueDataLoader.data?.techniques.map((technique) => ({
      id: technique.method_technique_id,
      name: technique.name,
      method_lookup_id: technique.method_lookup_id,
      description: technique.description,
      attractants: technique.attractants,
      distance_threshold: technique.distance_threshold
    })) ?? [];

  const sampleSites: ISurveySitesRowData[] = useMemo(
    () =>
      surveyContext.sampleSiteDataLoader.data?.sampleSites.map((site) => ({
        id: site.survey_sample_site_id,
        name: site.name,
        description: site.description,
        geojson: site.geojson,
        blocks: site.blocks.map((block) => block.name),
        stratums: site.stratums.map((stratum) => stratum.name)
      })) ?? [],
    [surveyContext.sampleSiteDataLoader.data?.sampleSites]
  );

  const samplePeriods: ISamplingSitePeriodRowData[] = useMemo(() => {
    const data: ISamplingSitePeriodRowData[] = [];

    for (const site of surveyContext.sampleSiteDataLoader.data?.sampleSites ?? []) {
      for (const method of site.sample_methods) {
        for (const period of method.sample_periods) {
          data.push({
            id: period.survey_sample_period_id,
            sample_site: site.name,
            sample_method: method.technique.name,
            method_response_metric_id: method.method_response_metric_id,
            start_date: period.start_date,
            end_date: period.end_date,
            start_time: period.start_time,
            end_time: period.end_time
          });
        }
      }
    }

    return data;
  }, [surveyContext.sampleSiteDataLoader.data?.sampleSites]);

  const techniquesCount = surveyContext.techniqueDataLoader.data?.count;
  const sampleSitesCount = surveyContext.sampleSiteDataLoader.data?.sampleSites.length;
  const samplePeriodsCount = samplePeriods.length;

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

      <Divider />

      <Box px={2} position="relative">
        {activeView === SurveySamplingView.TECHNIQUES && (
          <>
            <LoadingGuard
              isLoading={surveyContext.techniqueDataLoader.isLoading || !surveyContext.techniqueDataLoader.isReady}
              isLoadingFallback={<SkeletonTable />}
              isLoadingFallbackDelay={100}
              hasNoData={!techniquesCount}
              hasNoDataFallback={
                <NoDataOverlay
                  height="250px"
                  title="Add Techniques"
                  subtitle="Techniques describe how you collected species observations"
                  icon={mdiArrowTopRight}
                />
              }
              hasNoDataFallbackDelay={100}>
              <SurveyTechniquesTable techniques={techniques} />
            </LoadingGuard>
          </>
        )}

        {activeView === SurveySamplingView.SITES && (
          <>
            <LoadingGuard
              isLoading={surveyContext.sampleSiteDataLoader.isLoading || !surveyContext.sampleSiteDataLoader.isReady}
              isLoadingFallback={<SkeletonTable />}
              isLoadingFallbackDelay={100}
              hasNoData={!sampleSitesCount}
              hasNoDataFallback={
                <NoDataOverlay
                  height="250px"
                  title="Add Sampling Sites"
                  subtitle="Apply your techniques to sampling sites to show where you collected data"
                  icon={mdiArrowTopRight}
                />
              }
              hasNoDataFallbackDelay={100}>
              <SurveySitesTable sites={sampleSites} />
            </LoadingGuard>
          </>
        )}

        {activeView === SurveySamplingView.PERIODS && (
          <>
            <LoadingGuard
              isLoading={surveyContext.sampleSiteDataLoader.isLoading || !surveyContext.sampleSiteDataLoader.isReady}
              isLoadingFallback={<SkeletonTable />}
              isLoadingFallbackDelay={100}
              hasNoData={!samplePeriodsCount}
              hasNoDataFallback={
                <NoDataOverlay
                  height="250px"
                  title="Add Periods"
                  subtitle="Add periods when you create sampling sites to show when 
                  you collected species observations"
                  icon={mdiArrowTopRight}
                />
              }
              hasNoDataFallbackDelay={100}>
              <SamplingPeriodTable periods={samplePeriods} />
            </LoadingGuard>
          </>
        )}
      </Box>
    </>
  );
};
