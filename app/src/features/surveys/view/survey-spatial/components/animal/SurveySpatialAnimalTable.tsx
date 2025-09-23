import green from '@mui/material/colors/green';
import red from '@mui/material/colors/red';
import { GridColDef } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';

interface IAnimalRow {
  id: number;
  animal_id: string | null;
  scientificName: string;
  sex: string | null;
  status: string;
}

interface ISurveyDataAnimalTableProps {
  animals: ICritterDetailedResponse[];
}

/**
 * Returns table of animals in the Survey
 *
 * @param {ISurveyDataAnimalTableProps} props
 * @returns {*}
 */
export const SurveySpatialAnimalTable = (props: ISurveyDataAnimalTableProps) => {
  const { animals } = props;

  const rows: IAnimalRow[] =
    animals?.map((animal) => ({
      ...animal,
      id: animal.critter_id,
      scientificName: animal.itis_scientific_name,
      sex: animal.sex?.label ?? null,
      status: animal.mortality?.length ? 'Deceased' : 'Alive'
    })) ?? [];

  const columns: GridColDef<IAnimalRow>[] = [
    { field: 'animal_id', headerName: 'Nickname', flex: 1 },
    {
      field: 'scientificName',
      headerName: 'Species',
      flex: 1,
      renderCell: (params) => <ScientificNameTypography name={params.value} variant="body2" />
    },
    { field: 'sex', headerName: 'Sex', flex: 1, renderCell: (params) => params.value },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <ColouredRectangleChip label={params.value} colour={params.value === 'Alive' ? green : red} />
      )
    }
  ];

  return (
    <StyledDataGrid
      noRowsMessage="No animals found"
      rowHeight={52}
      rows={rows}
      getRowId={(row) => row.id}
      columns={columns}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 10 }
        }
      }}
      pageSizeOptions={[10, 25, 50]}
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
  );
};
