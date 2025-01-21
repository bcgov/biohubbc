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
import { IMarkingResponse, ICaptureResponse, IMortalityResponse } from 'interfaces/useCritterApi.interface';
import { useEffect } from 'react';

const rowHeight = 52;

interface IAnimalData {
  id: number;
  animal_id: string;
  scientificName: string;
  sex: string;
  marking: JSX.Element;
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

  const fetchCapturesAndMortalities = async () => {
    const captures: ICaptureResponse[] = [];
    const mortalities: IMortalityResponse[] = [];

    animalsDataLoader.data?.forEach((animal) => {
      if (animal.captures) captures.push(...animal.captures);
      if (animal.mortality) mortalities.push(...animal.mortality);
    });

    return { captures, mortalities };
  };

  const markingsDataLoader = useDataLoader(async () => {
    const { captures, mortalities } = await fetchCapturesAndMortalities();

    const critterIdToEventIds = animals.map((animal) => ({
      critterId: animal.critterbase_critter_id,
      captureIds: captures.filter((capture) => capture.critter_id === animal.critterbase_critter_id).map((c) => c.capture_id),
      mortalityIds: mortalities.filter((mortality) => mortality.critter_id === animal.critterbase_critter_id).map((m) => m.mortality_id),
    }));

    return critterIdToEventIds.map(({ critterId, captureIds, mortalityIds }) => {
      const relevantMarkings = (animalsDataLoader.data || []).flatMap((animal) => {
        return (animal.markings || []).filter((marking: IMarkingResponse) => {
          return (
            captureIds.includes(marking.capture_id) ||
            (marking.mortality_id && mortalityIds.includes(marking.mortality_id))
          );
        });
      });

      return {
        critterId,
        markings: relevantMarkings,
      };
    });
  });

  useEffect(() => {
    if (animals.length) {
      animalsDataLoader.load();
      markingsDataLoader.load();
    }
  }, [animals]);

  const rows: IAnimalData[] =
    animalsDataLoader.data?.map((item) => {
      const capitalizeFirstLetter = (value: unknown) => {
        const str = typeof value === 'string' ? value : (value as { label?: string })?.label ?? 'Unknown';
        return str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();
      };

      const markings = markingsDataLoader.data?.find((data) => String(data.critterId) === String(item.critter_id))?.markings || [];

      const markingChips = markings.map((marking: IMarkingResponse) => {
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
      });

      return {
        id: item.critter_id,
        animal_id: item.animal_id ?? '',
        scientificName: item.itis_scientific_name,
        sex: capitalizeFirstLetter(item.sex || 'Unknown'),
        marking: <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{markingChips}</Box>,
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
    },
    {
      field: 'marking',
      headerName: 'Marking',
      flex: 1,
      renderCell: (params) => params.value
    }
  ];

  return (
    <LoadingGuard
      isLoading={
        animals.length > 0 &&
        (props.isLoading || animalsDataLoader.isLoading || markingsDataLoader.isLoading || !animalsDataLoader.isReady)
      }
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
