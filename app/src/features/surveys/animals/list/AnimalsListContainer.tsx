import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import AnimalsListFilterForm from './AnimalsListFilterForm';

interface IAnimalTableRow {
  survey_critter_id: number;
  critter_id: string;
  animal_id: string | null;
  itis_scientific_name: string;
}

export interface IAnimalsAdvancedFilters {
  itis_tsns: number[];
}

const pageSizeOptions = [10, 25, 50];

interface IAnimalsListContainerProps {
  showSearch: boolean;
}

const tableHeight = '589px';

/**
 * List of Surveys belonging to a Project.
 *
 * @return {*}
 */
const AnimalsListContainer = (props: IAnimalsListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();
  // const taxonomyContext = useTaxonomyContext();
  // const codesContext = useCodesContext();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IAnimalsAdvancedFilters | undefined>(undefined);

  const animalsDataLoader = useDataLoader(
    (pagination?: ApiPaginationRequestOptions, filter?: IAnimalsAdvancedFilters) =>
      biohubApi.animal.getAnimalsList(pagination, filter)
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

    animalsDataLoader.refresh(pagination, advancedFiltersModel);

    // Adding a DataLoader as a dependency causes an infinite rerender loop if a useEffect calls `.refresh`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortModel, paginationModel, advancedFiltersModel]);

  const rows = animalsDataLoader.data?.map((animal, index) => ({ ...animal, id: index + 1 })) ?? [];

  const columns: GridColDef<IAnimalTableRow>[] = [
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
          {params.row.survey_critter_id}
        </Typography>
      )
    },
    { field: 'animal_id', headerName: 'Nickname', flex: 1 },
    { field: 'critter_id', headerName: 'Unique ID', flex: 1 }
  ];

  return (
    <>
      <Collapse in={showSearch}>
        <AnimalsListFilterForm
          handleSubmit={setAdvancedFiltersModel}
          handleReset={() => setAdvancedFiltersModel(undefined)}
        />
        <Divider />
      </Collapse>
      <Box p={2}>
        <StyledDataGrid
          noRowsMessage="No animals found"
          columns={columns}
          rowHeight={70}
          getRowHeight={() => 'auto'}
          getEstimatedRowHeight={() => 500}
          rows={rows ?? []}
          //   rowCount={animalsDataLoader.data?.pagination.total ?? 0}
          getRowId={(row) => row.critter_id}
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

export default AnimalsListContainer;
