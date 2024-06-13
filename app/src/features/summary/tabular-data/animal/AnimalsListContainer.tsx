import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { useState } from 'react';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import AnimalsListFilterForm, {
  AnimalsAdvancedFiltersInitialValues,
  IAnimalsAdvancedFilters
} from './AnimalsListFilterForm';

// Supported URL parameters
type AnimalDataTableURLParams = IAnimalsAdvancedFilters & {
  a_page?: string;
  a_limit?: string;
  a_sort?: string;
  a_order?: 'asc' | 'desc';
};

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

  const { searchParams, setSearchParams } = useSearchParams<StringValues<AnimalDataTableURLParams>>();

  // const debouncedSetSearchParams = useMemo(() => debounce(setSearchParams, 300), [setSearchParams]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('a_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('a_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('a_sort') ?? initialPaginationParams.sort,
      sort: (searchParams.get('a_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IAnimalsAdvancedFilters>({
    itis_tsn: searchParams.get('itis_tsn')
      ? Number(searchParams.get('itis_tsn'))
      : AnimalsAdvancedFiltersInitialValues.itis_tsn
  });

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
  };

  const animalsDataLoader = useDataLoader(
    (pagination?: ApiPaginationRequestOptions, filter?: IAnimalsAdvancedFilters) =>
      biohubApi.animal.findAnimals(pagination, filter)
  );

  useDeepCompareEffect(() => {
    animalsDataLoader.refresh(paginationSort, advancedFiltersModel);
  }, [advancedFiltersModel, paginationSort]);

  const animalRows = animalsDataLoader.data ?? [];

  const columns: GridColDef[] = [
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
          {params.row.animal_id}
          {/* {params.row.survey_critter_id} */}
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
        <Box py={2} px={3} bgcolor={grey[50]}>
          <AnimalsListFilterForm
            initialValues={advancedFiltersModel}
            handleSubmit={(values) => {
              setSearchParams(searchParams.setOrDelete('itis_tsn', values.itis_tsn));
              setAdvancedFiltersModel(values);
            }}
          />
        </Box>
        <Divider />
      </Collapse>
      <Box height="500px">
        <StyledDataGrid
          noRowsMessage="No animals found"
          loading={!animalsDataLoader.isReady && !animalsDataLoader.data}
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
            if (!model) {
              return;
            }
            setSearchParams(searchParams.set('a_page', String(model.page)).set('a_limit', String(model.pageSize)));
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
            setSearchParams(searchParams.set('a_sort', model[0].field).set('a_order', model[0].sort ?? 'desc'));
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

export default AnimalsListContainer;
