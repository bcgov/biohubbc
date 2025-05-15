import { mdiArrowTopRight, mdiAutoFix, mdiCalendarRange, mdiMapMarker } from '@mdi/js';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { SurveyPeriodsTable } from 'features/surveys/view/survey-sampling/components/period/SurveyPeriodsTable';
import { SurveyTechniquesCardContainer } from 'features/surveys/view/survey-sampling/components/technique/SurveyTechniqueCardContainer';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { SurveySitesTable } from './components/site/SurveySitesTable';
import { SurveySamplingHeader } from './components/SurveySamplingHeader';

const pageSizeOptions = [10, 25, 50];

// The different views (tabs) for the Sampling Information section
export enum SurveySamplingView {
  TECHNIQUES = 'TECHNIQUES',
  SITES = 'SITES',
  PERIODS = 'PERIODS'
}

/**
 * Wrapping component for the Sampling Information section, for the Survey page.
 *
 * @return {*}
 */
export const SurveySamplingTableContainer = () => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  // Views
  const [activeView, setActiveView] = useState<SurveySamplingView>(SurveySamplingView.TECHNIQUES);

  const views = [
    { value: SurveySamplingView.TECHNIQUES, label: 'Techniques', icon: mdiAutoFix },
    { value: SurveySamplingView.SITES, label: 'Sampling Sites', icon: mdiMapMarker },
    { value: SurveySamplingView.PERIODS, label: 'Sampling Periods', icon: mdiCalendarRange }
  ];

  // Techniques
  const [techniquesPaginationModel, setTechniquesPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });

  const [techniquesSortModel, setTechniquesSortModel] = useState<GridSortModel>([]);

  const techniquesPagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(techniquesSortModel);
    return {
      limit: techniquesPaginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: techniquesPaginationModel.page + 1
    };
  }, [techniquesSortModel, techniquesPaginationModel]);

  const techniquesDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.technique.getTechniquesForSurvey(surveyContext.surveyId, pagination)
  );

  // Sites
  const [sitesPaginationModel, setSitesPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });

  const [sitesSortModel, setSitesSortModel] = useState<GridSortModel>([]);

  const sitesPagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(sitesSortModel);
    return {
      limit: sitesPaginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: sitesPaginationModel.page + 1
    };
  }, [sitesSortModel, sitesPaginationModel]);

  const samplingSitesDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.findSampleSites({ survey_id: surveyContext.surveyId }, pagination)
  );

  // Periods
  const [periodsPaginationModel, setPeriodsPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });

  const [periodsSortModel, setPeriodsSortModel] = useState<GridSortModel>([]);

  const periodsPagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(periodsSortModel);
    return {
      limit: periodsPaginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: periodsPaginationModel.page + 1
    };
  }, [periodsSortModel, periodsPaginationModel]);

  const samplingPeriodsDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingPeriod.findSamplePeriods({ survey_id: surveyContext.surveyId }, pagination)
  );

  useEffect(() => {
    // Refresh active view data loader when switching to the view for the first time
    if (activeView === SurveySamplingView.TECHNIQUES && !techniquesDataLoader.data) {
      techniquesDataLoader.load(techniquesPagination);
    }

    if (activeView === SurveySamplingView.SITES && !samplingSitesDataLoader.data) {
      samplingSitesDataLoader.refresh(sitesPagination);
    }

    if (activeView === SurveySamplingView.PERIODS && !samplingPeriodsDataLoader.data) {
      samplingPeriodsDataLoader.refresh(periodsPagination);
    }
    // Including data loaders in the dependency array causes infinite reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  useEffect(() => {
    if (activeView === SurveySamplingView.TECHNIQUES && Number(techniquesDataLoader.data?.pagination.total) !== 0) {
      techniquesDataLoader.refresh(techniquesPagination);
    }
    // Including data loaders in the dependency array causes infinite reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [techniquesPagination]);

  useEffect(() => {
    if (activeView === SurveySamplingView.SITES && Number(samplingSitesDataLoader.data?.pagination.total) !== 0) {
      samplingSitesDataLoader.refresh(sitesPagination);
    }
    // Including data loaders in the dependency array causes infinite reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sitesPagination]);

  useEffect(() => {
    if (activeView === SurveySamplingView.PERIODS && Number(samplingPeriodsDataLoader.data?.pagination.total) !== 0) {
      samplingPeriodsDataLoader.refresh(periodsPagination);
    }
    // Including data loaders in the dependency array causes infinite reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodsPagination]);

  // Data
  const techniques = techniquesDataLoader.data?.techniques ?? [];
  const techniquesCount = techniquesDataLoader.data?.pagination.total ?? 0;

  const sampleSites = samplingSitesDataLoader.data?.sites ?? [];
  const sampleSitesCount = samplingSitesDataLoader.data?.pagination.total ?? 0;

  const samplePeriods = samplingPeriodsDataLoader.data?.periods ?? [];
  const samplePeriodsCount = samplingPeriodsDataLoader.data?.pagination ?? 0;

  return (
    <Box>
      <SurveySamplingHeader />

      <Divider />

      <Stack display="flex" direction="row" height="400px">
        <Box flex="0 0 auto" flexDirection="column" justifyContent="space-between" p={2} width="250px">
          <CustomToggleButtonGroup
            views={views}
            activeView={activeView}
            onViewChange={setActiveView}
            orientation="vertical"
          />
        </Box>

        <Divider flexItem orientation="vertical" />

        <Box display="flex" flex="1 1 auto" position="relative">
          {activeView === SurveySamplingView.TECHNIQUES && (
            <LoadingGuard
              isLoading={
                !techniquesDataLoader.data && (techniquesDataLoader.isLoading || !techniquesDataLoader.isReady)
              }
              isLoadingFallback={
                <Box width="100%" height="100%">
                  <SkeletonTable />
                </Box>
              }
              isLoadingFallbackDelay={100}
              hasNoData={!techniquesCount}
              hasNoDataFallback={
                <NoDataOverlay
                  minHeight="400px"
                  height="100%"
                  width="100%"
                  title="Add Techniques"
                  subtitle="Techniques describe how you collected species observations"
                  icon={mdiArrowTopRight}
                />
              }
              hasNoDataFallbackDelay={100}>
              <Box display="flex" flexDirection="column" width="100%">
                <SurveyTechniquesCardContainer
                  techniques={techniques}
                  paginationModel={techniquesPaginationModel}
                  setPaginationModel={setTechniquesPaginationModel}
                  sortModel={techniquesSortModel}
                  setSortModel={setTechniquesSortModel}
                  rowCount={techniquesDataLoader.data?.pagination.total ?? 0}
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
              hasNoData={!sampleSitesCount}
              hasNoDataFallback={
                <NoDataOverlay
                  minHeight="400px"
                  height="100%"
                  width="100%"
                  title="Add Sampling Sites"
                  subtitle="Apply your techniques to sampling sites to show where you collected data"
                  icon={mdiArrowTopRight}
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

          {/* TODO: Add pagination to the survey periods request? */}
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
              hasNoData={!samplePeriodsCount}
              hasNoDataFallback={
                <NoDataOverlay
                  minHeight="400px"
                  height="100%"
                  width="100%"
                  title="Add Periods"
                  subtitle="Add periods when you create sampling sites to show when you collected species observations"
                  icon={mdiArrowTopRight}
                />
              }
              hasNoDataFallbackDelay={100}>
              <Box height="100%" width="100%">
                <SurveyPeriodsTable
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
