import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useSearchParams } from 'hooks/useSearchParams';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';
import { useCallback, useEffect, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import {
  IObservationsAdvancedFilters,
  ObservationAdvancedFiltersInitialValues,
  ObservationsListFilterForm
} from './ObservationsListFilterForm';

// Supported URL parameters for the observation table
type ObservationDataTableURLParams = {
  // search filter
  keyword: string;
  species: string;
  person: string;
  // pagination
  o_page: string;
  o_limit: string;
  o_sort?: string;
  o_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

interface IObservationsListContainerProps {
  showSearch: boolean;
}

const rowHeight = 70;
const tableHeight = rowHeight * 5.5;

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'survey_observation_id',
  order: 'desc'
};

/**
 * Displays a list of observations.
 *
 * @return {*}
 */
const ObservationsListContainer = (props: IObservationsListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();

  const { searchParams } = useSearchParams<ObservationDataTableURLParams>();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('o_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('o_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('o_sort') ?? initialPaginationParams.sort,
      sort: (searchParams.get('o_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  // Advanced filters state
  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IObservationsAdvancedFilters>();

  console.log(advancedFiltersModel);

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
    page: paginationModel.page + 1
  };

  const observationsDataLoader = useDataLoader(
    (pagination: ApiPaginationRequestOptions, filter?: IObservationsAdvancedFilters) => {
      return biohubApi.observation.getObservationsForUserId(pagination, filter);
    }
  );

  useEffect(() => {
    observationsDataLoader.load(paginationSort, advancedFiltersModel);
    // Should not re-run this effect on `observationsDataLoader` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedFiltersModel, paginationSort]);

  const getRowsFromObservations = useCallback(
    (observationsData: IGetSurveyObservationsResponse): IObservationTableRow[] =>
      observationsData.surveyObservations?.flatMap((observationRow) => {
        return observationRow.subcounts.map((subcountRow) => {
          return {
            // Spread the standard observation row data into the row
            id: String(observationRow.survey_observation_id),
            ...observationRow,

            // Spread the subcount row data into the row
            observation_subcount_id: subcountRow.observation_subcount_id,
            // Reduce the array of qualitative measurements into an object and spread into the row
            ...subcountRow.qualitative_measurements.reduce((acc, cur) => {
              return {
                ...acc,
                [cur.critterbase_taxon_measurement_id]: cur.critterbase_measurement_qualitative_option_id
              };
            }, {}),
            // Reduce the array of quantitative measurements into an object and spread into the row
            ...subcountRow.quantitative_measurements.reduce((acc, cur) => {
              return {
                ...acc,
                [cur.critterbase_taxon_measurement_id]: cur.value
              };
            }, {}),
            // Reduce the array of qualitative environments into an object and spread into the row
            ...subcountRow.qualitative_environments.reduce((acc, cur) => {
              return {
                ...acc,
                [cur.environment_qualitative_id]: cur.environment_qualitative_option_id
              };
            }, {}),
            // Reduce the array of quantitative environments into an object and spread into the row
            ...subcountRow.quantitative_environments.reduce((acc, cur) => {
              return {
                ...acc,
                [cur.environment_quantitative_id]: cur.value
              };
            }, {})
          };
        });
      }),
    []
  );

  const observationRows = observationsDataLoader.data ? getRowsFromObservations(observationsDataLoader.data) : [];

  const columns: GridColDef<IObservationTableRow>[] = [
    {
      field: 'survey_observation_id',
      headerName: 'ID',
      width: 70,
      minWidth: 70,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.survey_observation_id}
        </Typography>
      )
    },
    {
      field: 'itis_scientific_name',
      headerName: 'Species',
      flex: 1,
      renderCell: (params) => (
        <Typography
          key={params.row.observation_subcount_id}
          fontStyle={
            params.row.itis_scientific_name && params.row.itis_scientific_name.split(' ').length > 1
              ? 'italic'
              : 'normal'
          }>
          {params.row.itis_scientific_name}
        </Typography>
      )
    },
    {
      field: 'count',
      headerName: 'Count',
      flex: 1
    },
    {
      field: 'observation_date',
      headerName: 'Date',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {dayjs(params.row.observation_date).format(DATE_FORMAT.MediumDateFormat)}
        </Typography>
      )
    },
    {
      field: 'observation_time',
      headerName: 'Time',
      flex: 1,
      renderCell: (params) => <Typography variant="body2">{params.row.observation_time}</Typography>
    },
    { field: 'latitude', headerName: 'Latitude', flex: 1 },
    { field: 'longitude', headerName: 'Longitude', flex: 1 }
  ];

  return (
    <>
      <Collapse in={showSearch}>
        <ObservationsListFilterForm
          handleSubmit={setAdvancedFiltersModel}
          handleReset={() => setAdvancedFiltersModel(ObservationAdvancedFiltersInitialValues)}
        />
        <Divider />
      </Collapse>
      <Box p={2}>
        <StyledDataGrid
          noRowsMessage="No observations found"
          columns={columns}
          rowHeight={rowHeight}
          getRowHeight={() => 'auto'}
          rows={observationRows ?? []}
          loading={!observationsDataLoader.data}
          rowCount={observationsDataLoader.data?.pagination.total ?? 0}
          getRowId={(row) => row.observation_subcount_id}
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

export default ObservationsListContainer;
