import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { IMarkerLayer } from 'components/map/components/MarkerCluster';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import SubmissionAlertBar from 'components/publish/SubmissionAlertBar';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import React, { useEffect, useState } from 'react';
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

  const [markerLayers, setMarkerLayers] = useState<IMarkerLayer[]>([]);
  const [staticLayers, setStaticLayers] = useState<IStaticLayer[]>([]);

  const codesDataLoader = useDataLoader(() => biohubApi.codes.getAllCodeSets());
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

  const surveyDataLoader = useDataLoader(() =>
    biohubApi.survey.getSurveyForView(urlParams['id'], urlParams['survey_id'])
  );
  useDataLoaderError(surveyDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Survey Details',
      dialogText:
        'An error has occurred while attempting to load survey details, please try again. If the error persists, please contact your system administrator.'
    };
  });
  surveyDataLoader.load();

  const mapDataLoader = useDataLoader((datasetID: number) => biohubApi.observation.getOccurrencesForView(datasetID));
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

  if (!projectDataLoader.data || !surveyDataLoader.data || !codesDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <SurveyHeader
        projectWithDetails={projectDataLoader.data}
        surveyWithDetails={surveyDataLoader.data}
        refresh={surveyDataLoader.refresh}
      />
      <Container maxWidth="xl">
        <Box my={3}>
          <Grid container spacing={3}>
            <Grid item md={12}>
              <SubmissionAlertBar submitted={false} />
            </Grid>
            <Grid item md={12} lg={4}>
              <Paper elevation={0}>
                <SurveyDetails
                  projectForViewData={projectDataLoader.data}
                  surveyForViewData={surveyDataLoader.data}
                  codes={codesDataLoader.data}
                  refresh={surveyDataLoader.refresh}
                />
              </Paper>
            </Grid>
            <Grid item md={12} lg={8}>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyObservations refresh={surveyDataLoader.refresh} />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveySummaryResults />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyAttachments
                    projectForViewData={projectDataLoader.data}
                    surveyForViewData={surveyDataLoader.data}
                  />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyStudyArea
                    surveyForViewData={surveyDataLoader.data}
                    projectForViewData={projectDataLoader.data}
                    mapLayersForView={{ markerLayers: markerLayers, staticLayers: staticLayers }}
                    refresh={surveyDataLoader.refresh}
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
