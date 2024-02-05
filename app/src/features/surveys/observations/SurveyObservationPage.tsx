import { Paper } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
// import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { ObservationsTableContext, ObservationsTableContextProvider } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import { useContext, useState } from 'react';
import { ObservationPanelContainer } from './components/ObservationPanelContainer';
import SamplingSiteList from './sampling-sites/SamplingSiteList';
import SurveyObservationHeader from './SurveyObservationHeader';

export const SurveyObservationPage = () => {
  const surveyContext = useContext(SurveyContext);
  const [sitesIsCollapsed, setSitesIsCollapsed] = useState(false);
  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box display="flex" flexDirection="column" height="100%" overflow="hidden">
      <SurveyObservationHeader
        project_id={surveyContext.projectId}
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
        <Box flex="0 0 auto" width={!sitesIsCollapsed ? '400px' : undefined}>
          <SamplingSiteList setSitesIsCollapsed={setSitesIsCollapsed} sitesIsCollapsed={sitesIsCollapsed} />
        </Box>

        {/* Observations Component */}
        <Box flex="1 1 auto" display="flex" flexDirection="column" height="100%">
          <TaxonomyContextProvider>
            <ObservationsTableContextProvider>
              <ObservationsTableContext.Consumer>
                {(context) => {
                  if (!context._muiDataGridApiRef.current) {
                    return <CircularProgress className="pageProgress" size={40} />;
                  }

                  /* <ObservationsTableContainer /> */

                  return (
                    <Paper component={Stack} gap={0.5} flexDirection="column" flex="1 1 auto" height="100%">
                      <ObservationPanelContainer />
                    </Paper>
                  );
                }}
              </ObservationsTableContext.Consumer>
            </ObservationsTableContextProvider>
          </TaxonomyContextProvider>
        </Box>
      </Stack>
    </Box>
  );
};
