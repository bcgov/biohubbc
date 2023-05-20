import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import {
  mdiAccountMultipleOutline,
  mdiCalendarRangeOutline,
  mdiCalendarTodayOutline,
  mdiChevronDown,
  mdiCogOutline,
  mdiPencilOutline,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import assert from 'assert';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PublishProjectDialog from 'components/publish/PublishProjectDialog';
import { ProjectRoleGuard, SystemRoleGuard } from 'components/security/Guards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DeleteProjectI18N } from 'constants/i18n';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDateRangeString } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  titleActions: {
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75)
  },
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
  projectTitleContainer: {
    maxWidth: '150ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  projectTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    overflow: 'hidden'
  },
  chip: {
    color: '#ffffff'
  },
  chipActive: {
    backgroundColor: theme.palette.success.main
  },
  chipCompleted: {
    backgroundColor: theme.palette.primary.main
  },
  projectMeta: {
    marginTop: theme.spacing(3),
    marginBottom: 0,
    '& dd': {
      flex: '0 0 200px',
      color: theme.palette.text.secondary
    },
    '& dt': {
      flex: '1 1 auto'
    }
  },
  projectMetaRow: {
    display: 'flex',
    '& + div': {
      marginTop: theme.spacing(0.25)
    }
  }
}));

/**
 * Project header for a single-project view.
 *
 * @return {*}
 */
const ProjectHeader = () => {
  const classes = useStyles();

  const history = useHistory();
  const biohubApi = useBiohubApi();

  const projectContext = useContext(ProjectContext);

  const [publishProjectDialogOpen, setPublishProjectDialogOpen] = useState<boolean>(false);

  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  const projectData = projectContext.projectDataLoader.data;

  const dialogContext = useContext(DialogContext);

  const showDeleteProjectDialog = () => {
    dialogContext.showYesNoDialog({
      dialogTitle: DeleteProjectI18N.deleteTitle,
      dialogText: DeleteProjectI18N.deleteText,
      yesButtonProps: { color: 'secondary' },
      yesButtonLabel: 'Delete',
      noButtonProps: { color: 'primary', variant: 'outlined' },
      noButtonLabel: 'Cancel',
      onYes: async () => {
        await deleteProject();
        dialogContext.hideDialog();
      },
      onClose: () => dialogContext.hideDialog(),
      onNo: () => dialogContext.hideDialog()
    });
  };

  const deleteProject = async () => {
    try {
      const response = await biohubApi.project.deleteProject(projectContext.projectId);

      if (!response) {
        showDeleteErrorDialog({  });
        return;
      }

      history.push(`/admin/projects`);
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogText: apiError.message,  });
      return error;
    }
  };

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.showErrorDialog({
      dialogTitle: DeleteProjectI18N.deleteErrorTitle,
      dialogText: DeleteProjectI18N.deleteErrorText,
      onClose: () => dialogContext.hideDialog(),
      ...textDialogProps
    });
  };

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <>
      <Paper square={true} elevation={0}>
        <Container maxWidth="xl">
          <Box py={4}>
            <Box display="flex" justifyContent="space-between">
              <Box className={classes.projectTitleContainer}>
                <Typography variant="h1" className={classes.projectTitle}>
                  Project: <span>{projectData?.projectData.project.project_name}</span>
                </Typography>
                <Box mt={0.75} display="flex" alignItems="center">
                  <Typography
                    component="span"
                    variant="subtitle1"
                    color="textSecondary"
                    style={{ display: 'flex', alignItems: 'center' }}>
                    {projectData.projectData.project.end_date ? (
                      <>
                        <Icon path={mdiCalendarRangeOutline} size={0.9} style={{ marginRight: '0.5rem' }} />
                        Project Timeline:&nbsp;&nbsp;
                        {getFormattedDateRangeString(
                          DATE_FORMAT.ShortMediumDateFormat,
                          projectData.projectData.project.start_date,
                          projectData.projectData.project.end_date
                        )}
                      </>
                    ) : (
                      <>
                        <Icon path={mdiCalendarTodayOutline} size={0.9} style={{ marginRight: '0.5rem' }} />
                        Start Date:&nbsp;&nbsp;
                        {getFormattedDateRangeString(
                          DATE_FORMAT.ShortMediumDateFormat,
                          projectData.projectData.project.start_date
                        )}
                      </>
                    )}
                  </Typography>
                </Box>
              </Box>
              <Box flex="0 0 auto" className={classes.titleActions}>
                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <Button
                    title="Submit Project Documents"
                    color="primary"
                    variant="contained"
                    onClick={() => setPublishProjectDialogOpen(true)}
                    style={{ minWidth: '8rem' }}>
                    <strong>Submit</strong>
                  </Button>
                </SystemRoleGuard>
                <ProjectRoleGuard
                  validProjectRoles={[PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_LEAD]}
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <Button
                    id="project_settings-button"
                    variant="outlined"
                    color="primary"
                    startIcon={<Icon path={mdiCogOutline} size={1} />}
                    endIcon={<Icon path={mdiChevronDown} size={1} />}
                    aria-label="Project Settings"
                    aria-controls="projectSettingsMenu"
                    aria-haspopup="true"
                    style={{ marginLeft: '0.5rem' }}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => setMenuAnchorEl(event.currentTarget)}>
                    Settings
                  </Button>
                </ProjectRoleGuard>
                <Menu
                  id="projectSettingsMenu"
                  aria-labelledby="project_settings_button"
                  style={{ marginTop: '8px' }}
                  anchorEl={menuAnchorEl}
                  getContentAnchorEl={null}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                  keepMounted
                  open={Boolean(menuAnchorEl)}
                  onClose={() => setMenuAnchorEl(null)}>
                  <MenuItem onClick={() => history.push('edit')}>
                    <ListItemIcon>
                      <Icon path={mdiPencilOutline} size={1} />
                    </ListItemIcon>
                    <Typography variant="inherit">Edit Project Details</Typography>
                  </MenuItem>
                  <ProjectRoleGuard
                    validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD]}
                    validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                    <MenuItem onClick={() => history.push('users')}>
                      <ListItemIcon>
                        <Icon path={mdiAccountMultipleOutline} size={1} />
                      </ListItemIcon>
                      <Typography variant="inherit">Manage Project Team</Typography>
                    </MenuItem>
                    <MenuItem onClick={showDeleteProjectDialog} data-testid={'delete-project-button'}>
                      <ListItemIcon>
                        <Icon path={mdiTrashCanOutline} size={1} />
                      </ListItemIcon>
                      <Typography variant="inherit">Delete Project</Typography>
                    </MenuItem>
                  </ProjectRoleGuard>
                </Menu>
              </Box>
            </Box>
          </Box>
        </Container>
      </Paper>

      <PublishProjectDialog open={publishProjectDialogOpen} onClose={() => setPublishProjectDialogOpen(false)} />
    </>
  );
};

export default ProjectHeader;
