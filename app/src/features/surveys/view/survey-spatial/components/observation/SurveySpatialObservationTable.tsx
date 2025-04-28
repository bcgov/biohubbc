import { mdiArrowTopRight } from '@mdi/js';
import { GridColDef, GridSortModel, GridValidRowModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { SurveyContext } from 'contexts/surveyContext';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect, useState } from 'react';

// Set height so the skeleton loader will match table rows
const rowHeight = 52;

interface IFlattenedObservationTableRow extends GridValidRowModel {
  observation_subcount_id: number;
  itis_tsn: number | null;
  itis_scientific_name: string | null;
  subcount: number | null;
  survey_sample_site_name: string | null;
  method_technique_name: string | null;
  survey_sample_period_start_datetime: string | null;
  observation_date: string;
  observation_time: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Component to display observation data in a table with server-side pagination and sorting.
 *
 * @returns {*}
 */
export const SurveySpatialObservationTable = () => {
  const surveyContext = useContext(SurveyContext);
  const taxonomyContext = useTaxonomyContext();

  const biohubApi = useBiohubApi();

  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const paginatedDataLoader = useDataLoader((page: number, limit: number, sort?: string, order?: 'asc' | 'desc') =>
    biohubApi.observation.getFlattenedObservationRecords(surveyContext.surveyId, {
      page: page + 1, // This fixes an off-by-one error between the front end and the back end
      limit,
      sort,
      order
    })
  );

  // Page information has changed, fetch more data
  useEffect(() => {
    if (sortModel.length > 0) {
      if (sortModel[0].sort) {
        paginatedDataLoader.refresh(page, pageSize, sortModel[0].field, sortModel[0].sort);
      }
    } else {
      paginatedDataLoader.refresh(page, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortModel]);

  const rows: IFlattenedObservationTableRow[] =
    paginatedDataLoader.data?.surveyObservations.map((item) => {
      return {
        observation_subcount_id: item.subcount.observation_subcount_id,
        itis_tsn: item.itis_tsn,
        itis_scientific_name:
          (item.itis_tsn && taxonomyContext.getCachedSpeciesTaxonomyById(item.itis_tsn)?.scientificName) || null,
        subcount: item.subcount.subcount,
        survey_sample_site_name: item.survey_sample_site_name,
        method_technique_name: item.method_technique_name,
        survey_sample_period_start_datetime: item.survey_sample_period_start_datetime,
        observation_date: dayjs(item.observation_date).format('YYYY-MM-DD'),
        observation_time: dayjs(item.observation_date).format('HH:mm:ss'),
        latitude: item.latitude,
        longitude: item.longitude
      };
    }) ?? [];

  const rowCount = paginatedDataLoader.data?.pagination.total ?? 0;

  // Define table columns
  const columns: GridColDef<IFlattenedObservationTableRow>[] = [
    {
      field: 'itis_scientific_name',
      headerName: 'Species',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => <em>{params.row.itis_scientific_name}</em>
    },
    {
      field: 'survey_sample_site_name',
      headerName: 'Sample Site',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'method_technique_name',
      headerName: 'Technique',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'survey_sample_period_start_datetime',
      headerName: 'Sample Period',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'subcount',
      headerName: 'Count',
      headerAlign: 'left',
      align: 'left',
      maxWidth: 100
    },
    {
      field: 'observation_date',
      headerName: 'Date',
      maxWidth: 120
    },
    {
      field: 'observation_time',
      headerName: 'Time',
      headerAlign: 'left',
      align: 'left',
      maxWidth: 100
    },
    {
      field: 'latitude',
      headerName: 'Lat',
      headerAlign: 'left',
      align: 'left',
      maxWidth: 100
    },
    {
      field: 'longitude',
      headerName: 'Long',
      headerAlign: 'left',
      align: 'left',
      maxWidth: 100
    }
  ];

  return (
    <LoadingGuard
      isLoading={!paginatedDataLoader.data && (paginatedDataLoader.isLoading || !paginatedDataLoader.isReady)}
      isLoadingFallback={<SkeletonTable />}
      isLoadingFallbackDelay={100}
      hasNoData={!rows.length}
      hasNoDataFallback={
        <NoDataOverlay
          height="100%"
          title="Add Observations"
          subtitle="After adding sampling information, upload observations and link them to sampling efforts"
          icon={mdiArrowTopRight}
        />
      }
      hasNoDataFallbackDelay={100}>
      <StyledDataGrid<IFlattenedObservationTableRow>
        noRowsMessage="No observation records found"
        // columns
        columns={columns}
        columnHeaderHeight={rowHeight}
        // rows
        rows={rows}
        rowCount={rowCount}
        rowHeight={rowHeight}
        rowSelection={false}
        getRowId={(row: IFlattenedObservationTableRow) => row.observation_subcount_id}
        autoHeight={false}
        // pagination
        paginationMode="server"
        paginationModel={{ pageSize, page }}
        pageSizeOptions={[10, 25, 50]}
        onPaginationModelChange={(model) => {
          setPage(model.page);
          setPageSize(model.pageSize);
        }}
        // sorting
        sortingMode="server"
        sortingOrder={['asc', 'desc']}
        sortModel={sortModel}
        onSortModelChange={(model) => setSortModel(model)}
        // misc
        checkboxSelection={false}
        disableRowSelectionOnClick
        disableColumnSelector
        disableColumnFilter
        disableColumnMenu
        disableVirtualization
        data-testid="survey-spatial-observation-data-table"
      />
    </LoadingGuard>
  );
};
