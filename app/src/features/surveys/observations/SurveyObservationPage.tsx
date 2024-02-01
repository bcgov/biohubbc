import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
// import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { ObservationsTableContext, ObservationsTableContextProvider } from 'contexts/observationsTableContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import { useContext, useState } from 'react';
import ObservationsTableContainer from './observations-table/ObservationsTableContainer';
import SamplingSiteList from './sampling-sites/SamplingSiteList';
import SurveyObservationHeader from './SurveyObservationHeader';

export const SurveyObservationPage = () => {
  const surveyContext = useContext(SurveyContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

      <Stack
        direction="row"
        gap={1}
        sx={{
          flex: '1 1 auto',
          p: 1
        }}>
        {/* Sampling Site List */}
        <Box flex="0 0 auto" width={!isCollapsed ? '400px' : undefined}>
          <SamplingSiteList setIsCollapsed={setIsCollapsed} isCollapsed={isCollapsed} />
        </Box>

        {/* Observations Component */}
        <Box flex="1 1 auto">
          <TaxonomyContextProvider>
            <ObservationsTableContextProvider>
              <ObservationsTableContext.Consumer>
                {(context) => {
                  if (!context._muiDataGridApiRef.current) {
                    return <CircularProgress className="pageProgress" size={40} />;
                  }

                  return <ObservationsTableContainer />;
                }}
              </ObservationsTableContext.Consumer>
            </ObservationsTableContextProvider>
          </TaxonomyContextProvider>
        </Box>
      </Stack>
    </Box>
  );
};
