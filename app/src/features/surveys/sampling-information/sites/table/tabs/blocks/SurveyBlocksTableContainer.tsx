import { mdiArrowTopRight } from '@mdi/js';
import { GridPaginationModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import CustomToggleButtonGroupMulti from 'components/toolbar/CustomToggleButtonGroupMulti';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SetStateAction, useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';

const pageSizeOptions = [10, 25, 50];

export interface IBlockPeriodRowData {
  id: number;
  block_name: string;
  sample_method: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
}

interface ISurveyBlocksTableContainerProps {
  selectedRows: GridRowSelectionModel;
  setSelectedRows: React.Dispatch<SetStateAction<GridRowSelectionModel>>;
  refreshKey?: number;
}

/**
 * Container for a table of survey blocks with edit actions, controlling data requests and pagination
 *
 * @param {ISurveyBlocksTableContainerProps} props
 * @returns {*}
 */
export const SurveyBlocksTableContainer = (props: ISurveyBlocksTableContainerProps) => {
  // const { selectedRows, setSelectedRows } = props;
  const [selectedBlocks, setSelectedBlocks] = useState<number[]>([]);

  const biohubApi = useBiohubApi();
  const surveyContext = useSurveyContext();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const blocksDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.block.getSurveyBlocks(surveyContext.projectId, surveyContext.surveyId, { pagination })
  );

  const pagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(sortModel);

    return {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: paginationModel.page + 1 // Adjust for API pagination starting at 1
    };
  }, [sortModel, paginationModel]);

  useEffect(() => {
    blocksDataLoader.refresh(pagination);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, props.refreshKey]);

  const blocks = useMemo(() => blocksDataLoader.data?.blocks ?? [], [blocksDataLoader.data]);

  const handleDelete = async (blockId: number) => {
    await biohubApi.block.deleteBlocks(surveyContext.projectId, surveyContext.surveyId, [blockId]);
    blocksDataLoader.refresh(pagination);
  };

  console.log(setPaginationModel, setSortModel, handleDelete);
  return (
    <LoadingGuard
      isLoading={!blocksDataLoader.data && (blocksDataLoader.isLoading || !blocksDataLoader.isReady)}
      isLoadingFallback={<SkeletonTable />}
      isLoadingFallbackDelay={100}
      hasNoData={!blocks.length}
      hasNoDataFallback={
        <NoDataOverlay
          height="100%"
          title="Add Clusters"
          subtitle="Clusters let you group related sampling sites"
          icon={mdiArrowTopRight}
        />
      }
      hasNoDataFallbackDelay={100}>
        <CustomToggleButtonGroupMulti
          activeViews={selectedBlocks}
          views={
            blocksDataLoader.data?.blocks.map((block) => ({ value: block.survey_block_id, label: block.name })) ?? []
          }
          onViewChange={(blockIds) => setSelectedBlocks(blockIds.map(Number))}
          orientation="vertical"
        />
    </LoadingGuard>
  );
};
