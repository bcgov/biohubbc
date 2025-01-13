import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
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
  id: number;
  animal_id: string;
  scientificName: string;
  sex: string;
  marking:JSX.Element;
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
    critterbaseApi.critters.getMultipleCrittersByIds(animals.map((animal) => animal.critterbase_critter_id))
  );

  // Load data if animals data is available
  if (animals.length) {
    animalsDataLoader.load();
  }

  // Map fetched data to table data structure
  const rows: IAnimalData[] =
  animalsDataLoader.data?.map((item) => {
    const capitalizeFirstLetter = (value: unknown) => {
      const str = typeof value === 'string' ? value : (value as { label?: string })?.label ?? 'Unknown';
      return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();
    };

    // Safely process markings for the current animal
    const markingChips = Array.isArray(item.markings)
      ? item.markings.map((marking) => {
          const eventDate = marking.capture_id
            ? item.captures?.find((capture) => capture.capture_id === marking.capture_id)?.capture_date
            : item.mortality?.find((mortality) => mortality.mortality_id === marking.mortality_id)?.mortality_timestamp;

          const displayText = `${marking.marking_type} (${marking.primary_colour || 'N/A'}, ${marking.secondary_colour || 'N/A'}) - ${
            marking.identifier || 'Unknown'
          } [${eventDate || 'No Date'}]`;

          return (
            <Chip
              key={marking.marking_id}
              label={displayText}
              variant="outlined"
              onClick={() => console.log(`Marking clicked: ${marking.marking_id}`)}
            />
          );
        })
      : []; // Default to an empty array if `markings` is undefined

    return {
      id: item.critter_id,
      animal_id: item.animal_id ?? '',
      scientificName: item.itis_scientific_name,
      sex: capitalizeFirstLetter(item.sex || 'Unknown'),
      marking: <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{markingChips}</Box>, // Add dynamic chips
    };
  }) ?? [];



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
    },
    {field: 'sex', headerName: 'Sex', flex: 1, renderCell: (params) => <>{params.value ?? 'Unknown'}</> },
    {field: 'marking', headerName: 'Marking', flex: 1, renderCell: (params) => params.value}
  ];

  return (
    <LoadingGuard
      isLoading={animals.length > 0 && (props.isLoading || animalsDataLoader.isLoading || !animalsDataLoader.isReady)}
      isLoadingFallback={
        <Box flex="1 1 auto">
          <SkeletonTable />
        </Box>
      }
      isLoadingFallbackDelay={100}
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
      }
      hasNoDataFallbackDelay={100}>
      <StyledDataGrid
        // Data grid component for displaying animal data
        noRowsMessage={'No animals found'}
        columnHeaderHeight={rowHeight}
        rowHeight={rowHeight}
        rows={rows}
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
    </LoadingGuard>
  );
};
