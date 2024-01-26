import {
  mdiAccountMultipleOutline,
  mdiCalendarTodayOutline,
  mdiChevronDown,
  mdiCogOutline,
  mdiPencilOutline,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import PublishProjectDialog from 'components/publish/PublishProjectDialog';
import { ProjectRoleGuard } from 'components/security/Guards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DeleteProjectI18N } from 'constants/i18n';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDateRangeString } from 'utils/Utils';

/**
 * Project header for a single-project view.
 *
 * @return {*}
 */
const ProjectHeader = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const projectContext = useContext(ProjectContext);

  const [publishProjectDialogOpen, setPublishProjectDialogOpen] = useState<boolean>(false);

  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  const projectData = projectContext.projectDataLoader.data;

  const dialogContext = useContext(DialogContext);

  const showDeleteProjectDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: DeleteProjectI18N.deleteTitle,
      dialogText: DeleteProjectI18N.deleteText,
      yesButtonProps: { color: 'error' },
      yesButtonLabel: 'Delete',
      noButtonProps: { color: 'primary', variant: 'outlined' },
      noButtonLabel: 'Cancel',
      open: true,
      onYes: async () => {
        await deleteProject();
        dialogContext.setYesNoDialog({ open: false });
      },
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false })
    });
  };

  const deleteProject = async () => {
    try {
      const response = await biohubApi.project.deleteProject(projectContext.projectId);

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

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: DeleteProjectI18N.deleteErrorTitle,
      dialogText: DeleteProjectI18N.deleteErrorText,
      open: true,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps
    });
  };

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <>
      <PageHeader
        title={projectData?.projectData.project.project_name}
        subTitleJSX={
          <>
            {projectData.projectData.project.end_date ? (
              <Stack flexDirection="row" alignItems="center" gap={0.75} color="text.secondary">
                <Typography component="span">Project Timeline:</Typography>
                {getFormattedDateRangeString(
                  DATE_FORMAT.ShortMediumDateFormat,
                  projectData.projectData.project.start_date,
                  projectData.projectData.project.end_date
                )}
              </Stack>
            ) : (
              <Stack flexDirection="row" alignItems="center" gap={1}>
                <Icon path={mdiCalendarTodayOutline} size={0.75} />
                <Typography component="span">Start Date:</Typography>
                {getFormattedDateRangeString(
                  DATE_FORMAT.ShortMediumDateFormat,
                  projectData.projectData.project.start_date
                )}
              </Stack>
            )}
          </>
        }
        buttonJSX={
          <ProjectRoleGuard
            validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <>
              <Button
                id="project_settings-button"
                variant="outlined"
                color="primary"
                startIcon={<Icon path={mdiCogOutline} size={0.75} />}
                endIcon={<Icon path={mdiChevronDown} size={0.75} />}
                aria-label="Project Settings"
                aria-controls="projectSettingsMenu"
                aria-haspopup="true"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => setMenuAnchorEl(event.currentTarget)}>
                Settings
              </Button>
              <Menu
                id="projectSettingsMenu"
                aria-labelledby="project_settings_button"
                style={{ marginTop: '8px' }}
                anchorEl={menuAnchorEl}
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
                  validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR]}
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
            </>
          </ProjectRoleGuard>
        }
      />

      <PublishProjectDialog open={publishProjectDialogOpen} onClose={() => setPublishProjectDialogOpen(false)} />
    </>
  );
};

export default ProjectHeader;
