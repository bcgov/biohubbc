import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import { ObservationsTableContext, ObservationsTableContextProvider } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import { useContext } from 'react';
import ObservationComponent from './observations-table/ObservationComponent';
import SamplingSiteList from './sampling-sites/SamplingSiteList';
import SurveyObservationHeader from './SurveyObservationHeader';

export const SurveyObservationPage = () => {
  const surveyContext = useContext(SurveyContext);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box display="flex" flexDirection="column" height="100%" overflow="hidden" position="relative">
      <SurveyObservationHeader
        project_id={surveyContext.projectId}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />

      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          overflow: 'hidden',
          m: 1
        }}>
        {/* Sampling Site List */}
        <Box
          flex="0 0 auto"
          width="400px"
          sx={{
            borderRight: '1px solid ' + grey[300]
          }}>
          <SamplingSiteList />
        </Box>

        {/* Observations Component */}
        <Box flex="1 1 auto" overflow="hidden">
          <TaxonomyContextProvider>
            <ObservationsTableContextProvider>
              <ObservationsTableContext.Consumer>
                {(context) => {
                  if (!context._muiDataGridApiRef.current) {
                    return <CircularProgress className="pageProgress" size={40} />;
                  }

                  return <ObservationComponent />;
                }}
              </ObservationsTableContext.Consumer>
            </ObservationsTableContextProvider>
          </TaxonomyContextProvider>
        </Box>
      </Paper>
    </Box>
  );
};
