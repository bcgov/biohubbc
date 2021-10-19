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
import {
  mdiClipboardCheckMultipleOutline,
  mdiTrashCanOutline,
  mdiInformationOutline,
  mdiPaperclip,
  mdiToggleSwitch,
  mdiToggleSwitchOffOutline
} from '@mdi/js';
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
import { AuthStateContext } from 'contexts/authStateContext';
import { DeleteProjectI18N, PublishProjectI18N } from 'constants/i18n';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { APIError } from 'hooks/api/useAxios';
import { SYSTEM_ROLE } from 'constants/roles';
import { Tooltip } from '@material-ui/core';
import { ProjectStatusType } from 'constants/misc';
import Chip from '@material-ui/core/Chip';
import clsx from 'clsx';

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
  },
  chip: {
    padding: '0px 8px',
    borderRadius: '4px',
    color: 'white'
  },
  chipActive: {
    backgroundColor: theme.palette.warning.main
  },
  chipCompleted: {
    backgroundColor: theme.palette.success.main
  },
  spacingRight: {
    paddingRight: '1rem'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
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

  const { keycloakWrapper } = useContext(AuthStateContext);

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
    dialogTitle: DeleteProjectI18N.deleteTitle,
    dialogText: DeleteProjectI18N.deleteText,
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const deleteErrorDialogProps = {
    dialogTitle: DeleteProjectI18N.deleteErrorTitle,
    dialogText: DeleteProjectI18N.deleteErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const publishErrorDialogProps = {
    ...deleteErrorDialogProps,
    dialogTitle: PublishProjectI18N.publishErrorTitle,
    dialogText: PublishProjectI18N.publishErrorText
  };

  const publishProject = async (publish: boolean) => {
    if (!projectWithDetails) {
      return;
    }

    try {
      const response = await biohubApi.project.publishProject(projectWithDetails.id, publish);

      if (!response) {
        showPublishErrorDialog({ open: true });
        return;
      }

      await getProject();
    } catch (error) {
      const apiError = error as APIError;
      showPublishErrorDialog({ dialogText: apiError.message, open: true });
      return error;
    }
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

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...deleteErrorDialogProps, ...textDialogProps, open: true });
  };

  const showPublishErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...publishErrorDialogProps, ...textDialogProps, open: true });
  };

  const deleteProject = async () => {
    if (!projectWithDetails) {
      return;
    }

    try {
      const response = await biohubApi.project.deleteProject(projectWithDetails.id);

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }

      history.push(`/admin/projects`);
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogText: apiError.message, open: true });
      return error;
    }
  };

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (ProjectStatusType.ACTIVE === status_name) {
      chipLabel = 'ACTIVE';
      chipStatusClass = classes.chipActive;
    } else if (ProjectStatusType.COMPLETED === status_name) {
      chipLabel = 'COMPLETED';
      chipStatusClass = classes.chipCompleted;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  if (!codes || !projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  // Show delete button if you are a system admin or a project admin
  const showDeleteProjectButton = keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]);
  // Enable delete button if you a system admin OR a project admin and the project is not published
  const enableDeleteProjectButton =
    keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.SYSTEM_ADMIN]) ||
    (keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.PROJECT_ADMIN]) && !projectWithDetails.project.publish_date);

  return (
    <>
      <Paper elevation={2} square={true}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between">
            <Box py={4}>
              <Box mb={1} display="flex">
                <Typography className={classes.spacingRight} variant="h1">
                  {projectWithDetails.project.project_name}
                </Typography>
                {getChipIcon(projectWithDetails.project.completion_status)}
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
                className={classes.actionButton}
                color="primary"
                data-testid="publish-project-button"
                startIcon={
                  <Icon
                    path={projectWithDetails.project.publish_date ? mdiToggleSwitch : mdiToggleSwitchOffOutline}
                    size={1}
                  />
                }
                onClick={async () => await publishProject(!projectWithDetails.project.publish_date)}>
                {projectWithDetails.project.publish_date ? 'Unpublish Project' : 'Publish Project'}
              </Button>
              {showDeleteProjectButton && (
                <Tooltip
                  arrow
                  color="secondary"
                  title={!enableDeleteProjectButton ? 'Cannot delete a published project' : ''}>
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      className={classes.actionButton}
                      data-testid="delete-project-button"
                      startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
                      onClick={showDeleteProjectDialog}
                      disabled={!enableDeleteProjectButton}>
                      Delete Project
                    </Button>
                  </>
                </Tooltip>
              )}
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
