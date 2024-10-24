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
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { IFindAnimalObj } from 'interfaces/useAnimalApi.interface';
import { useState } from 'react';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import AnimalsListFilterForm, {
  AnimalsAdvancedFiltersInitialValues,
  IAnimalsAdvancedFilters
} from './AnimalsListFilterForm';

// Supported URL parameters
// Note: Prefix 'a_' is used to avoid conflicts with similar query params from other components
type AnimalDataTableURLParams = {
  // filter
  a_itis_tsn?: string;
  // pagination
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
const initialPaginationParams: ApiPaginationRequestOptions = {
  page: 0,
  limit: 10,
  sort: undefined,
  order: undefined
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

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('a_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('a_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('a_sort') ?? initialPaginationParams.sort ?? '',
      sort: (searchParams.get('a_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IAnimalsAdvancedFilters>({
    itis_tsn: searchParams.get('a_itis_tsn')
      ? Number(searchParams.get('a_itis_tsn'))
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

  const rows = animalsDataLoader.data?.animals ?? [];

  const columns: GridColDef<IFindAnimalObj>[] = [
    {
      field: 'critter_id',
      headerName: 'ID',
      width: 70,
      minWidth: 70,
      sortable: false,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.critter_id}
        </Typography>
      )
    },
    { field: 'animal_id', headerName: 'Nickname', flex: 1, sortable: false },
    {
      field: 'itis_scientific_name',
      headerName: 'Species',
      flex: 1,
      sortable: false,
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
      sortable: false,
      renderCell: (params) =>
        params.row.wlh_id ? (
          <Typography>{params.row.wlh_id}</Typography>
        ) : (
          <Typography color={grey[400]}>None</Typography>
        )
    },
    { field: 'critterbase_critter_id', headerName: 'Unique ID', flex: 1, sortable: false }
  ];

  return (
    <>
      <Collapse in={showSearch}>
        <Box py={2} px={2}>
          <AnimalsListFilterForm
            initialValues={advancedFiltersModel}
            handleSubmit={(values) => {
              setSearchParams(searchParams.setOrDelete('a_itis_tsn', values.itis_tsn));
              setAdvancedFiltersModel(values);
            }}
          />
        </Box>
        <Divider />
      </Collapse>

      <Box height="100vh" maxHeight="800px" p={2}>
        <LoadingGuard
          isLoading={animalsDataLoader.isLoading || !animalsDataLoader.isReady}
          isLoadingFallback={<SkeletonTable />}
          isLoadingFallbackDelay={100}
          hasNoData={!rows.length}
          hasNoDataFallback={
            <NoDataOverlay
              height="500px"
              title="Create or Join Surveys to See Animals"
              subtitle="You currently have no animal data. Once you create or join surveys with animal data, it will be displayed here"
              icon={mdiArrowTopRight}
            />
          }
          hasNoDataFallbackDelay={100}>
          <StyledDataGrid
            noRowsMessage="No animals found"
            loading={animalsDataLoader.isLoading || !animalsDataLoader.isReady}
            // Columns
            columns={columns}
            // Rows
            rows={rows}
            rowCount={animalsDataLoader.data?.animals?.length ?? 0}
            getRowId={(row) => row.critter_id}
            // Pagination
            paginationMode="server"
            paginationModel={paginationModel}
            pageSizeOptions={pageSizeOptions}
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

export default AnimalsListContainer;
