import Stack from '@mui/material/Stack';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { SkeletonRow } from 'components/loading/SkeletonLoaders';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';

// Set height so we the skeleton loader will match table rows
const rowHeight = 52;

interface IAnimalData {
  id: string;
  animal_id: string;
  scientificName: string;
}

interface ISurveyDataAnimalTableProps {
  isLoading: boolean;
}

const SurveyDataAnimalTable = (props: ISurveyDataAnimalTableProps) => {
  const surveyContext = useSurveyContext();

  const critterbaseApi = useCritterbaseApi();

  const animals = surveyContext.critterDataLoader.data ?? [];

  const animalsDataLoader = useDataLoader(() =>
    critterbaseApi.critters.getMultipleCrittersByIds(animals.map((animal) => animal.critter_id))
  );

  if (animals.length) {
    animalsDataLoader.load();
  }

  const tableData: IAnimalData[] =
    animalsDataLoader.data?.map((item) => ({
      id: item.critter_id,
      animal_id: item.animal_id ?? '',
      scientificName: item.itis_scientific_name,
      status: item.mortality?.length ? true : false
    })) ?? [];

  const columns: GridColDef<IAnimalData>[] = [
    {
      field: 'animal_id',
      headerName: 'Nickname',
      flex: 1
    },
    {
      field: 'scientificName',
      headerName: 'Species',
      flex: 1,
      renderCell: (params) => <ScientificNameTypography name={params.value} />
    }
  ];

  return (
    <>
      {props.isLoading ? (
        <Stack>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </Stack>
      ) : (
        <StyledDataGrid
          noRowsMessage={'No animals found'}
          columnHeaderHeight={rowHeight}
          rowHeight={rowHeight}
          rows={tableData}
          getRowId={(row) => row.id}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 1, pageSize: 5 }
            }
          }}
          pageSizeOptions={[5]}
          rowSelection={false}
          checkboxSelection={false}
          disableRowSelectionOnClick
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          disableVirtualization
          sortingOrder={['asc', 'desc']}
          data-testid="survey-animals-data-table"
        />
      )}
    </>
  );
};

export default SurveyDataAnimalTable;
