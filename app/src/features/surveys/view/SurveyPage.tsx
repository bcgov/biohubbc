import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { IMarkerLayer } from 'components/map/components/MarkerCluster';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import SubmissionAlertBar from 'components/publish/SubmissionAlertBar';
import { SurveyContext } from 'contexts/surveyContext';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { parseSpatialDataByType } from 'utils/spatial-utils';
import SurveyStudyArea from './components/SurveyStudyArea';
import SurveyAttachments from './SurveyAttachments';
import SurveyHeader from './SurveyHeader';
import SurveyObservations from './SurveyObservations';
import SurveySummaryResults from './SurveySummaryResults';

/**
 * Page to display a single Survey.
 *
 * @return {*}
 */
const SurveyPage: React.FC = () => {
  const urlParams = useParams();

  const biohubApi = useBiohubApi();
  const surveyContext = useContext(SurveyContext);
  const surveyForViewData = surveyContext.surveyDataLoader.data;
  const occurrence_submission_id =
    surveyForViewData?.surveySupplementaryData?.occurrence_submission.occurrence_submission_id;

  const [markerLayers, setMarkerLayers] = useState<IMarkerLayer[]>([]);
  const [staticLayers, setStaticLayers] = useState<IStaticLayer[]>([]);

  const codesDataLoader = useDataLoader(() => biohubApi.codes.getAllCodeSets());
  useDataLoaderError(codesDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Codes Details',
      dialogText:
        'An error has occurred while attempting to load codes details, please try again. If the error persists, please contact your system administrator.'
    };
  });
  codesDataLoader.load();

  const projectDataLoader = useDataLoader(() => biohubApi.project.getProjectForView(urlParams['id']));
  useDataLoaderError(projectDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Project Details',
      dialogText:
        'An error has occurred while attempting to load project details, please try again. If the error persists, please contact your system administrator.'
    };
  });
  projectDataLoader.load();

  const mapDataLoader = useDataLoader((occurrenceSubmissionId: number) =>
    biohubApi.observation.getOccurrencesForView(occurrenceSubmissionId)
  );
  useDataLoaderError(mapDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Map Data',
      dialogText:
        'An error has occurred while attempting to load map data, please try again. If the error persists, please contact your system administrator.'
    };
  });

  useEffect(() => {
    if (mapDataLoader.data) {
      const result = parseSpatialDataByType(mapDataLoader.data);

      setMarkerLayers(result.markerLayers);
      setStaticLayers(result.staticLayers);
    }
  }, [mapDataLoader.data]);

  if (occurrence_submission_id) {
    mapDataLoader.load(occurrence_submission_id);
  }

  if (!projectDataLoader.data || !codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader projectWithDetails={projectDataLoader.data} />
      <Container maxWidth="xl">
        <Box my={3}>
          <Grid container spacing={3}>
            <Grid item md={12}>
              <SubmissionAlertBar />
            </Grid>
            <Grid item md={12} lg={4}>
              <Paper elevation={0}>
                <SurveyDetails projectForViewData={projectDataLoader.data} codes={codesDataLoader.data} />
              </Paper>
            </Grid>
            <Grid item md={12} lg={8}>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyObservations />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveySummaryResults />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyAttachments projectForViewData={projectDataLoader.data} />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyStudyArea
                    projectForViewData={projectDataLoader.data}
                    mapLayersForView={{ markerLayers: markerLayers, staticLayers: staticLayers }}
                  />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default SurveyPage;
