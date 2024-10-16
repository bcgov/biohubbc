import {
  mdiAccountMultipleOutline,
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
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import { ProjectRoleGuard } from 'components/security/Guards';
import { DeleteProjectI18N } from 'constants/i18n';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';

/**
 * Project header for a single-project view.
 *
 * @return {*}
 */
const ProjectHeader = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const projectContext = useContext(ProjectContext);

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

      history.push(`/admin/summary`);
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogErrorDetails: [apiError.message], open: true });
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
    </>
  );
};

export default ProjectHeader;
