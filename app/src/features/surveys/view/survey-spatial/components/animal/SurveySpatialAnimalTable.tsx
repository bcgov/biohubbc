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
import { ICaptureResponse, IMortalityResponse } from 'interfaces/useCritterApi.interface';
import { useEffect } from 'react';

const rowHeight = 52;

interface IAnimalData {
  id: number;
  animal_id: string;
  scientificName: string;
  sex: string;
}

interface ISurveyDataAnimalTableProps {
  isLoading: boolean;
}

export const SurveySpatialAnimalTable = (props: ISurveyDataAnimalTableProps) => {
  const surveyContext = useSurveyContext();
  const critterbaseApi = useCritterbaseApi();

  const animals = surveyContext.critterDataLoader.data ?? [];

  const animalsDataLoader = useDataLoader(() =>
    critterbaseApi.critters.getMultipleCrittersByIds(animals.map((animal) => animal.critterbase_critter_id))
  );

  const captures: ICaptureResponse[] = [];
  const mortalities: Omit<IMortalityResponse, 'critter_id'>[] = [];

  animalsDataLoader.data?.forEach((animal) => {
    if (animal.captures) captures.push(...animal.captures);
    if (animal.mortality) mortalities.push(...animal.mortality);
  });

  useEffect(() => {
    if (animals.length) {
      animalsDataLoader.load();
    }
  }, [animals]);

  const rows: IAnimalData[] =
    animalsDataLoader.data?.map((item) => {
      const capitalizeFirstLetter = (value: unknown) => {
        const str = typeof value === 'string' ? value : (value as { label?: string })?.label ?? 'Unknown';
        return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();
      };

      return {
        id: item.critter_id,
        animal_id: item.animal_id ?? '',
        scientificName: item.itis_scientific_name,
        sex: capitalizeFirstLetter(item.sex || 'Unknown')
      };
    }) ?? [];

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
    },
    {
      field: 'sex',
      headerName: 'Sex',
      flex: 1,
      renderCell: (params) => <>{params.value ?? 'Unknown'}</>
    }
  ];

  return (
    <LoadingGuard
      isLoading={animals.length > 0 && (props.isLoading || animalsDataLoader.isLoading || !animalsDataLoader.isReady)}
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
        noRowsMessage={'No animals found'}
        columnHeaderHeight={rowHeight}
        rowHeight={rowHeight}
        rows={rows}
        getRowId={(row) => row.id}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 }
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
    </LoadingGuard>
  );
};
