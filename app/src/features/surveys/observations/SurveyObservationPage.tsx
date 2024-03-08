import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { DialogContextProvider } from 'contexts/dialogContext';
import { ObservationsTableContext, ObservationsTableContextProvider } from 'contexts/observationsTableContext';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import { useContext } from 'react';
import ObservationsTableContainer from './observations-table/ObservationsTableContainer';
import SamplingSiteList from './sampling-sites/SamplingSiteList';
import SurveyObservationHeader from './SurveyObservationHeader';

export const SurveyObservationPage = () => {
  const surveyContext = useContext(SurveyContext);
  const projectContext = useContext(ProjectContext);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Stack
      position="relative"
      height="100%"
      overflow="hidden"
      sx={{
        '& .MuiContainer-root': {
          maxWidth: 'none'
        }
      }}>
      <SurveyObservationHeader
        project_id={surveyContext.projectId}
        project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />

      <Stack
        direction="row"
        gap={1}
        sx={{
          flex: '1 1 auto',
          p: 1
        }}>
        {/* Sampling Site List */}
        <Box flex="0 0 auto" width="400px">
          <DialogContextProvider>
            <SamplingSiteList />
          </DialogContextProvider>
        </Box>

        {/* Observations Component */}
        <Box flex="1 1 auto">
          <DialogContextProvider>
            <TaxonomyContextProvider>
              <ObservationsTableContextProvider>
                <ObservationsTableContext.Consumer>
                  {(context) => {
                    if (!context?._muiDataGridApiRef.current) {
                      return <CircularProgress className="pageProgress" size={40} />;
                    }

                    return <ObservationsTableContainer />;
                  }}
                </ObservationsTableContext.Consumer>
              </ObservationsTableContextProvider>
            </TaxonomyContextProvider>
          </DialogContextProvider>
        </Box>
      </Stack>
    </Stack>
  );
};
