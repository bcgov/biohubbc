import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import axios from 'axios';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { useCritterApi } from 'hooks/cb_api/useCritterApi';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { FilterHeader } from './filtering/FilterHeader';
import { useColumnFilter } from './filtering/useColumnFilter';

// // Note: Prefix 'a_' is used to avoid conflicts with similar query params from other components
// type AnimalDataTableURLParams = {
//   // filter
//   a_itis_tsn?: string;
//   // pagination
//   a_page?: string;
//   a_limit?: string;
//   a_sort?: string;
//   a_order?: 'asc' | 'desc';
// };

// // Default pagination parameters
// const initialPaginationParams: ApiPaginationRequestOptions = {
//   page: 0,
//   limit: 10,
//   sort: undefined,
//   order: undefined
// };

/**
 * Returns the page for viewing animal measurements within a survey.
 *
 * @return {*}
 */
export const SurveyMarkingsTab = () => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();
  const critterApi = useCritterApi(axios);
  const [detailedMeasurements, setDetailedMeasurements] = useState<any[]>([]);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const crittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(surveyContext.surveyId));
  const history = useHistory();

  // Load critters on mount
  useEffect(() => {
    crittersDataLoader.load();
  }, [crittersDataLoader]);

  useEffect(() => {
    const fetchMeasurements = async () => {
      if (!crittersDataLoader.data || !Array.isArray(crittersDataLoader.data)) {
        return;
      }
      setLoadingMeasurements(true);
      const critters = crittersDataLoader.data;
      const details = await Promise.all(
        critters.map((critter: any) =>
          critter.critterbase_critter_id
            ? critterApi.getDetailedCritter(critter.critterbase_critter_id).catch(() => null)
            : null
        )
      );
      // Flatten all measurements for all critters
      const allMeasurements = details.filter(Boolean).flatMap((detail: any) =>
        Array.isArray(detail.measurements)
          ? detail.measurements.map((measurement: any) => ({
              animal_id: detail.animal_id,
              scientificName: detail.itis_scientific_name,
              sex: detail.sex?.label ?? '',
              measurement_date: measurement.measurement_date,
              measurement_time: measurement.measurement_time,
              measurement: measurement.measurement_name || measurement.measurement_type || '',
              value: measurement.value ?? ''
            }))
          : []
      );
      setDetailedMeasurements(allMeasurements);
      setLoadingMeasurements(false);
    };
    fetchMeasurements();
  }, [crittersDataLoader.data]);

  const handleImportMeasurements = () => {
    history.push(`/admin/surveys/${surveyContext.surveyId}/animals/measurements`);
  };

  // Add filter state for each column
  const [speciesFilter, setSpeciesFilter] = useColumnFilter('');
  const [nicknameFilter, setNicknameFilter] = useColumnFilter('');
  const [dateFilter, setDateFilter] = useColumnFilter('');
  const [typeFilter, setTypeFilter] = useColumnFilter('');
  const [locationFilter, setLocationFilter] = useColumnFilter('');
  const [primaryColourFilter, setPrimaryColourFilter] = useColumnFilter('');
  const [secondaryColourFilter, setSecondaryColourFilter] = useColumnFilter('');
  const [identifierFilter, setIdentifierFilter] = useColumnFilter('');

  // Get unique values for dropdowns
  const uniqueSpecies = Array.from(new Set(detailedMeasurements.map((row) => row.scientificName).filter(Boolean)));
  const uniqueNicknames = Array.from(new Set(detailedMeasurements.map((row) => row.animal_id).filter(Boolean)));
  const uniqueDates = Array.from(new Set(detailedMeasurements.map((row) => row.marking_date).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(detailedMeasurements.map((row) => row.marking_type).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(detailedMeasurements.map((row) => row.marking_location).filter(Boolean)));
  const uniquePrimaryColours = Array.from(
    new Set(detailedMeasurements.map((row) => row.primary_colour).filter(Boolean))
  );
  const uniqueSecondaryColours = Array.from(
    new Set(detailedMeasurements.map((row) => row.secondary_colour).filter(Boolean))
  );
  const uniqueIdentifiers = Array.from(new Set(detailedMeasurements.map((row) => row.identifier).filter(Boolean)));

  // Filter markings by all filters
  const filteredMarkings = detailedMeasurements.filter(
    (row) =>
      (speciesFilter ? row.scientificName === speciesFilter : true) &&
      (nicknameFilter ? row.animal_id === nicknameFilter : true) &&
      (dateFilter ? row.marking_date === dateFilter : true) &&
      (typeFilter ? row.marking_type === typeFilter : true) &&
      (locationFilter ? row.marking_location === locationFilter : true) &&
      (primaryColourFilter ? row.primary_colour === primaryColourFilter : true) &&
      (secondaryColourFilter ? row.secondary_colour === secondaryColourFilter : true) &&
      (identifierFilter ? row.identifier === identifierFilter : true)
  );

  if (!surveyContext.surveyDataLoader.data || crittersDataLoader.isLoading || loadingMeasurements) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  // filteredMeasurements
  const markingRows = filteredMarkings;
  console.log('markingRows', markingRows);

  const columns = [
    {
      field: 'scientificName',
      headerName: 'Species',
      flex: 1,
      renderHeader: () => (
        <FilterHeader
          label="SPECIES"
          filterValue={speciesFilter}
          setFilterValue={setSpeciesFilter}
          options={uniqueSpecies}
        />
      )
    },
    {
      field: 'animal_id',
      headerName: 'Nickname',
      flex: 1,
      renderHeader: () => (
        <FilterHeader
          label="NICKNAME"
          filterValue={nicknameFilter}
          setFilterValue={setNicknameFilter}
          options={uniqueNicknames}
        />
      )
    },
    {
      field: 'marking_date',
      headerName: 'Date',
      flex: 1,
      renderHeader: () => (
        <FilterHeader label="DATE" filterValue={dateFilter} setFilterValue={setDateFilter} options={uniqueDates} />
      )
    },
    {
      field: 'marking_type',
      headerName: 'Type',
      flex: 1,
      renderHeader: () => (
        <FilterHeader label="TYPE" filterValue={typeFilter} setFilterValue={setTypeFilter} options={uniqueTypes} />
      )
    },
    {
      field: 'marking_location',
      headerName: 'Location',
      flex: 1,
      renderHeader: () => (
        <FilterHeader
          label="LOCATION"
          filterValue={locationFilter}
          setFilterValue={setLocationFilter}
          options={uniqueLocations}
        />
      )
    },
    {
      field: 'primary_colour',
      headerName: 'Primary Colour',
      flex: 1,
      renderHeader: () => (
        <FilterHeader
          label="COLOUR 1"
          filterValue={primaryColourFilter}
          setFilterValue={setPrimaryColourFilter}
          options={uniquePrimaryColours}
        />
      )
    },
    {
      field: 'secondary_colour',
      headerName: 'Secondary Colour',
      flex: 1,
      renderHeader: () => (
        <FilterHeader
          label="COLOUR 2"
          filterValue={secondaryColourFilter}
          setFilterValue={setSecondaryColourFilter}
          options={uniqueSecondaryColours}
        />
      )
    },
    {
      field: 'identifier',
      headerName: 'Identifier',
      flex: 1,
      renderHeader: () => (
        <FilterHeader
          label="IDENTIFIER"
          filterValue={identifierFilter}
          setFilterValue={setIdentifierFilter}
          options={uniqueIdentifiers}
        />
      )
    }
  ];

  const rows = markingRows.map((row: any, idx: number) => ({
    id: idx,
    scientificName: row.scientificName,
    animal_id: row.animal_id,
    marking_date: row.marking_date,
    marking_type: row.marking_type,
    marking_location: row.marking_location,
    primary_colour: row.primary_colour,
    secondary_colour: row.secondary_colour,
    identifier: row.identifier
  }));

  return (
    <Stack height="100%">
      <Box p={2}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h1" sx={{ flexGrow: 1 }}>
            Markings
          </Typography>
        </Box>
        {/* Removed separate Sex filter dropdown, now in column header */}
        <Paper>
          <StyledDataGrid
            rows={rows}
            columns={columns}
            pagination
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            getRowId={(row: any) => row.id}
            sx={{ minHeight: 500 }}
          />
        </Paper>
      </Box>
    </Stack>
  );
};
