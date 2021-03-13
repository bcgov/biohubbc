import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core';
import { AssignmentOutlined, DescriptionOutlined, InfoOutlined } from '@material-ui/icons';
import { DATE_FORMAT } from 'constants/dateFormats';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import ProjectDetails from 'features/projects/view/ProjectDetails';
import ProjectSurveys from 'features/projects/view/ProjectSurveys';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import { IGetAllCodesResponse } from 'interfaces/useBioHubApi-interfaces';
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { getFormattedDateRangeString } from 'utils/Utils';

const useStyles = makeStyles((theme) => ({
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  breadCrumbLinkIcon: {
    marginRight: '0.25rem'
  }
}));

/**
 * Page to display a single Project.
 *
 * // TODO WIP
 *
 * @return {*}
 */
const ProjectPage: React.FC = () => {
  const urlParams = useParams();
  const location = useLocation();

  const biohubApi = useBiohubApi();

  const classes = useStyles();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IProjectWithDetails | null>(null);

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodesResponse>();

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.getAllCodes();

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
  }, [urlParams, biohubApi, isLoadingCodes, codes]);

  useEffect(() => {
    const getProject = async () => {
      const codesResponse = await biohubApi.getAllCodes();
      const projectWithDetailsResponse = await biohubApi.getProject(urlParams['id']);

      if (!projectWithDetailsResponse || !codesResponse) {
        // TODO error handling/messaging
        return;
      }

      setProjectWithDetails(projectWithDetailsResponse);
      setCodes(codesResponse);
    };

    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(true);
    }
  }, [urlParams, biohubApi, isLoadingProject, projectWithDetails]);

  if (!codes || !projectWithDetails) {
    return <CircularProgress></CircularProgress>;
  }

  return (
    <>
      <Paper elevation={2} square={true}>
        <Box py={3}>
          <Container maxWidth={false}>
            <Box mb={3}>
              <Breadcrumbs>
                <Link to="/projects" color="primary" aria-current="page" className={classes.breadCrumbLink}>
                  <Typography variant="body2">Projects</Typography>
                </Link>
                <Link to="details" color="primary" aria-current="page" className={classes.breadCrumbLink}>
                  <Typography variant="body2">{projectWithDetails.project.project_name}</Typography>
                </Link>
              </Breadcrumbs>
            </Box>
            <Box mb={1}>
              <Typography variant="h1">{projectWithDetails.project.project_name}</Typography>
            </Box>
            <Box mb={3} display="flex">
              <Typography variant="subtitle2">
                {getFormattedDateRangeString(
                  DATE_FORMAT.MediumDateFormat,
                  projectWithDetails.project.start_date,
                  projectWithDetails.project.end_date
                )}
              </Typography>
              <Divider orientation="vertical" flexItem style={{ margin: '0 0.6rem' }} />
              <Typography variant="subtitle2">TODO Set Project Regions</Typography>
            </Box>
          </Container>
        </Box>
      </Paper>
      <Box my={3}>
        <Container maxWidth={false}>
          <Box display="flex" flexDirection="row">
            <Box mr={5}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <InfoOutlined />
                  </ListItemIcon>
                  <ListItemText>
                    <Link to="details" color="primary" aria-current="page" className={classes.breadCrumbLink}>
                      <Typography variant="body2">Project Details</Typography>
                    </Link>
                  </ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AssignmentOutlined />
                  </ListItemIcon>
                  <ListItemText>
                    <Link to="surveys" color="primary" aria-current="page" className={classes.breadCrumbLink}>
                      <Typography variant="body2">Surveys</Typography>
                    </Link>
                  </ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionOutlined />
                  </ListItemIcon>
                  <ListItemText>
                    <Link to="attachments" color="primary" aria-current="page" className={classes.breadCrumbLink}>
                      <Typography variant="body2">Attachments</Typography>
                    </Link>
                  </ListItemText>
                </ListItem>
              </List>
            </Box>
            <Box width="100%">
              {location.pathname.includes('/details') && (
                <ProjectDetails projectWithDetailsData={projectWithDetails} codes={codes} />
              )}
              {location.pathname.includes('/surveys') && <ProjectSurveys projectWithDetailsData={projectWithDetails} />}
              {location.pathname.includes('/attachments') && (
                <ProjectAttachments projectWithDetailsData={projectWithDetails} />
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ProjectPage;
