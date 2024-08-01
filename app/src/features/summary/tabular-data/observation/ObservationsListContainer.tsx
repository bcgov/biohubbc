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
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';
import { useCallback, useEffect, useState } from 'react';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import {
  IObservationsAdvancedFilters,
  ObservationAdvancedFiltersInitialValues,
  ObservationsListFilterForm
} from './ObservationsListFilterForm';

// Supported URL parameters
// Note: Prefix 'o_' is used to avoid conflicts with similar query params from other components
type ObservationDataTableURLParams = {
  // filter
  o_keyword?: string;
  o_itis_tsn?: number;
  o_start_date?: string;
  o_end_date?: string;
  o_start_time?: string;
  o_end_time?: string;
  o_min_count?: string;
  o_system_user_id?: number;
  // pagination
  o_page?: string;
  o_limit?: string;
  o_sort?: string;
  o_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

interface IObservationsListContainerProps {
  showSearch: boolean;
}

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

  const { searchParams, setSearchParams } = useSearchParams<StringValues<ObservationDataTableURLParams>>();

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

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IObservationsAdvancedFilters>({
    keyword: searchParams.get('o_keyword') ?? ObservationAdvancedFiltersInitialValues.keyword,
    itis_tsn: searchParams.get('o_itis_tsn')
      ? Number(searchParams.get('o_itis_tsn'))
      : ObservationAdvancedFiltersInitialValues.itis_tsn,
    start_date: searchParams.get('o_start_date') ?? ObservationAdvancedFiltersInitialValues.start_date,
    end_date: searchParams.get('o_end_date') ?? ObservationAdvancedFiltersInitialValues.end_date,
    start_time: searchParams.get('o_start_time') ?? ObservationAdvancedFiltersInitialValues.start_time,
    end_time: searchParams.get('o_end_time') ?? ObservationAdvancedFiltersInitialValues.end_time,
    min_count: searchParams.get('o_min_count') ?? ObservationAdvancedFiltersInitialValues.min_count,
    system_user_id: searchParams.get('o_system_user_id')
      ? Number(searchParams.get('o_system_user_id'))
      : ObservationAdvancedFiltersInitialValues.system_user_id
  });

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
  };

  const observationsDataLoader = useDataLoader(
    (pagination: ApiPaginationRequestOptions, filter?: IObservationsAdvancedFilters) => {
      return biohubApi.observation.findObservations(pagination, filter);
    }
  );

  useDeepCompareEffect(() => {
    observationsDataLoader.refresh(paginationSort, advancedFiltersModel);
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
        <Box py={2} px={2}>
          <ObservationsListFilterForm
            initialValues={advancedFiltersModel}
            handleSubmit={(values) => {
              setSearchParams(
                searchParams
                  .setOrDelete('o_start_date', values.start_date)
                  .setOrDelete('o_end_date', values.end_date)
                  .setOrDelete('o_keyword', values.keyword)
                  .setOrDelete('o_min_count', values.min_count)
                  .setOrDelete('o_start_time', values.start_time)
                  .setOrDelete('o_end_time', values.end_time)
                  .setOrDelete('o_system_user_id', values.system_user_id)
                  .setOrDelete('o_itis_tsn', values.itis_tsn)
              );
              setAdvancedFiltersModel(values);
            }}
          />
        </Box>
        <Divider />
      </Collapse>
      <Box height="500px" p={2}>
        <StyledDataGrid
          noRowsMessage="No observations found"
          loading={!observationsDataLoader.isReady && !observationsDataLoader.data}
          // Columns
          columns={columns}
          // Rows
          rows={observationRows}
          rowCount={observationsDataLoader.data?.pagination.total ?? 0}
          getRowId={(row) => row.observation_subcount_id}
          // Pagination
          paginationMode="server"
          pageSizeOptions={pageSizeOptions}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => {
            if (!model) {
              return;
            }
            setSearchParams(searchParams.set('o_page', String(model.page)).set('o_limit', String(model.pageSize)));
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
            setSearchParams(searchParams.set('o_sort', model[0].field).set('o_order', model[0].sort ?? 'desc'));
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

export default ObservationsListContainer;
