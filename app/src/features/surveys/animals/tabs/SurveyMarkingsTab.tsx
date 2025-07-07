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
import { IMarkingResponse } from 'interfaces/useCritterApi.interface';
import { useEffect, useState } from 'react';
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
 * Returns the page for viewing animal markings within a survey.
 *
 * @return {*}
 */
export const SurveyMarkingsTab = () => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();
  const critterApi = useCritterApi(axios);
  const [detailedMarkings, setDetailedMarkings] = useState<IMarkingResponse[]>([]);
  const [loadingMarkings, setLoadingMarkings] = useState(false);
  const crittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(surveyContext.surveyId));

  // Load critters on mount
  useEffect(() => {
    crittersDataLoader.load();
  }, [crittersDataLoader]);

  useEffect(() => {
    const fetchMarkings = async () => {
      if (!crittersDataLoader.data || !Array.isArray(crittersDataLoader.data)) {
        return;
      }
      setLoadingMarkings(true);
      const critters = crittersDataLoader.data;
      const critterbaseIds = critters.map((critter: any) => critter.critterbase_critter_id).filter(Boolean);
      let details: any[] = [];
      if (critterbaseIds.length > 0) {
        details = await critterApi.getMultipleCrittersByIds(critterbaseIds).catch(() => []);
      }
      // Flatten all markings for all critters, join with critter info for species/nickname
      const allMarkings: any[] = details.filter(Boolean).flatMap((detail: any) =>
        Array.isArray(detail.markings)
          ? detail.markings.map((marking: IMarkingResponse) => ({
              ...marking,
              scientificName: detail.itis_scientific_name,
              animal_id: detail.animal_id
            }))
          : []
      );
      setDetailedMarkings(allMarkings);
      setLoadingMarkings(false);
    };
    fetchMarkings();
  }, [crittersDataLoader.data]);

  // Add filter state for each column
  const [speciesFilter, setSpeciesFilter] = useColumnFilter('');
  const [nicknameFilter, setNicknameFilter] = useColumnFilter('');
  const [dateFilter, setDateFilter] = useColumnFilter('');
  const [typeFilter, setTypeFilter] = useColumnFilter('');
  const [locationFilter, setLocationFilter] = useColumnFilter('');
  const [primaryColourFilter, setPrimaryColourFilter] = useColumnFilter('');
  const [secondaryColourFilter, setSecondaryColourFilter] = useColumnFilter('');
  const [identifierFilter, setIdentifierFilter] = useColumnFilter('');

  // filter out nulls for colour options
  const uniquePrimaryColours = Array.from(
    new Set(detailedMarkings.map((row) => row.primary_colour).filter((c): c is string => !!c))
  );
  const uniqueSecondaryColours = Array.from(
    new Set(detailedMarkings.map((row) => row.secondary_colour).filter((c): c is string => !!c))
  );

  // Use correct property names for species/nickname in filters (these are added in the flatten step)
  const uniqueSpecies = Array.from(new Set(detailedMarkings.map((row: any) => row.scientificName).filter(Boolean)));
  const uniqueNicknames = Array.from(new Set(detailedMarkings.map((row: any) => row.animal_id).filter(Boolean)));
  const uniqueDates = Array.from(new Set(detailedMarkings.map((row) => row.attached_timestamp).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(detailedMarkings.map((row) => row.marking_type).filter(Boolean)));
  const uniqueLocations = Array.from(new Set(detailedMarkings.map((row) => row.body_location).filter(Boolean)));
  const uniqueIdentifiers = Array.from(new Set(detailedMarkings.map((row) => row.identifier).filter(Boolean)));

  const filteredMarkings = detailedMarkings.filter(
    (row: any) =>
      (speciesFilter ? row.scientificName === speciesFilter : true) &&
      (nicknameFilter ? row.animal_id === nicknameFilter : true) &&
      (dateFilter ? row.attached_timestamp === dateFilter : true) &&
      (typeFilter ? row.marking_type === typeFilter : true) &&
      (locationFilter ? row.body_location === locationFilter : true) &&
      (primaryColourFilter ? row.primary_colour === primaryColourFilter : true) &&
      (secondaryColourFilter ? row.secondary_colour === secondaryColourFilter : true) &&
      (identifierFilter ? row.identifier === identifierFilter : true)
  );

  if (!surveyContext.surveyDataLoader.data || crittersDataLoader.isLoading || loadingMarkings) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const markingRows = filteredMarkings;
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
      headerName: 'Alias',
      flex: 1,
      renderHeader: () => (
        <FilterHeader
          label="ALIAS"
          filterValue={nicknameFilter}
          setFilterValue={setNicknameFilter}
          options={uniqueNicknames}
        />
      )
    },
    {
      field: 'attached_timestamp',
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
      field: 'body_location',
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
          label="ID"
          filterValue={identifierFilter}
          setFilterValue={setIdentifierFilter}
          options={uniqueIdentifiers}
        />
      )
    }
  ];

  const rows = markingRows.map((row: any) => ({
    id: row.marking_id,
    scientificName: row.scientificName,
    animal_id: row.animal_id,
    attached_timestamp: row.attached_timestamp,
    marking_type: row.marking_type,
    body_location: row.body_location,
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
        <Paper sx={{ overflowX: 'auto' }}>
          <StyledDataGrid
            rows={rows}
            columns={columns}
            pagination
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            getRowId={(row: any) => row.id}
            sx={{ minHeight: 600 }}
          />
        </Paper>
      </Box>
    </Stack>
  );
};
