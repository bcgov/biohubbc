import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { GridColDef, GridSortDirection } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DATE_FORMAT, TIME_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import TelemetryListFilterForm, { TelemetryAdvancedFiltersInitialValues } from './TelemetryListFilterForm';

interface ITelemetryTableRow {
  id: number;
  deployment_id: string;
  latitude: number;
  longitude: number;
  acquisition_date: string;
  animal: ICritterSimpleResponse;
  device_id: string;
}

// Supported URL parameters
type TelemetryDataTableURLParams = {
  // search filter
  keyword: string;
  species: string;
  person: string;
  // pagination
  t_page: string;
  t_limit: string;
  t_sort?: string;
  t_order?: 'asc' | 'desc';
};

export interface ITelemetryAdvancedFilters {
  itis_tsns: number[];
}

const pageSizeOptions = [10, 25, 50];

interface ITelemetryListContainerProps {
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
 * Displays a list of telemtry.
 *
 * @return {*}
 */
const TelemetryListContainer = (props: ITelemetryListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();

  const { searchParams, setSearchParams } = useSearchParams<TelemetryDataTableURLParams>();

  const paginationModel = {
    pageSize: Number(searchParams.get('t_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('t_page') ?? initialPaginationParams.page)
  };

  const sortModel = [
    {
      field: searchParams.get('t_sort') ?? initialPaginationParams.sort,
      sort: (searchParams.get('t_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ];

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<ITelemetryAdvancedFilters>(
    TelemetryAdvancedFiltersInitialValues
  );

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
    page: paginationModel.page + 1
  };

  const telemetryDataLoader = useDataLoader(
    (pagination?: ApiPaginationRequestOptions, filter?: ITelemetryAdvancedFilters) =>
      biohubApi.telemetry.findTelemetry(pagination, filter)
  );

  useDeepCompareEffect(() => {
    telemetryDataLoader.refresh(paginationSort, advancedFiltersModel);
    // Should not re-run this effect on `telemetryDataLoader` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedFiltersModel, paginationSort]);

  const telemetryRows =
    telemetryDataLoader.data?.telemetry.map((telemetry, index) => ({ ...telemetry, id: index + 1 })) ?? [];

  const columns: GridColDef<ITelemetryTableRow>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 50,
      minWidth: 50,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.id}
        </Typography>
      )
    },
    {
      field: 'nickname',
      headerName: 'Nickname',
      flex: 1,
      renderCell: (params) => <Typography variant="body2">{params.row.animal.animal_id}</Typography>
    },
    {
      field: 'device_id',
      headerName: 'Device',
      flex: 1,
      renderCell: (params) => <Typography variant="body2">{params.row.device_id}</Typography>
    },
    {
      field: 'date',
      headerName: 'Date',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {dayjs(params.row.acquisition_date).format(DATE_FORMAT.MediumDateFormat)}
        </Typography>
      )
    },
    {
      field: 'time',
      headerName: 'Time',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {dayjs(params.row.acquisition_date).format(TIME_FORMAT.LongTimeFormat24Hour)}
        </Typography>
      )
    },
    { field: 'latitude', headerName: 'Latitude', flex: 1 },
    { field: 'longitude', headerName: 'Longitude', flex: 1 }
  ];

  return (
    <>
      <Collapse in={showSearch}>
        <TelemetryListFilterForm
          paginationSort={paginationSort}
          handleSubmit={setAdvancedFiltersModel}
          handleReset={() => setAdvancedFiltersModel(TelemetryAdvancedFiltersInitialValues)}
        />
        <Divider />
      </Collapse>
      <Box height="500px">
        <StyledDataGrid
          noRowsMessage="No telemetry found"
          loading={!telemetryDataLoader.isReady && !telemetryDataLoader.data}
          // Columns
          columns={columns}
          // Rows
          rows={telemetryRows}
          rowCount={telemetryDataLoader.data?.telemetry.length ?? 0}
          getRowId={(row) => row.id}
          // Pagination
          paginationMode="server"
          pageSizeOptions={pageSizeOptions}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => {
            if (!model) {
              return;
            }
            setSearchParams(searchParams.set('t_page', String(model.page)).set('t_limit', String(model.pageSize)));
          }}
          // Sorting
          sortingMode="server"
          sortModel={sortModel}
          sortingOrder={['asc', 'desc']}
          onSortModelChange={(model) => {
            if (!model[0]) {
              return;
            }
            setSearchParams(searchParams.set('t_sort', model[0].field).set('t_order', model[0].sort ?? 'desc'));
          }}
          // Row options
          checkboxSelection={false}
          disableRowSelectionOnClick
          rowSelection={false}
          // Column options
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          // Styling
          rowHeight={70}
          getRowHeight={() => 'auto'}
          autoHeight={false}
          sx={{
            '& .MuiDataGrid-overlay': {
              background: grey[50]
            },
            '& .MuiDataGrid-cell': {
              py: 0.75,
              background: '#fff',
              '&.MuiDataGrid-cell--editing:focus-within': {
                outline: 'none'
              }
            }
          }}
        />
      </Box>
    </>
  );
};

export default TelemetryListContainer;
