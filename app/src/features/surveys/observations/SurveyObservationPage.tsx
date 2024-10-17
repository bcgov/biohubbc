import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { DialogContextProvider } from 'contexts/dialogContext';
import { ObservationsPageContextProvider } from 'contexts/observationsPageContext';
import { ObservationsTableContext, ObservationsTableContextProvider } from 'contexts/observationsTableContext';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import { SystemAlertBanner } from 'features/alert/banner/SystemAlertBanner';
import { useContext } from 'react';
import ObservationsTableContainer from './observations-table/ObservationsTableContainer';
import { SamplingSiteListContainer } from './sampling-sites/SamplingSiteListContainer';
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
      
      <SystemAlertBanner alertTypes={['Observations']}/>

      <ObservationsPageContextProvider>
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
              <SamplingSiteListContainer />
            </DialogContextProvider>
          </Box>

          {/* Observations Table */}
          <Box flex="1 1 auto">
            <DialogContextProvider>
              <TaxonomyContextProvider>
                <ObservationsTableContextProvider>
                  <ObservationsTableContext.Consumer>
                    {(context) => {
                      if (!context?._muiDataGridApiRef.current) {
                        // Delay rendering the ObservationsTable until the DataGrid API is available
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
      </ObservationsPageContextProvider>
    </Stack>
  );
};
