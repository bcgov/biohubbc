import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import ProjectDetails from 'features/projects/view/ProjectDetails';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ProjectHeader from './ProjectHeader';

/**
 * Page to display a single Project.
 *
 * @return {*}
 */
const ProjectPage: React.FC = () => {
  const urlParams = useParams();

  const restorationTrackerApi = useRestorationTrackerApi();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await restorationTrackerApi.codes.getAllCodeSets();

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
  }, [urlParams, restorationTrackerApi.codes, isLoadingCodes, codes]);

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await restorationTrackerApi.project.getProjectForView(urlParams['id']);

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [restorationTrackerApi.project, urlParams]);

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
        <Box my={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Box>
                <ProjectDetails projectForViewData={projectWithDetails} codes={codes} refresh={getProject} />
              </Box>
              <Box mt={3}>
                <ProjectAttachments projectForViewData={projectWithDetails} />
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <LocationBoundary projectForViewData={projectWithDetails} codes={codes} refresh={getProject} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default ProjectPage;
