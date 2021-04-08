import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
  Typography
} from '@material-ui/core';
import { DATE_FORMAT } from 'constants/dateFormats';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import ProjectDetails from 'features/projects/view/ProjectDetails';
import ProjectSurveys from 'features/projects/view/ProjectSurveys';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { getFormattedDateRangeString } from 'utils/Utils';
import Icon from '@mdi/react';
import { mdiPaperclip, mdiClipboardCheckMultipleOutline, mdiInformationOutline } from '@mdi/js';

const useStyles = makeStyles((theme) => ({
  projectNav: {
    minWidth: '15rem',
    '& a': {
      color: theme.palette.primary.main
    },
    '& svg': {
      color: theme.palette.primary.main
    }
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
  }, [urlParams, biohubApi, isLoadingCodes, codes]);

  const getProject = useCallback(async () => {
    const codesResponse = await biohubApi.codes.getAllCodeSets();
    const projectWithDetailsResponse = await biohubApi.project.getProjectForView(urlParams['id']);

    if (!projectWithDetailsResponse || !codesResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
    setCodes(codesResponse);
  }, [biohubApi.codes, biohubApi.project, urlParams]);

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(true);
    }
  }, [urlParams, biohubApi, isLoadingProject, projectWithDetails, getProject]);

  if (!codes || !projectWithDetails) {
    return <CircularProgress></CircularProgress>;
  }

  return (
    <>
      <Paper elevation={2} square={true}>
        <Container maxWidth="xl">
          <Box py={3}>
            <Box mb={3}>
              <Breadcrumbs>
                <Link to="/projects" color="primary" aria-current="page">
                  Projects
                </Link>
                <Link to="details" color="primary" aria-current="page">
                  {projectWithDetails.project.project_name}
                </Link>
              </Breadcrumbs>
            </Box>
            <Box mb={1}>
              <Typography variant="h1">{projectWithDetails.project.project_name}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="textSecondary">
                <span>
                  {getFormattedDateRangeString(
                    DATE_FORMAT.MediumDateFormat,
                    projectWithDetails.project.start_date,
                    projectWithDetails.project.end_date
                  )}
                </span>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="row" py={6}>
          <Box component="aside" mr={3} mt={-2}>
            <List component="nav" className={classes.projectNav}>
              <ListItem button component={Link} to="details">
                <ListItemIcon>
                  <Icon path={mdiInformationOutline} size={1} />
                </ListItemIcon>
                <ListItemText>Project Details</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="surveys">
                <ListItemIcon>
                  <Icon path={mdiClipboardCheckMultipleOutline} size={1} />
                </ListItemIcon>
                <ListItemText>Surveys</ListItemText>
              </ListItem>
              <ListItem button component={Link} to="attachments">
                <ListItemIcon>
                  <Icon path={mdiPaperclip} size={1} />
                </ListItemIcon>
                <ListItemText>Attachments</ListItemText>
              </ListItem>
            </List>
          </Box>
          <Box component="article" flex="1 1 auto">
            {location.pathname.includes('/details') && (
              <ProjectDetails projectForViewData={projectWithDetails} codes={codes} refresh={getProject} />
            )}
            {location.pathname.includes('/surveys') && <ProjectSurveys projectForViewData={projectWithDetails} />}
            {location.pathname.includes('/attachments') && (
              <ProjectAttachments projectForViewData={projectWithDetails} />
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default ProjectPage;
