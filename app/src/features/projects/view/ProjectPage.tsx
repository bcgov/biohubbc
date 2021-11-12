import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import ProjectDetails from 'features/projects/view/ProjectDetails';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SurveysListPage from 'features/surveys/list/SurveysListPage';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ProjectHeader from './ProjectHeader';

const useStyles = makeStyles((theme: Theme) => ({
  detailsAndLocationWrapper: {
    flexDirection: 'row',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column'
    }
  },
  detailsSection: {
    [theme.breakpoints.up('lg')]: {
      marginRight: theme.spacing(4)
    }
  },
  locationSection: {
    [theme.breakpoints.down('md')]: {
      marginTop: theme.spacing(3)
    }
  }
}));

/**
 * Page to display a single Project.
 *
 * @return {*}
 */
const ProjectPage: React.FC = () => {
  const classes = useStyles();
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
        <Box display="flex" justifyContent="space-between" className={classes.detailsAndLocationWrapper}>
          <Box className={classes.detailsSection} flexShrink="1">
            <Box component={Paper} px={4} pb={2}>
              <ProjectDetails projectForViewData={projectWithDetails} codes={codes} refresh={getProject} />
            </Box>
          </Box>
          <Box className={classes.locationSection} flexShrink="0" flexBasis="500px">
            <Box component={Paper} px={4} pb={2}>
              <LocationBoundary projectForViewData={projectWithDetails} codes={codes} refresh={getProject} />
            </Box>
          </Box>
        </Box>
        <Box mt={3}>
          <SurveysListPage projectForViewData={projectWithDetails} />
        </Box>
        <Box my={3}>
          <ProjectAttachments projectForViewData={projectWithDetails} />
        </Box>
      </Container>
    </>
  );
};

export default ProjectPage;
