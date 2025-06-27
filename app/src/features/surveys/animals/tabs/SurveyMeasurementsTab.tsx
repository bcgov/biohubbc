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
export const SurveyMeasurementsTab = () => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();
  const critterApi = useCritterApi(axios);
  const [detailedMeasurements, setDetailedMeasurements] = useState<any[]>([]);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const crittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(surveyContext.surveyId));

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
      const critterbaseIds = critters.map((critter: any) => critter.critterbase_critter_id).filter(Boolean);
      let details: any[] = [];
      if (critterbaseIds.length > 0) {
        details = await critterApi.getMultipleCrittersByIds(critterbaseIds).catch(() => []);
      }
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

  // Add filter state for each column
  const [sexFilter, setSexFilter] = useColumnFilter('');
  const [speciesFilter, setSpeciesFilter] = useColumnFilter('');
  const [nicknameFilter, setNicknameFilter] = useColumnFilter('');
  const [dateFilter, setDateFilter] = useColumnFilter('');
  const [measurementFilter, setMeasurementFilter] = useColumnFilter('');
  const [valueFilter, setValueFilter] = useColumnFilter('');

  // Get unique values for dropdowns
  const uniqueSexes = Array.from(new Set(detailedMeasurements.map((row) => row.sex).filter(Boolean)));
  const uniqueSpecies = Array.from(new Set(detailedMeasurements.map((row) => row.scientificName).filter(Boolean)));
  const uniqueNicknames = Array.from(new Set(detailedMeasurements.map((row) => row.animal_id).filter(Boolean)));
  const uniqueDates = Array.from(new Set(detailedMeasurements.map((row) => row.measurement_date).filter(Boolean)));
  const uniqueMeasurements = Array.from(new Set(detailedMeasurements.map((row) => row.measurement).filter(Boolean)));
  const uniqueValues = Array.from(new Set(detailedMeasurements.map((row) => row.value).filter(Boolean)));

  // Filter measurements by all filters
  const filteredMeasurements = detailedMeasurements.filter(
    (row) =>
      (sexFilter ? row.sex === sexFilter : true) &&
      (speciesFilter ? row.scientificName === speciesFilter : true) &&
      (nicknameFilter ? row.animal_id === nicknameFilter : true) &&
      (dateFilter ? row.measurement_date === dateFilter : true) &&
      (measurementFilter ? row.measurement === measurementFilter : true) &&
      (valueFilter ? row.value === valueFilter : true)
  );

  if (!surveyContext.surveyDataLoader.data || crittersDataLoader.isLoading || loadingMeasurements) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  // filteredMeasurements
  const measurementRows = filteredMeasurements;
  console.log('measurementRows', measurementRows);

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
      field: 'sex',
      headerName: 'Sex',
      flex: 1,
      renderHeader: () => (
        <FilterHeader label="SEX" filterValue={sexFilter} setFilterValue={setSexFilter} options={uniqueSexes} />
      )
    },
    {
      field: 'measurement_date',
      headerName: 'Date',
      flex: 1,
      renderHeader: () => (
        <FilterHeader label="DATE" filterValue={dateFilter} setFilterValue={setDateFilter} options={uniqueDates} />
      )
    },
    { field: 'measurement_time', headerName: 'Time', flex: 1, filterable: false },
    {
      field: 'measurement',
      headerName: 'Measurement',
      flex: 1.5,
      renderHeader: () => (
        <FilterHeader
          label="MEASUREMENT"
          filterValue={measurementFilter}
          setFilterValue={setMeasurementFilter}
          options={uniqueMeasurements}
        />
      )
    },
    {
      field: 'value',
      headerName: 'Value',
      flex: 1,
      renderHeader: () => (
        <FilterHeader label="VALUE" filterValue={valueFilter} setFilterValue={setValueFilter} options={uniqueValues} />
      )
    }
  ];

  const rows = measurementRows.map((row: any, idx: number) => ({
    id: idx,
    scientificName: row.scientificName,
    animal_id: row.animal_id,
    sex: row.sex,
    measurement_date: row.measurement_date,
    measurement_time: row.measurement_time,
    measurement: row.measurement,
    value: row.value
  }));

  return (
    <Stack height="100%">
      <Box p={2}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h1" sx={{ flexGrow: 1 }}>
            Measurements
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
            sx={{ minHeight: 600 }}
          />
        </Paper>
      </Box>
    </Stack>
  );
};
