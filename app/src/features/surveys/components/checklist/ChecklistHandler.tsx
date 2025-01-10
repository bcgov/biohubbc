import { mdiTimelineCheckOutline, mdiTimelineOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect, useState } from 'react';
import appTheme from 'themes/appTheme';
import { useSurveyProgress } from './SurveyProgressContext';

export const ChecklistDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { setSurveyTypes, setSubmissionStatus } = useSurveyProgress(); // Get setters from the new context
  const [localSurveyTypes, setLocalSurveyTypes] = useState<string[]>([]);
  const [localSubmissionStatus, setLocalSubmissionStatus] = useState<Record<string, boolean>>({});

  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);

  const projectId = surveyContext.projectId;
  const surveyId = surveyContext.surveyId;

  const crittersApi = useCritterbaseApi();
  const biohubApi = useBiohubApi();

  const geometryDataLoader = useDataLoader((critter_ids: string[]) =>
    crittersApi.critters.getMultipleCrittersGeometryByIds(critter_ids)
  );

  const observationsGeometryDataLoader = useDataLoader(() =>
    biohubApi.observation.getObservationsGeometry(projectId, surveyId)
  );

  const telemetrySpatialDataLoader = useDataLoader(() =>
    biohubApi.telemetry.getTelemetrySpatialForSurvey(projectId, surveyId)
  );

  useEffect(() => {
    if (!open) return;

    const fetchSurveyTypes = () => {
      const surveyForViewData = surveyContext.surveyDataLoader.data;
      const codes = codesContext.codesDataLoader.data;

      if (!surveyForViewData || !codes) {
        setLocalSurveyTypes([]);
        setSurveyTypes([]); // Update shared context
        return;
      }

      const {
        surveyData: { survey_details }
      } = surveyForViewData;

      const types: string[] =
        codes.type.filter((code) => survey_details.survey_types.includes(code.id)).map((code) => code.name) || [];

      setLocalSurveyTypes(types);
      setSurveyTypes(types); // Update shared context
    };

    fetchSurveyTypes();
  }, [open, surveyContext.surveyDataLoader.data, codesContext.codesDataLoader.data, setSurveyTypes]);

  useEffect(() => {
    const fetchSubmissionStatus = async () => {
      const status: Record<string, boolean> = {};

      if (localSurveyTypes.includes('Animal captures') || localSurveyTypes.includes('Animal mortalities')) {
        const critterIds = surveyContext.critterDataLoader.data?.map((critter) => critter.critterbase_critter_id) ?? [];

        if (critterIds.length > 0) {
          await geometryDataLoader.load(critterIds);

          const captures = geometryDataLoader.data?.captures;
          const mortalities = geometryDataLoader.data?.mortalities;

          status['Animal captures'] = Array.isArray(captures) && captures.length > 0;
          status['Animal mortalities'] = Array.isArray(mortalities) && mortalities.length > 0;
        } else {
          status['Animal captures'] = false;
          status['Animal mortalities'] = false;
        }
      }

      if (localSurveyTypes.includes('Species observations')) {
        await observationsGeometryDataLoader.load();

        const observations = observationsGeometryDataLoader.data?.surveyObservationsGeometry;
        status['Species observations'] = Array.isArray(observations) && observations.length > 0;
      }

      if (localSurveyTypes.includes('Telemetry')) {
        await telemetrySpatialDataLoader.load();

        const telemetry = telemetrySpatialDataLoader.data?.telemetry;
        status['Telemetry'] = Array.isArray(telemetry) && telemetry.length > 0;
      }

      setLocalSubmissionStatus(status);
      setSubmissionStatus(status); // Update shared context
    };

    fetchSubmissionStatus();
  }, [localSurveyTypes, surveyContext.critterDataLoader.data, setSubmissionStatus]);

  return (
    <ThemeProvider theme={appTheme}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableScrollLock>
        <DialogTitle>
          <Typography variant="h3" sx={{ textDecoration: 'underline' }}>
            Survey Checklist
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box>
            <Stack spacing={2}>
              {localSurveyTypes.length > 0 ? (
                localSurveyTypes.map((type, index) => (
                  <Box key={index} display="flex" alignItems="center">
                    <Icon
                      path={localSubmissionStatus[type] ? mdiTimelineCheckOutline : mdiTimelineOutline}
                      size={1}
                      style={{ marginRight: 8 }}
                    />
                    <Typography>{type}</Typography>
                  </Box>
                ))
              ) : (
                <Typography>No survey types available</Typography>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={onClose} color="primary" variant="contained" sx={{ margin: '0 auto' }}>
            OK
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};
