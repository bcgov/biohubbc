import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import {
  ISamplingSitePeriodRowData,
  SamplingPeriodTable
} from 'features/surveys/sampling-information/periods/table/SamplingPeriodTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { SurveySitesTable } from './components/site/SurveySitesTable';
import { SurveySamplingHeader } from './components/SurveySamplingHeader';
import { SurveyTechniquesTable } from './components/technique/SurveyTechniquesTable';
import { SurveySamplingViewTabs } from './components/view/SurveySamplingView';

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

  // Sampling sites data loader and pagination
  const samplingSitesDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.getSampleSites(surveyContext.projectId, surveyContext.surveyId, pagination)
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

  // Refresh data if there is data
  useEffect(() => {
    if (
      [SurveySamplingView.SITES, SurveySamplingView.PERIODS].includes(activeView) &&
      Number(samplingSitesDataLoader.data?.pagination.total) !== 0
    ) {
      samplingSitesDataLoader.refresh(sitesPagination);
    }
    if (
      activeView === SurveySamplingView.TECHNIQUES &&
      Number(surveyContext.techniqueDataLoader.data?.pagination.total) !== 0
    ) {
      surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    }
    // Including data loaders in the dependency cause infinite reloads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, sitesPagination]);

  const sampleSites = useMemo(() => samplingSitesDataLoader.data?.sampleSites ?? [], [samplingSitesDataLoader.data]);
  const techniques = surveyContext.techniqueDataLoader.data?.techniques ?? [];

  const samplePeriods: ISamplingSitePeriodRowData[] = useMemo(() => {
    const data: ISamplingSitePeriodRowData[] = [];
    for (const site of sampleSites) {
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
  }, [sampleSites]);

  return (
    <>
      <SurveySamplingHeader />
      <Divider />
      <SurveySamplingViewTabs activeView={activeView} setActiveView={setActiveView} />
      <Divider />
      <Box px={2} position="relative" height="400px">
        {activeView === SurveySamplingView.TECHNIQUES && (
          <LoadingGuard
            isLoading={surveyContext.techniqueDataLoader.isLoading || !surveyContext.techniqueDataLoader.isReady}
            isLoadingFallback={<SkeletonTable />}
            isLoadingFallbackDelay={100}
            hasNoData={!techniques.length}
            hasNoDataFallback={
              <NoDataOverlay
                height="100%"
                title="Add Techniques"
                subtitle="Techniques describe how you collected species observations"
              />
            }>
            <SurveyTechniquesTable
              techniques={techniques}
              paginationModel={techniquesPaginationModel}
              setPaginationModel={setTechniquesPaginationModel}
              sortModel={techniquesSortModel}
              setSortModel={setTechniquesSortModel}
              rowCount={surveyContext.techniqueDataLoader.data?.pagination.total ?? 0}
            />
          </LoadingGuard>
        )}

        {activeView === SurveySamplingView.SITES && (
          <LoadingGuard
            isLoading={samplingSitesDataLoader.isLoading || !samplingSitesDataLoader.isReady}
            isLoadingFallback={<SkeletonTable />}
            isLoadingFallbackDelay={100}
            hasNoData={!sampleSites.length}
            hasNoDataFallback={
              <NoDataOverlay
                height="100%"
                title="Add Sampling Sites"
                subtitle="Apply your techniques to sampling sites to show where you collected data"
              />
            }>
            <SurveySitesTable
              sites={sampleSites}
              paginationModel={sitesPaginationModel}
              setPaginationModel={setSitesPaginationModel}
              sortModel={sitesSortModel}
              setSortModel={setSitesSortModel}
              rowCount={samplingSitesDataLoader.data?.pagination.total ?? 0}
            />
          </LoadingGuard>
        )}

        {/* TODO: Add pagination to the survey periods request */}
        {activeView === SurveySamplingView.PERIODS && (
          <LoadingGuard
            isLoading={samplingSitesDataLoader.isLoading || !samplingSitesDataLoader.isReady}
            isLoadingFallback={<SkeletonTable />}
            isLoadingFallbackDelay={100}
            hasNoData={!samplePeriods.length}
            hasNoDataFallback={
              <NoDataOverlay
                height="100%"
                title="Add Periods"
                subtitle="Add periods when you create sampling sites to show when you collected species observations"
              />
            }>
            <SamplingPeriodTable periods={samplePeriods} />
          </LoadingGuard>
        )}
      </Box>
    </>
  );
};
