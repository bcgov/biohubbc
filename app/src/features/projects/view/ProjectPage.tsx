import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import SurveysListPage from 'features/surveys/list/SurveysListPage';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ProjectDetails from './ProjectDetails';
import ProjectHeader from './ProjectHeader';

/**
 * Page to display a single Project.
 *
 * @return {*}
 */
const ProjectPage: React.FC = () => {
  const urlParams = useParams();

  const biohubApi = useBiohubApi();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.codes.getAllCodeSets();

      if (!codesResponse) {
        // TODO error handling/messaging
        return;
      }

      setCodes(codesResponse);
    };

    if (!isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(true);
    }
  }, [urlParams, biohubApi.codes, isLoadingCodes, codes]);

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await biohubApi.project.getProjectForView(urlParams['id']);

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [biohubApi.project, urlParams]);

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  if (!codes || !projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <ProjectHeader projectWithDetails={projectWithDetails} refresh={getProject} />

      <Container maxWidth="xl">
        <Box py={3}>
          <Grid container spacing={3}>
            <Grid item md={12} lg={4}>
              <Paper elevation={0}>
                <ProjectDetails projectForViewData={projectWithDetails} codes={codes} refresh={getProject} />
              </Paper>
            </Grid>
            <Grid item md={12} lg={8}>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveysListPage projectForViewData={projectWithDetails} />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <ProjectAttachments projectForViewData={projectWithDetails} />
                </Paper>
              </Box>
              <Box>
                <Paper elevation={0}>
                  <LocationBoundary projectForViewData={projectWithDetails} codes={codes} refresh={getProject} />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default ProjectPage;
