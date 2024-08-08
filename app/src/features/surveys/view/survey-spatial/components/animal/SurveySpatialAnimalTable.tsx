import { mdiArrowTopRight } from '@mdi/js';
import Stack from '@mui/material/Stack';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { SkeletonRow } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { ScientificNameTypography } from 'features/surveys/animals/components/ScientificNameTypography';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';

// Set height so the skeleton loader matches table rows
const rowHeight = 52;

/**
 * Interface defining the structure of animal data used in the table.
 */
interface IAnimalData {
  id: string;
  animal_id: string;
  scientificName: string;
}

/**
 * Props interface for SurveySpatialAnimalTable component.
 */
interface ISurveyDataAnimalTableProps {
  isLoading: boolean;
}

/**
 * Component for displaying animal data in a table, fetching data via context and API hooks.
 * Renders a table with animal nicknames and scientific names, with loading skeleton when data is loading.
 */
export const SurveySpatialAnimalTable = (props: ISurveyDataAnimalTableProps) => {
  const surveyContext = useSurveyContext();
  const critterbaseApi = useCritterbaseApi();

  // Fetch critter data loader from survey context
  const animals = surveyContext.critterDataLoader.data ?? [];

  // DataLoader to fetch detailed critter data based on IDs from context
  const animalsDataLoader = useDataLoader(() =>
    critterbaseApi.critters.getMultipleCrittersByIds(animals.map((animal) => animal.critter_id))
  );

  // Load data if animals data is available
  if (animals.length) {
    animalsDataLoader.load();
  }

  // Map fetched data to table data structure
  const tableData: IAnimalData[] =
    animalsDataLoader.data?.map((item) => ({
      id: item.critter_id,
      animal_id: item.animal_id ?? '',
      scientificName: item.itis_scientific_name,
      status: !!item.mortality?.length
    })) ?? [];

  // Define columns for the data grid
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
      renderCell: (params) => <ScientificNameTypography name={params.value} /> // Render scientific name with custom typography component
    }
  ];

  return (
    <>
      {props.isLoading && (
        <Stack>
          {/* Skeleton rows for loading state */}
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </Stack>
      )}
      {tableData.length && !props.isLoading ? (
        <StyledDataGrid
          // Data grid component for displaying animal data
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
      ) : (
        <NoDataOverlay
          height="250px"
          title="Add Animals"
          subtitle="Add animals that you have captured, individually identified, or found deceased"
          icon={mdiArrowTopRight}
        />
      )}
    </>
  );
};
