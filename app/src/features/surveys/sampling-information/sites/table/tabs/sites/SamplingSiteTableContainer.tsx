import { mdiArrowTopRight } from '@mdi/js';
import { GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SetStateAction, useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import { SamplingSiteTable } from './SamplingSiteTable';

const pageSizeOptions = [10, 25, 50];

export interface ISamplingSitePeriodRowData {
  id: number;
  sample_site: string;
  sample_method: string;
  method_response_metric_id: number;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
}

interface ISamplingSiteTableContainerProps {
  selectedRows: GridRowSelectionModel;
  setSelectedRows: React.Dispatch<SetStateAction<GridRowSelectionModel>>;
  refreshKey?: number;
}

/**
 * Container for a table of sampling sites with edit actions, controlling data requests and pagination
 *
 * @param {ISamplingSiteTableContainerProps} props
 * @returns {*}
 */
export const SamplingSiteTableContainer = (props: ISamplingSiteTableContainerProps) => {
  const { selectedRows, setSelectedRows } = props;

  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const samplingSitesDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.getSampleSites(surveyContext.projectId, surveyContext.surveyId, { pagination })
  );

  const pagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(sortModel);

    return {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,

      // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
      page: paginationModel.page + 1
    };
  }, [sortModel, paginationModel]);

  // Refresh survey list when pagination or sort changes
  useEffect(() => {
    samplingSitesDataLoader.refresh(pagination);

    // Adding a DataLoader as a dependency causes an infinite rerender loop if a useEffect calls `.refresh`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, props.refreshKey]);

  const sampleSites = useMemo(() => samplingSitesDataLoader.data?.sampleSites ?? [], [samplingSitesDataLoader.data]);

  const handleDelete = async (sampleSiteId: number) => {
    await biohubApi.samplingSite.deleteSampleSite(surveyContext.projectId, surveyContext.surveyId, sampleSiteId);
    samplingSitesDataLoader.refresh(pagination); // Refresh data
  };

  return (
    <LoadingGuard
      isLoading={
        !samplingSitesDataLoader.data && (samplingSitesDataLoader.isLoading || !samplingSitesDataLoader.isReady)
      }
      isLoadingFallback={<SkeletonTable />}
      isLoadingFallbackDelay={100}
      hasNoData={!sampleSites.length}
      hasNoDataFallback={
        <NoDataOverlay
          height="100%"
          title="Add Sampling Sites"
          subtitle="Apply your techniques to sampling sites to show where you collected data"
          icon={mdiArrowTopRight}
        />
      }
      hasNoDataFallbackDelay={100}>
      <SamplingSiteTable
        sites={sampleSites}
        paginationModel={paginationModel}
        setPaginationModel={setPaginationModel}
        sortModel={sortModel}
        setSortModel={setSortModel}
        rowCount={samplingSitesDataLoader.data?.pagination.total ?? 0}
        pageSizeOptions={pageSizeOptions}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        onDelete={handleDelete}
      />
    </LoadingGuard>
  );
};
