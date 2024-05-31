import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IObservationTableRow } from 'contexts/observationsTableContext';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetSurveyObservationsResponse } from 'interfaces/useObservationApi.interface';
import { useCallback, useEffect, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import ObservationsListFilterForm, { ObservationAdvancedFiltersInitialValues } from './ObservationsListFilterForm';

export interface IObservationsAdvancedFilters {
  minimum_date: string;
  maximum_date: string;
  keyword: string;
  minimum_count: string;
  minimum_time: string;
  maximum_time: string;
  system_user_id: number;
  itis_tsns: number[];
}

const pageSizeOptions = [10, 25, 50];

interface IObservationsListContainerProps {
  showSearch: boolean;
}

const tableHeight = '589px';

/**
 * List of Surveys belonging to a Project.
 *
 * @return {*}
 */
const ObservationsListContainer = (props: IObservationsListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'survey_observation_id', sort: 'desc' }]);
  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IObservationsAdvancedFilters>(
    ObservationAdvancedFiltersInitialValues
  );

  const observationsDataLoader = useDataLoader(
    (pagination?: ApiPaginationRequestOptions, filter?: IObservationsAdvancedFilters) =>
      biohubApi.observation.getObservationsForUserId(pagination, filter)
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

    observationsDataLoader.refresh(pagination, advancedFiltersModel);

    // Adding a DataLoader as a dependency causes an infinite rerender loop if a useEffect calls `.refresh`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortModel, paginationModel, advancedFiltersModel]);

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

  const rows = observationsDataLoader.data ? getRowsFromObservations(observationsDataLoader.data) : [];

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
          rowHeight={70}
          getRowHeight={() => 'auto'}
          getEstimatedRowHeight={() => 500}
          rows={rows ?? []}
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
