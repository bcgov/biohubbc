import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DATE_FORMAT, TIME_FORMAT } from 'constants/dateTimeFormats';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { useEffect, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull, getFormattedDateRangeString, getFormattedTime } from 'utils/Utils';
import TelemetryListFilterForm from './TelemetryListFilterForm';

interface ITelemetryTableRow {
  id: number;
  deployment_id: string;
  latitude: number;
  longitude: number;
  acquisition_date: string;
  animal: ICritterSimpleResponse;
  device_id: string;
}

export interface ITelemetryAdvancedFilters {
  itis_tsns: number[];
}

const pageSizeOptions = [10, 25, 50];

interface ITelemetryListContainerProps {
  showSearch: boolean;
}

const tableHeight = '589px';

/**
 * List of Surveys belonging to a Project.
 *
 * @return {*}
 */
const TelemetryListContainer = (props: ITelemetryListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();
  // const taxonomyContext = useTaxonomyContext();
  // const codesContext = useCodesContext();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<ITelemetryAdvancedFilters | undefined>(undefined);

  const telemetryDataLoader = useDataLoader(
    (pagination?: ApiPaginationRequestOptions, filter?: ITelemetryAdvancedFilters) =>
      biohubApi.telemetry.getTelemetryList(pagination, filter)
  );

  // Refresh survey list when pagination or sort changes
  useEffect(() => {
    const sort = firstOrNull(sortModel);
    const pagination: ApiPaginationRequestOptions = {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,

      // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
      page: paginationModel.page + 1
    };

    telemetryDataLoader.refresh(pagination, advancedFiltersModel);

    // Adding a DataLoader as a dependency causes an infinite rerender loop if a useEffect calls `.refresh`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortModel, paginationModel, advancedFiltersModel]);

  const rows = telemetryDataLoader.data?.telemetry.map((telemetry, index) => ({ ...telemetry, id: index })) ?? [];

  console.log(rows);

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
          {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, params.row.acquisition_date || '')}
        </Typography>
      )
    },
    {
      field: 'time',
      headerName: 'Time',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {getFormattedTime(TIME_FORMAT.LongTimeFormat24Hour, params.row.acquisition_date || '')}
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
          handleSubmit={setAdvancedFiltersModel}
          handleReset={() => setAdvancedFiltersModel(undefined)}
        />
        <Divider />
      </Collapse>
      <Box p={2}>
        <StyledDataGrid
          noRowsMessage="No telemetry found"
          columns={columns}
          rowHeight={70}
          getRowHeight={() => 'auto'}
          getEstimatedRowHeight={() => 500}
          rows={rows ?? []}
          //   rowCount={telemetryDataLoader.data?.pagination.total ?? 0}
          getRowId={(row) => row.id}
          pageSizeOptions={[...pageSizeOptions]}
          paginationMode="server"
          sortingMode="server"
          sortModel={sortModel}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onSortModelChange={setSortModel}
          rowSelection={false}
          checkboxSelection={false}
          disableRowSelectionOnClick
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          sortingOrder={['asc', 'desc']}
          sx={{
            '& .MuiDataGrid-virtualScroller': {
              // Height is an odd number to help the list obviously scrollable by likely cutting off the last visible row
              height: tableHeight,
              overflowY: 'auto !important',
              background: grey[50]
            },
            '& .MuiDataGrid-overlayWrapperInner': {
              height: `${tableHeight} !important`
            },
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
