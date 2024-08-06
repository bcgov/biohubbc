import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
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
import TelemetryListFilterForm, {
  ITelemetryAdvancedFilters,
  TelemetryAdvancedFiltersInitialValues
} from './TelemetryListFilterForm';

// Supported URL parameters
// Note: Prefix 't_' is used to avoid conflicts with similar query params from other components
type TelemetryDataTableURLParams = {
  // filter
  t_itis_tsn?: string;
  // pagination
  t_page?: string;
  t_limit?: string;
  t_sort?: string;
  t_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

interface ITelemetryListContainerProps {
  showSearch: boolean;
}

// Default pagination parameters
const initialPaginationParams: ApiPaginationRequestOptions = {
  page: 0,
  limit: 10,
  sort: undefined,
  order: undefined
};

/**
 * Displays a list of telemtry.
 *
 * @return {*}
 */
const TelemetryListContainer = (props: ITelemetryListContainerProps) => {
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

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<ITelemetryAdvancedFilters>({
    itis_tsn: searchParams.get('t_itis_tsn')
      ? Number(searchParams.get('t_itis_tsn'))
      : TelemetryAdvancedFiltersInitialValues.itis_tsn
  });

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
  };

  const telemetryDataLoader = useDataLoader(
    (pagination?: ApiPaginationRequestOptions, filter?: ITelemetryAdvancedFilters) =>
      biohubApi.telemetry.findTelemetry(pagination, filter)
  );

  useDeepCompareEffect(() => {
    telemetryDataLoader.refresh(paginationSort, advancedFiltersModel);
  }, [advancedFiltersModel, paginationSort]);

  const telemetryRows = telemetryDataLoader.data?.telemetry ?? [];

  const columns: GridColDef<IFindTelementryObj>[] = [
    {
      field: 'telemetry_id',
      headerName: 'ID',
      width: 50,
      minWidth: 50,
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
      field: 'animal_id',
      headerName: 'Nickname',
      flex: 1,
      sortable: false,
      renderCell: (params) => <Typography variant="body2">{params.row.animal_id}</Typography>
    },
    {
      field: 'device_id',
      headerName: 'Device',
      flex: 1,
      sortable: false,
      renderCell: (params) => <Typography variant="body2">{params.row.device_id}</Typography>
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
        <Box py={2} px={3} bgcolor={grey[50]}>
          <TelemetryListFilterForm
            initialValues={advancedFiltersModel}
            handleSubmit={(values) => {
              setSearchParams(searchParams.setOrDelete('t_itis_tsn', values.itis_tsn));
              setAdvancedFiltersModel(values);
            }}
          />
        </Box>
        <Divider />
      </Collapse>
      <Box height="70vh">
        <StyledDataGrid
          noRowsMessage="No telemetry found"
          loading={!telemetryDataLoader.isReady && !telemetryDataLoader.data}
          // Columns
          columns={columns}
          // Rows
          rows={telemetryRows}
          rowCount={telemetryDataLoader.data?.telemetry.length ?? 0}
          getRowId={(row: IFindTelementryObj) => row.telemetry_id}
          // Pagination
          paginationMode="server"
          pageSizeOptions={pageSizeOptions}
          paginationModel={paginationModel}
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
            if (!model[0]) {
              return;
            }
            setSearchParams(searchParams.set('t_sort', model[0].field).set('t_order', model[0].sort ?? 'desc'));
            setSortModel(model);
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
