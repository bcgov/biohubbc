import React, { useEffect, useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { mdiTimelineOutline, mdiTimelineCheckOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { ThemeProvider } from '@mui/material/styles';
import appTheme from 'themes/appTheme';
import { SurveyContext } from 'contexts/surveyContext';
import { CodesContext } from 'contexts/codesContext';
import { SurveyChecklistAPI } from './checklist-view';
import useDataLoader from 'hooks/useDataLoader';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { useParams } from 'react-router-dom';

export const ChecklistDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [surveyTypes, setSurveyTypes] = useState<string[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<Record<string, boolean>>({});
  
  const { projectId, surveyId } = useParams<{ projectId: string; surveyId: string }>();
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);
  
  const crittersApi = useCritterbaseApi();
  const geometryDataLoader = useDataLoader((critter_ids: string[]) =>
    crittersApi.critters.getMultipleCrittersGeometryByIds(critter_ids)
  );

  useEffect(() => {
    if (!open) return;

    const fetchSurveyTypes = () => {
      const surveyForViewData = surveyContext.surveyDataLoader.data;
      const codes = codesContext.codesDataLoader.data;

      if (!surveyForViewData || !codes) {
        setSurveyTypes([]);
        return;
      }

      const {
        surveyData: { survey_details }
      } = surveyForViewData;

      const types: string[] =
        codes.type
          .filter((code) => survey_details.survey_types.includes(code.id))
          .map((code) => code.name) || [];

      setSurveyTypes(types);
    };

    fetchSurveyTypes();
  }, [open, surveyContext.surveyDataLoader.data, codesContext.codesDataLoader.data]);

  useEffect(() => {
    const fetchSubmissionStatus = async () => {
      const status: Record<string, boolean> = {};

      if (surveyTypes.includes('Animal captures') || surveyTypes.includes('Animal mortalities')) {
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

      for (const type of surveyTypes) {
        if (type === 'Animal captures' || type === 'Animal mortalities') continue;

        const endpoint = SurveyChecklistAPI[type as keyof typeof SurveyChecklistAPI];
        if (!endpoint || endpoint === 'placeholder') {
          status[type] = false;
          continue;
        }

        try {
          const response = await fetch(endpoint.replace('{projectId}', projectId).replace('{surveyId}', surveyId));
          if (response.ok) {
            const data = await response.json();
            status[type] = data.observationCount > 0;
          } else {
            status[type] = false;
          }
        } catch {
          status[type] = false;
        }
      }

      setSubmissionStatus(status);
    };

    fetchSubmissionStatus();
  }, [surveyTypes, surveyContext.critterDataLoader.data]);

  return (
    <ThemeProvider theme={appTheme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        disableScrollLock
        sx={{
          '& .MuiDialog-paper': {
            position: 'fixed',
            bottom: 15,
            right: 15,
            margin: 0,
            width: '300px',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h3" sx={{ textDecoration: 'underline' }}>
            Survey Checklist
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box>
            <Stack spacing={2}>
              {surveyTypes.length > 0 ? (
                surveyTypes.map((type, index) => (
                  <Box key={index} display="flex" alignItems="center">
                    <Icon
                      path={submissionStatus[type] ? mdiTimelineCheckOutline : mdiTimelineOutline}
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
