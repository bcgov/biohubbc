import { Box, Divider } from '@mui/material';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { ISamplingSitePeriodRowData } from 'features/surveys/sampling-information/periods/table/SamplingPeriodTable';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { SurveyPeriodsTable } from './components/period/SurveyPeriodsTable';
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

  // TODO: Add pagination to the techniquesDataLoader call and move techniqueDataLoader out of the context
  useEffect(() => {
    if (activeView === SurveySamplingView.TECHNIQUES) {
      surveyContext.techniqueDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
    }
  }, [activeView, surveyContext.techniqueDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  const techniques = surveyContext.techniqueDataLoader.data?.techniques ?? [];

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

  useEffect(() => {
    if (activeView === SurveySamplingView.SITES) {
      samplingSitesDataLoader.refresh(sitesPagination);
    }
  }, [activeView, sitesPagination]);

  const sampleSites = samplingSitesDataLoader.data?.sampleSites ?? [];

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
      <Box px={2} position="relative">
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
          <Box height="400px">
            <LoadingGuard
              isLoading={samplingSitesDataLoader.isLoading || !samplingSitesDataLoader.isReady}
              isLoadingFallback={<SkeletonTable />}
              isLoadingFallbackDelay={100}
              hasNoData={!sampleSites.length}
              hasNoDataFallback={
                <NoDataOverlay
                  height="200px"
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
          </Box>
        )}

        {/* TODO: Add pagination to the survey periods request */}
        {activeView === SurveySamplingView.PERIODS && (
          <SurveyPeriodsTable
            periods={samplePeriods}
            isLoading={samplingSitesDataLoader.isLoading || !samplingSitesDataLoader.isReady}
            hasNoData={!samplePeriods.length}
          />
        )}
      </Box>
    </>
  );
};
