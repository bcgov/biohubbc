import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
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
 * Returns the page for viewing animal mortalities within a survey.
 *
 * @return {*}
 */
export const SurveyMortalitiesTab = () => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();
  const critterApi = useCritterApi(axios);
  const [detailedMortalities, setDetailedMortalities] = useState<any[]>([]);
  const [loadingMortalities, setLoadingMortalities] = useState(false);
  const crittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(surveyContext.surveyId));
  const history = useHistory();

  // Load critters on mount
  useEffect(() => {
    crittersDataLoader.load();
  }, [crittersDataLoader]);

  useEffect(() => {
    const fetchMortalities = async () => {
      if (!crittersDataLoader.data || !Array.isArray(crittersDataLoader.data)) {
        return;
      }
      setLoadingMortalities(true);
      const critters = crittersDataLoader.data;
      const critterbaseIds = critters.map((critter: any) => critter.critterbase_critter_id).filter(Boolean);
      let details: any[] = [];
      if (critterbaseIds.length > 0) {
        details = await critterApi.getMultipleCrittersByIds(critterbaseIds).catch(() => []);
      }
      // Flatten all mortalities for all critters
      const allMortalities = details.filter(Boolean).flatMap((detail: any) =>
        Array.isArray(detail.mortalities)
          ? detail.mortalities.map((mortality: any) => ({
              animal_id: detail.animal_id,
              scientificName: detail.itis_scientific_name,
              sex: detail.sex?.label ?? '',
              mortality_date: mortality.mortality_date,
              mortality_time: mortality.mortality_time,
              latitude: mortality.mortality_location?.latitude,
              longitude: mortality.mortality_location?.longitude,
              cause_of_death: mortality.cause_of_death,
              mortality_comment: mortality.mortality_comment
            }))
          : []
      );
      setDetailedMortalities(allMortalities);
      setLoadingMortalities(false);
    };
    fetchMortalities();
  }, [crittersDataLoader.data]);

  const handleImportMortalities = () => {
    history.push(`/admin/surveys/${surveyContext.surveyId}/animals/mortalities`);
  };

  if (!surveyContext.surveyDataLoader.data || crittersDataLoader.isLoading || loadingMortalities) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  // Replace captureRows with detailedMortalities
  const mortalityRows = detailedMortalities;
  console.log('mortalityRows', mortalityRows);

  const columns = [
    { field: 'scientificName', headerName: 'Species', flex: 1, sortable: true },
    { field: 'animal_id', headerName: 'Nickname', flex: 1, sortable: true },
    { field: 'sex', headerName: 'Sex', flex: 1, sortable: true },
    { field: 'mortality_date', headerName: 'Date', flex: 1, sortable: true },
    { field: 'mortality_time', headerName: 'Time', flex: 1, sortable: false },
    { field: 'latitude', headerName: 'Latitude', flex: 1, sortable: false },
    { field: 'longitude', headerName: 'Longitude', flex: 1, sortable: false },
    { field: 'cause_of_death', headerName: 'Cause of Death', flex: 1, sortable: true }
  ];

  const rows = mortalityRows.map((row: any, idx: number) => ({
    id: idx,
    scientificName: row.scientificName,
    animal_id: row.animal_id,
    sex: row.sex,
    mortality_date: row.mortality_date,
    mortality_time: row.mortality_time,
    latitude: row.latitude,
    longitude: row.longitude,
    cause_of_death: row.cause_of_death
  }));

  return (
    <Stack height="100%">
      <Box p={2}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h1" sx={{ flexGrow: 1 }}>
            Mortalities
          </Typography>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleImportMortalities}
              startIcon={<Icon path={mdiPlus} size={1} />}
              sx={{ mr: 0.2, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
              Bulk Import
            </Button>
          </Box>
        </Box>
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
