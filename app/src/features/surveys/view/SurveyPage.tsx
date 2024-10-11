import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContextProvider } from 'contexts/taxonomyContext';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import React, { useContext, useEffect } from 'react';
import { SurveySamplingTableContainer } from './components/sampling-data/SurveySamplingTableContainer';
import SurveyStudyArea from './components/SurveyStudyArea';
import { SurveySpatialContainer } from './survey-spatial/SurveySpatialContainer';
import SurveyAttachments from './SurveyAttachments';
import SurveyHeader from './SurveyHeader';

/**
 * Page to display a single Survey.
 *
 * @return {*}
 */
const SurveyPage: React.FC = () => {
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  if (!codesContext.codesDataLoader.data || !surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack gap={3}>
          <Paper>
            <SurveySamplingTableContainer />
          </Paper>

          <Paper>
            <TaxonomyContextProvider>
              <SurveySpatialContainer />
            </TaxonomyContextProvider>
          </Paper>

          <Paper>
            <SurveyAttachments />
          </Paper>

          <SurveyDetails />
        </Stack>
        <Paper sx={{ display: 'none' }}>
          <SurveyStudyArea />
        </Paper>
      </Container>
    </>
  );
};

export default SurveyPage;
