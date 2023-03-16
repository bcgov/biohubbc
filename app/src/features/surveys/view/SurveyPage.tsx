import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { IMarkerLayer } from 'components/map/components/MarkerCluster';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import { useSurveyContext } from 'contexts/surveyContext';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
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

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);

  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();

  const [markerLayers, setMarkerLayers] = useState<IMarkerLayer[]>([]);
  const [staticLayers, setStaticLayers] = useState<IStaticLayer[]>([]);

  const mapDataLoader = useDataLoader((datasetID: number) => biohubApi.observation.getOccurrencesForView(datasetID));
  useDataLoaderError(mapDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Map Data',
      dialogText:
        'An error has occurred while attempting to load map data, please try again. If the error persists, please contact your system administrator.'
    };
  });

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.codes.getAllCodeSets();

      if (!codesResponse) {
        return;
      }

      setCodes(codesResponse);
    };

    if (isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(false);
    }
  }, [urlParams, biohubApi.codes, isLoadingCodes, codes]);

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await biohubApi.project.getProjectForView(urlParams['id']);

    if (!projectWithDetailsResponse) {
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [biohubApi.project, urlParams]);

  const surveyContext = useSurveyContext();
  const surveyWithDetails = surveyContext.surveyDataLoader.data;

  useEffect(() => {
    if (mapDataLoader.data) {
      const result = parseSpatialDataByType(mapDataLoader.data);

      setMarkerLayers(result.markerLayers);
      setStaticLayers(result.staticLayers);
    }
  }, [mapDataLoader.data]);

  useEffect(() => {
    if (isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(false);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  if (!projectWithDetails || !surveyWithDetails || !codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleRefresh = () => {
    throw new Error('Not implmented yet!');
  }

  return (
    <>
      <SurveyHeader projectWithDetails={projectWithDetails} />
      <Container maxWidth="xl">
        <Box my={3}>
          <Grid container spacing={3}>
            <Grid item md={12} lg={4}>
              <Paper elevation={0}>
                <SurveyDetails
                  projectForViewData={projectWithDetails}
                  codes={codes}
                />
              </Paper>
            </Grid>
            <Grid item md={12} lg={8}>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyObservations refresh={handleRefresh} />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveySummaryResults />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyAttachments projectForViewData={projectWithDetails} />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveyStudyArea
                    projectForViewData={projectWithDetails}
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
