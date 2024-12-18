import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { IFindTelementryObj } from 'interfaces/useTelemetryApi.interface';
import { useState } from 'react';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import {
  IAllTelemetryAdvancedFilters,
  TelemetryAdvancedFiltersInitialValues,
  TelemetryListFilterForm
} from './TelemetryListFilterForm';

// Supported URL parameters
// Note: Prefix 't_' is used to avoid conflicts with similar query params from other components
type TelemetryDataTableURLParams = {
  // filter
  t_keyword?: string;
  t_itis_tsn?: string;
  t_start_date?: string;
  t_end_date?: string;
  t_system_user_id?: number;
  // pagination
  t_page?: string;
  t_limit?: string;
  t_sort?: string;
  t_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

interface IAllTelemetryListContainerProps {
  showSearch: boolean;
}

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'acquisition_date',
  order: 'desc'
};

/**
 * Displays a list of telemetry.
 *
 * @return {*}
 */
const TelemetryListContainer = (props: IAllTelemetryListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();

  const { searchParams, setSearchParams } = useSearchParams<StringValues<TelemetryDataTableURLParams>>();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('t_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('t_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('t_sort') ?? initialPaginationParams.sort ?? '',
      sort: (searchParams.get('t_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IAllTelemetryAdvancedFilters>({
    keyword: searchParams.get('t_keyword') ?? TelemetryAdvancedFiltersInitialValues.keyword,
    itis_tsn: searchParams.get('t_itis_tsn')
      ? Number(searchParams.get('t_itis_tsn'))
      : TelemetryAdvancedFiltersInitialValues.itis_tsn,
    start_date: searchParams.get('t_start_date') ?? TelemetryAdvancedFiltersInitialValues.start_date,
    end_date: searchParams.get('t_end_date') ?? TelemetryAdvancedFiltersInitialValues.end_date,
    system_user_id: searchParams.get('t_system_user_id')
      ? Number(searchParams.get('t_system_user_id'))
      : TelemetryAdvancedFiltersInitialValues.system_user_id
  });

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
  };

  const telemetryDataLoader = useDataLoader(
    (pagination?: ApiPaginationRequestOptions, filter?: IAllTelemetryAdvancedFilters) =>
      biohubApi.telemetry.findTelemetry(pagination, filter)
  );

  useDeepCompareEffect(() => {
    telemetryDataLoader.refresh(paginationSort, advancedFiltersModel);
  }, [advancedFiltersModel, paginationSort]);

  const rows = telemetryDataLoader.data?.telemetry ?? [];

  const columns: GridColDef<IFindTelementryObj>[] = [
    {
      field: 'telemetry_id',
      headerName: 'ID',
      minWidth: 200,
      sortable: false,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.telemetry_id}
        </Typography>
      )
    },
    {
      field: 'device_id',
      headerName: 'Device',
      flex: 1,
      sortable: false,
      renderCell: (params) => <Typography variant="body2">{params.row.serial}</Typography>
    },
    {
      field: 'vendor',
      headerName: 'Make',
      flex: 1,
      sortable: false,
      renderCell: (params) => <Typography variant="body2">{params.row.vendor}</Typography>
    },
    {
      field: 'acquisition_date',
      headerName: 'Date',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2">
          {dayjs(params.row.acquisition_date).format(DATE_FORMAT.MediumDateTimeFormat)}
        </Typography>
      )
    },
    { field: 'latitude', headerName: 'Latitude', flex: 1, sortable: false },
    { field: 'longitude', headerName: 'Longitude', flex: 1, sortable: false }
  ];

  return (
    <>
      <Collapse in={showSearch}>
        <Box py={2} px={2}>
          <TelemetryListFilterForm
            initialValues={advancedFiltersModel}
            handleSubmit={(values) => {
              setSearchParams(
                searchParams
                  .setOrDelete('t_keyword', values.keyword)
                  .setOrDelete('t_itis_tsn', values.itis_tsn)
                  .setOrDelete('t_start_date', values.start_date)
                  .setOrDelete('t_end_date', values.end_date)
                  .setOrDelete('t_system_user_id', values.system_user_id)
              );
              setAdvancedFiltersModel(values);
            }}
          />
        </Box>
        <Divider />
      </Collapse>

      <Box height="100vh" maxHeight="800px">
        <LoadingGuard
          isLoading={!rows.length && (telemetryDataLoader.isLoading || !telemetryDataLoader.isReady)}
          isLoadingFallback={<SkeletonTable />}
          isLoadingFallbackDelay={100}
          hasNoData={!rows.length}
          hasNoDataFallback={
            <NoDataOverlay
              height="500px"
              title="Create or Join Surveys to See Telemetry Data"
              subtitle="You currently have no telemetry data. Once you create or join surveys with telemetry data, it will be displayed here"
              icon={mdiArrowTopRight}
            />
          }
          hasNoDataFallbackDelay={100}>
          <StyledDataGrid
            noRowsMessage="No telemetry found"
            loading={!rows.length && (telemetryDataLoader.isLoading || !telemetryDataLoader.isReady)}
            // Columns
            columns={columns}
            // Rows
            rows={rows}
            rowCount={telemetryDataLoader.data?.pagination.total ?? 0}
            getRowId={(row) => row.telemetry_id}
            // Pagination
            paginationMode="server"
            paginationModel={paginationModel}
            pageSizeOptions={pageSizeOptions}
            onPaginationModelChange={(model) => {
              if (!model) {
                return;
              }
              setSearchParams(searchParams.set('t_page', String(model.page)).set('t_limit', String(model.pageSize)));
              setPaginationModel(model);
            }}
            // Sorting
            sortingMode="server"
            sortModel={sortModel}
            sortingOrder={['asc', 'desc']}
            onSortModelChange={(model) => {
              if (!model.length) {
                return;
              }
              setSearchParams(searchParams.set('t_sort', model[0].field).set('t_order', model[0].sort ?? 'desc'));
              setSortModel(model);
            }}
            // Row options
            rowSelection={false}
            checkboxSelection={false}
            disableRowSelectionOnClick
            // Column options
            disableColumnSelector
            disableColumnFilter
            disableColumnMenu
            // Styling
            rowHeight={70}
            getRowHeight={() => 'auto'}
            autoHeight={false}
          />
        </LoadingGuard>
      </Box>
    </>
  );
};

export default TelemetryListContainer;
