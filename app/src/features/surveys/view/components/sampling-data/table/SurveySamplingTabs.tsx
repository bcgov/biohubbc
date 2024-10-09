import { mdiArrowTopRight, mdiAutoFix, mdiCalendarRange, mdiMapMarker } from '@mdi/js';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import {
  ISamplingSitePeriodRowData,
  SamplingPeriodTable
} from 'features/surveys/sampling-information/periods/table/SamplingPeriodTable';
import {
  ISurveySitesRowData,
  SurveySitesTable
} from 'features/surveys/view/components/sampling-data/components/SurveySitesTable';
import { useSurveyContext } from 'hooks/useContext';
import { useEffect, useMemo, useState } from 'react';
import { SurveyTechniquesCardContainer } from './technique/SurveyTechniqueCardContainer';

export enum SurveySamplingView {
  TECHNIQUES = 'TECHNIQUES',
  SITES = 'SITES',
  PERIODS = 'PERIODS'
}

export const SurveySamplingTabs = () => {
  const surveyContext = useSurveyContext();

  const [activeView, setActiveView] = useState<SurveySamplingView>(SurveySamplingView.TECHNIQUES);

  const views = [
    { value: SurveySamplingView.TECHNIQUES, label: 'Techniques', icon: mdiAutoFix },
    { value: SurveySamplingView.SITES, label: 'Sampling Sites', icon: mdiMapMarker },
    { value: SurveySamplingView.PERIODS, label: 'Sampling Periods', icon: mdiCalendarRange }
  ];

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
    <Stack direction="row">
      <Box p={2} display="flex" flexDirection="row" justifyContent="space-between" minWidth="250px">
        <CustomToggleButtonGroup views={views} activeView={activeView} onViewChange={setActiveView} />
      </Box>

      <Divider flexItem orientation="vertical" />

      <Box p={2} flex="1 1 auto">
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
              <SurveyTechniquesCardContainer techniques={surveyContext.techniqueDataLoader.data?.techniques ?? []} />
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
    </Stack>
  );
};
