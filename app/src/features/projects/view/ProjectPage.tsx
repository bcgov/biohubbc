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
import ProjectSurveys from 'features/projects/view/ProjectAttachments';
import ProjectDetails from 'features/projects/view/ProjectDetails';
import ProjectAttachments from 'features/projects/view/ProjectSurveys';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProject } from 'interfaces/project-interfaces';
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

  // TODO this is using IProject in the mean time, but will eventually need something like IProjectRecord
  const [project, setProject] = useState<IProject | null>(null);

  useEffect(() => {
    const getProject = async () => {
      const projectResponse = await biohubApi.getProject(urlParams['id']);

      if (!projectResponse) {
        // TODO error handling/messaging
        return;
      }

      setProject(projectResponse);
    };

    if (!project) {
      getProject();
    }
  }, [urlParams, biohubApi, project]);

  if (!project) {
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
                  <Typography variant="body2">{project.name}</Typography>
                </Link>
              </Breadcrumbs>
            </Box>
            <Box mb={1}>
              <Typography variant="h1">{project.name}</Typography>
            </Box>
            <Box mb={3} display="flex">
              <Typography variant="subtitle2">
                {getFormattedDateRangeString(DATE_FORMAT.MediumDateFormat, project.start_date, project.end_date)}
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
              {location.pathname.includes('/details') && <ProjectDetails projectData={project} />}
              {location.pathname.includes('/surveys') && <ProjectSurveys projectData={project} />}
              {location.pathname.includes('/attachments') && <ProjectAttachments projectData={project} />}
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ProjectPage;
