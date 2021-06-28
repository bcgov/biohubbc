import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { mdiClipboardCheckMultipleOutline, mdiTrashCanOutline, mdiInformationOutline, mdiPaperclip } from '@mdi/js';
import Icon from '@mdi/react';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import ProjectDetails from 'features/projects/view/ProjectDetails';
import SurveysListPage from 'features/surveys/list/SurveysListPage';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useLocation, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import { getFormattedDateRangeString } from 'utils/Utils';
import Button from '@material-ui/core/Button';
import { DialogContext } from 'contexts/dialogContext';
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  projectNav: {
    minWidth: '15rem',
    '& a': {
      color: theme.palette.text.secondary,
      '&:hover': {
        background: 'rgba(0, 51, 102, 0.05)'
      }
    },
    '& a.active': {
      color: theme.palette.primary.main,
      background: 'rgba(0, 51, 102, 0.05)',
      '& svg': {
        color: theme.palette.primary.main
      }
    }
  }
}));

/**
 * Page to display a single Project.
 *
 * @return {*}
 */
const ProjectPage: React.FC = () => {
  const urlParams = useParams();
  const location = useLocation();
  const biohubApi = useBiohubApi();
  const history = useHistory();

  const dialogContext = useContext(DialogContext);

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

  const defaultYesNoDialogProps = {
    dialogTitle: 'Delete Project',
    dialogText: 'Are you sure you want to delete this project, its attachments and associated surveys/observations?',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const showDeleteProjectDialog = () => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      onYes: () => {
        deleteProject();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deleteProject = async () => {
    if (!projectWithDetails) {
      return;
    }

    try {
      const response = await biohubApi.project.deleteProject(projectWithDetails.id);

      if (!response) {
        return;
      }

      history.push(`/projects`);
    } catch (error) {
      return error;
    }
  };

  if (!codes || !projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Paper elevation={2} square={true}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between">
            <Box py={4}>
              <Box mb={1}>
                <Typography variant="h1">{projectWithDetails.project.project_name}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" color="textSecondary">
                  <span>
                    {projectWithDetails.project.end_date ? (
                      <>
                        {getFormattedDateRangeString(
                          DATE_FORMAT.ShortMediumDateFormat,
                          projectWithDetails.project.start_date,
                          projectWithDetails.project.end_date
                        )}
                      </>
                    ) : (
                      <>
                        <span>Start Date:</span>{' '}
                        {getFormattedDateRangeString(
                          DATE_FORMAT.ShortMediumDateFormat,
                          projectWithDetails.project.start_date
                        )}
                      </>
                    )}
                  </span>
                </Typography>
              </Box>
            </Box>
            <Box ml={4} mt={4} mb={4}>
              <Button
                variant="outlined"
                color="primary"
                data-testid="delete-project-button"
                startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
                onClick={showDeleteProjectDialog}>
                Delete Project
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="row" py={6}>
          <Box component="aside" mr={6} mt={-2}>
            <Paper>
              <List component="nav" role="navigation" className={classes.projectNav} aria-label="Project Navigation">
                <ListItem component={NavLink} to="details">
                  <ListItemIcon>
                    <Icon path={mdiInformationOutline} size={1} />
                  </ListItemIcon>
                  <ListItemText>Project Details</ListItemText>
                </ListItem>
                <ListItem component={NavLink} to="surveys">
                  <ListItemIcon>
                    <Icon path={mdiClipboardCheckMultipleOutline} size={1} />
                  </ListItemIcon>
                  <ListItemText>Surveys</ListItemText>
                </ListItem>
                <ListItem component={NavLink} to="attachments">
                  <ListItemIcon>
                    <Icon path={mdiPaperclip} size={1} />
                  </ListItemIcon>
                  <ListItemText>Attachments</ListItemText>
                </ListItem>
              </List>
            </Paper>
          </Box>
          <Box component="article" flex="1 1 auto">
            {location.pathname.includes('/details') && (
              <ProjectDetails projectForViewData={projectWithDetails} codes={codes} refresh={getProject} />
            )}
            {location.pathname.includes('/surveys') && <SurveysListPage projectForViewData={projectWithDetails} />}
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
