import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';

const rowHeight = 52;

interface IAnimalRow {
  id: number;
  animal_id: string | null;
  scientificName: string;
  sex: string | null;
}

interface ISurveyDataAnimalTableProps {
  isLoading: boolean;
}

/**
 * Returns table of animals in the Survey
 *
 * @param {ISurveyDataAnimalTableProps} props
 * @returns {*}
 */
export const SurveySpatialAnimalTable = (props: ISurveyDataAnimalTableProps) => {
  const { isLoading } = props;

  const { critterDataLoader } = useSurveyContext();
  const critterbaseApi = useCritterbaseApi();
  const animals = critterDataLoader.data ?? [];

  const animalsDataLoader = useDataLoader(() =>
    critterbaseApi.critters.getMultipleCrittersByIds(
      animals.map(({ critterbase_critter_id }) => critterbase_critter_id)
    )
  );

  useEffect(() => {
    if (animals.length) animalsDataLoader.load();
  }, [animals]);

  const rows: IAnimalRow[] =
    animalsDataLoader.data?.map((animal) => ({
      ...animal,
      id: animal.critter_id,
      scientificName: animal.itis_scientific_name,
      sex: animal.sex?.label ?? null
    })) ?? [];

  const columns: GridColDef<IAnimalRow>[] = [
    { field: 'animal_id', headerName: 'Nickname', flex: 1 },
    {
      field: 'scientificName',
      headerName: 'Species',
      flex: 1,
      renderCell: ({ value }) => <ScientificNameTypography name={value} variant="body2" />
    },
    { field: 'sex', headerName: 'Sex', flex: 1, renderCell: ({ value }) => value ?? 'Unknown' }
  ];

  return (
    <LoadingGuard
      isLoading={animals.length > 0 && (isLoading || animalsDataLoader.isLoading || !animalsDataLoader.isReady)}
      isLoadingFallback={
        <Box flex="1 1 auto">
          <SkeletonTable />
        </Box>
      }
      hasNoData={!animals.length || !rows.length}
      hasNoDataFallback={
        <Box flex="1 1 auto">
          <NoDataOverlay
            height="100%"
            title="Add Animals"
            subtitle="Add animals that you have captured, individually identified, or found deceased"
            icon={mdiArrowTopRight}
          />
        </Box>
      }>
      <StyledDataGrid
        noRowsMessage="No animals found"
        columnHeaderHeight={rowHeight}
        rowHeight={rowHeight}
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
    </LoadingGuard>
  );
};
