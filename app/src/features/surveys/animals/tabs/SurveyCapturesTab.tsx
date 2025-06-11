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
 * Returns the page for viewing animal captures within a survey.
 *
 * @return {*}
 */
export const SurveyCapturesTab = () => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();
  const critterApi = useCritterApi(axios);
  const [detailedCaptures, setDetailedCaptures] = useState<any[]>([]);
  const [loadingCaptures, setLoadingCaptures] = useState(false);
  const [orderBy, setOrderBy] = useState<string>('capture_date');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const crittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(surveyContext.surveyId));
  const history = useHistory();

  // Load critters on mount
  useEffect(() => {
    crittersDataLoader.load();
  }, [crittersDataLoader]);

  useEffect(() => {
    const fetchCaptures = async () => {
      if (!crittersDataLoader.data || !Array.isArray(crittersDataLoader.data)) {
        return;
      }
      setLoadingCaptures(true);
      const critters = crittersDataLoader.data;
      const critterbaseIds = critters.map((critter: any) => critter.critterbase_critter_id).filter(Boolean);
      let details: any[] = [];
      if (critterbaseIds.length > 0) {
        details = await critterApi.getMultipleCrittersByIds(critterbaseIds).catch(() => []);
      }
      // Flatten all captures for all critters
      const allCaptures = details.filter(Boolean).flatMap((detail: any) =>
        Array.isArray(detail.captures)
          ? detail.captures.map((capture: any) => ({
              animal_id: detail.animal_id,
              scientificName: detail.itis_scientific_name,
              sex: detail.sex?.label ?? '',
              capture_date: capture.capture_date,
              capture_time: capture.capture_time,
              latitude: capture.capture_location?.latitude,
              longitude: capture.capture_location?.longitude
            }))
          : []
      );
      setDetailedCaptures(allCaptures);
      setLoadingCaptures(false);
    };
    fetchCaptures();
  }, [crittersDataLoader.data]);

  const handleImportCaptures = () => {
    history.push(`/admin/surveys/${surveyContext.surveyId}/animals/captures`);
  };

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedRows = [...detailedCaptures].sort((a, b) => {
    const aValue = a[orderBy] ?? '';
    const bValue = b[orderBy] ?? '';
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });

  if (!surveyContext.surveyDataLoader.data || crittersDataLoader.isLoading || loadingCaptures) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  // Prepare DataGrid columns
  const columns = [
    { field: 'scientificName', headerName: 'Species', flex: 1, sortable: true },
    { field: 'animal_id', headerName: 'Nickname', flex: 1, sortable: true },
    { field: 'sex', headerName: 'Sex', flex: 1, sortable: true },
    { field: 'capture_date', headerName: 'Date', flex: 1, sortable: true },
    { field: 'capture_time', headerName: 'Time', flex: 1, sortable: false },
    { field: 'latitude', headerName: 'Latitude', flex: 1, sortable: false },
    { field: 'longitude', headerName: 'Longitude', flex: 1, sortable: false }
  ];

  // Add unique id for DataGrid
  const rows = detailedCaptures.map((row, idx) => ({ id: idx, ...row }));

  return (
    <Stack height="100%">
      <Box p={2}>
        <Box display="flex" alignItems="center" mb={2}>
          <Typography variant="h1" sx={{ flexGrow: 1 }}>
            Captures
          </Typography>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleImportCaptures}
              startIcon={<Icon path={mdiPlus} size={1} />}
              sx={{ mr: 0.2, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
              Bulk Import
            </Button>
          </Box>
        </Box>
        <Paper>
          <StyledDataGrid
            autoHeight
            rows={rows}
            columns={columns}
            pagination
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            sx={{ minHeight: 500 }}
          />
        </Paper>
      </Box>
    </Stack>
  );
};
