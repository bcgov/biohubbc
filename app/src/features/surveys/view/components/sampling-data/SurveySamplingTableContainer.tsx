import { mdiAutoFix, mdiCalendarRange, mdiMapMarker } from '@mdi/js';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { SamplingPeriodTable } from 'features/surveys/sampling-information/periods/table/SamplingPeriodTable';
import { SurveyTechniquesCardContainer } from 'features/surveys/view/components/sampling-data/components/technique/SurveyTechniqueCardContainer';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { SurveySitesTable } from './components/site/SurveySitesTable';
import { SurveySamplingHeader } from './components/SurveySamplingHeader';

const pageSizeOptions = [10, 25, 50];

export enum SurveySamplingView {
  TECHNIQUES = 'TECHNIQUES',
  SITES = 'SITES',
  PERIODS = 'PERIODS'
}

export const SurveySamplingTableContainer = () => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  const [activeView, setActiveView] = useState<SurveySamplingView>(SurveySamplingView.TECHNIQUES);

  const views = [
    { value: SurveySamplingView.TECHNIQUES, label: 'Techniques', icon: mdiAutoFix },
    { value: SurveySamplingView.SITES, label: 'Sampling Sites', icon: mdiMapMarker },
    { value: SurveySamplingView.PERIODS, label: 'Sampling Periods', icon: mdiCalendarRange }
  ];

  // Pagination and sorting for techniques
  const [techniquesPaginationModel, setTechniquesPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [techniquesSortModel, setTechniquesSortModel] = useState<GridSortModel>([]);

  // Pagination and sorting for sites
  const [sitesPaginationModel, setSitesPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sitesSortModel, setSitesSortModel] = useState<GridSortModel>([]);

  // Pagination and sorting for periods
  const [periodsPaginationModel, setPeriodsPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [periodsSortModel, setPeriodsSortModel] = useState<GridSortModel>([]);

  // Sampling sites data loader and pagination
  const samplingSitesDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.findSampleSites(
      {
        survey_id: surveyContext.surveyId
      },
      pagination
    )
  );
  const sitesPagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(sitesSortModel);
    return {
      limit: sitesPaginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: sitesPaginationModel.page + 1
    };
  }, [sitesSortModel, sitesPaginationModel]);

  // Sampling periods data loader and pagination
  const samplingPeriodsDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.findSamplePeriods(
      {
        survey_id: surveyContext.surveyId
      },
      pagination
    )
  );
  const periodsPagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(periodsSortModel);
    return {
      limit: periodsPaginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: periodsPaginationModel.page + 1
    };
  }, [periodsSortModel, periodsPaginationModel]);

  // Refresh data if there is data
  useEffect(() => {
    if (
      activeView === SurveySamplingView.TECHNIQUES &&
      Number(surveyContext.techniqueDataLoader.data?.pagination.total) !== 0
    ) {
      surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    }
    if (
      [SurveySamplingView.SITES, SurveySamplingView.PERIODS].includes(activeView) &&
      Number(samplingSitesDataLoader.data?.pagination.total) !== 0
    ) {
      samplingSitesDataLoader.refresh(sitesPagination);
    }
    if (
      activeView === SurveySamplingView.PERIODS &&
      Number(surveyContext.techniqueDataLoader.data?.pagination.total) !== 0
    ) {
      samplingPeriodsDataLoader.refresh(periodsPagination);
    }
    // Including data loaders in the dependency cause infinite reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, sitesPagination]);

  const techniques = surveyContext.techniqueDataLoader.data?.techniques ?? [];
  const sampleSites = useMemo(() => samplingSitesDataLoader.data?.sites ?? [], [samplingSitesDataLoader.data?.sites]);
  const samplePeriods = useMemo(
    () =>
      samplingPeriodsDataLoader.data?.periods.map((item) => {
        return {
          id: item.survey_sample_period_id,
          sample_site: item.sample_site.name,
          sample_method: item.method_technique.name,
          method_response_metric_id: item.sample_method.method_response_metric_id,
          start_date: item.start_date,
          end_date: item.end_date,
          start_time: item.start_time,
          end_time: item.end_time
        };
      }) ?? [],
    [samplingPeriodsDataLoader.data?.periods]
  );

  return (
    <Box>
      <SurveySamplingHeader />

      <Divider />

      <Stack display="flex" direction="row" height="400px">
        <Box flex="0 0 auto" flexDirection="column" justifyContent="space-between" p={2} width="250px">
          <CustomToggleButtonGroup views={views} activeView={activeView} onViewChange={setActiveView} />
        </Box>

        <Divider flexItem orientation="vertical" />

        <Box display="flex" flex="1 1 auto" position="relative">
          {activeView === SurveySamplingView.TECHNIQUES && (
            <LoadingGuard
              isLoading={
                !surveyContext.techniqueDataLoader.data &&
                (surveyContext.techniqueDataLoader.isLoading || !surveyContext.techniqueDataLoader.isReady)
              }
              isLoadingFallback={
                <Box width="100%" height="100%">
                  <SkeletonTable />
                </Box>
              }
              isLoadingFallbackDelay={100}
              hasNoData={!techniques.length}
              hasNoDataFallback={
                <NoDataOverlay
                  height="100%"
                  width="100%"
                  title="Add Techniques"
                  subtitle="Techniques describe how you collected species observations"
                />
              }
              hasNoDataFallbackDelay={100}>
              <Box position="absolute" height="100%" width="100%">
                <SurveyTechniquesCardContainer
                  techniques={techniques}
                  paginationModel={techniquesPaginationModel}
                  setPaginationModel={setTechniquesPaginationModel}
                  sortModel={techniquesSortModel}
                  setSortModel={setTechniquesSortModel}
                  rowCount={surveyContext.techniqueDataLoader.data?.pagination.total ?? 0}
                />
              </Box>
            </LoadingGuard>
          )}

          {activeView === SurveySamplingView.SITES && (
            <LoadingGuard
              isLoading={
                !samplingSitesDataLoader.data && (samplingSitesDataLoader.isLoading || !samplingSitesDataLoader.isReady)
              }
              isLoadingFallback={
                <Box width="100%" height="100%">
                  <SkeletonTable />
                </Box>
              }
              isLoadingFallbackDelay={100}
              hasNoData={!sampleSites.length}
              hasNoDataFallback={
                <NoDataOverlay
                  height="100%"
                  width="100%"
                  title="Add Sampling Sites"
                  subtitle="Apply your techniques to sampling sites to show where you collected data"
                />
              }
              hasNoDataFallbackDelay={100}>
              <Box position="absolute" height="100%" width="100%">
                <SurveySitesTable
                  sites={sampleSites}
                  paginationModel={sitesPaginationModel}
                  setPaginationModel={setSitesPaginationModel}
                  sortModel={sitesSortModel}
                  setSortModel={setSitesSortModel}
                  rowCount={samplingSitesDataLoader.data?.pagination.total ?? 0}
                />
              </Box>
            </LoadingGuard>
          )}

          {/* TODO: Add pagination to the survey periods request */}
          {activeView === SurveySamplingView.PERIODS && (
            <LoadingGuard
              isLoading={
                !samplingPeriodsDataLoader.data &&
                (samplingPeriodsDataLoader.isLoading || !samplingPeriodsDataLoader.isReady)
              }
              isLoadingFallback={
                <Box width="100%" height="100%">
                  <SkeletonTable />
                </Box>
              }
              isLoadingFallbackDelay={100}
              hasNoData={!samplePeriods.length}
              hasNoDataFallback={
                <NoDataOverlay
                  height="100%"
                  width="100%"
                  title="Add Periods"
                  subtitle="Add periods when you create sampling sites to show when you collected species observations"
                />
              }
              hasNoDataFallbackDelay={100}>
              <Box position="absolute" height="100%" width="100%">
                <SamplingPeriodTable
                  periods={samplePeriods}
                  paginationModel={periodsPaginationModel}
                  setPaginationModel={setPeriodsPaginationModel}
                  sortModel={periodsSortModel}
                  setSortModel={setPeriodsSortModel}
                  rowCount={samplingPeriodsDataLoader.data?.pagination.total ?? 0}
                />
              </Box>
            </LoadingGuard>
          )}
        </Box>
      </Stack>
    </Box>
  );
};
