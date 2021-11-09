import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import ListItemIcon from '@material-ui/core/ListItemIcon';
// import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import ProjectDetails from 'features/projects/view/ProjectDetails';
import SurveysListPage from 'features/surveys/list/SurveysListPage';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ProjectHeader from './ProjectHeader';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';

/**
 * Page to display a single Project.
 *
 * @return {*}
 */
const ProjectPage: React.FC = () => {
  const urlParams = useParams();
  //const location = useLocation();
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
      <Paper elevation={2} square={true}>
        <ProjectHeader projectWithDetails={projectWithDetails} refresh={getProject} />
      </Paper>

      <Paper elevation={2} square={true}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between">
            <Box>
              <ProjectDetails projectForViewData={projectWithDetails} codes={codes} refresh={getProject} />
            </Box>
            <Box>
              <LocationBoundary projectForViewData={projectWithDetails} codes={codes} refresh={getProject} />
            </Box>
          </Box>
          <Box mt={3}>
            <SurveysListPage projectForViewData={projectWithDetails} />
          </Box>
          <Box mt={3}>
            <ProjectAttachments projectForViewData={projectWithDetails} />
          </Box>
        </Container>
      </Paper>
    </>
  );
};

export default ProjectPage;
