import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { GridColDef, GridSortDirection } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useSearchParams } from 'hooks/useSearchParams';
import { useEffect, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import AnimalsListFilterForm, { AnimalsAdvancedFiltersInitialValues } from './AnimalsListFilterForm';

interface IAnimalTableRow {
  survey_critter_id: number;
  critter_id: string;
  animal_id: string | null;
  itis_scientific_name: string;
  wlh_id: string;
}

// Supported URL parameters
type AnimalDataTableURLParams = {
  // search filter
  keyword: string;
  species: string;
  person: string;
  // pagination
  a_page: string;
  a_limit: string;
  a_sort?: string;
  a_order?: 'asc' | 'desc';
};

export interface IAnimalsAdvancedFilters {
  itis_tsns: number[];
}

const pageSizeOptions = [10, 25, 50];

interface IAnimalsListContainerProps {
  showSearch: boolean;
}

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'survey_critter_id',
  order: 'desc'
};

/**
 * Displays a list of animals (critters).
 *
 * @return {*}
 */
const AnimalsListContainer = (props: IAnimalsListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();

  const { searchParams, setSearchParams } = useSearchParams<AnimalDataTableURLParams>();

  const paginationModel = {
    pageSize: Number(searchParams.get('a_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('a_page') ?? initialPaginationParams.page)
  };

  const sortModel = [
    {
      field: searchParams.get('a_sort') ?? initialPaginationParams.sort,
      sort: (searchParams.get('a_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ];

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IAnimalsAdvancedFilters>(
    AnimalsAdvancedFiltersInitialValues
  );

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
    page: paginationModel.page + 1
  };

  const animalsDataLoader = useDataLoader(
    (pagination?: ApiPaginationRequestOptions, filter?: IAnimalsAdvancedFilters) =>
      biohubApi.animal.getAnimalsList(pagination, filter)
  );

  useEffect(() => {
    animalsDataLoader.load(paginationSort, advancedFiltersModel);
    // Should not re-run this effect on `animalsDataLoader` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedFiltersModel, paginationSort]);

  const animalRows = animalsDataLoader.data ?? [];

  const columns: GridColDef<IAnimalTableRow>[] = [
    {
      field: 'survey_critter_id',
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
          {params.row.survey_critter_id}
        </Typography>
      )
    },
    { field: 'animal_id', headerName: 'Nickname', flex: 1 },
    {
      field: 'itis_scientific_name',
      headerName: 'Species',
      flex: 1,
      renderCell: (params) => (
        <Typography fontStyle={params.row.itis_scientific_name.split(' ').length > 1 ? 'italic' : 'normal'}>
          {params.row.itis_scientific_name}
        </Typography>
      )
    },
    {
      field: 'wlh_id',
      headerName: 'Wildlife Health ID',
      flex: 1,
      renderCell: (params) =>
        params.row.wlh_id ? (
          <Typography>{params.row.wlh_id}</Typography>
        ) : (
          <Typography color={grey[400]}>None</Typography>
        )
    },
    { field: 'critter_id', headerName: 'Unique ID', flex: 1 }
  ];

  return (
    <>
      <Collapse in={showSearch}>
        <AnimalsListFilterForm
          handleSubmit={setAdvancedFiltersModel}
          handleReset={() => setAdvancedFiltersModel(AnimalsAdvancedFiltersInitialValues)}
        />
        <Divider />
      </Collapse>
      <Box height="500px">
        <StyledDataGrid
          noRowsMessage="No animals found"
          loading={!animalsDataLoader.data}
          // Columns
          columns={columns}
          // Rows
          rows={animalRows}
          rowCount={animalsDataLoader.data?.length ?? 0}
          getRowId={(row) => row.survey_critter_id}
          // Pagination
          paginationMode="server"
          pageSizeOptions={pageSizeOptions}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => {
            setSearchParams(searchParams.set('a_page', String(model.page)).set('a_limit', String(model.pageSize)));
          }}
          // Sorting
          sortingMode="server"
          sortModel={sortModel}
          sortingOrder={['asc', 'desc']}
          onSortModelChange={(model) => {
            setSearchParams(searchParams.set('a_sort', model[0].field).set('a_order', model[0].sort ?? 'desc'));
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

export default AnimalsListContainer;
