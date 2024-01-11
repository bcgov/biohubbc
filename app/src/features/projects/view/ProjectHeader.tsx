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
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
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
import grey from '@mui/material/colors/grey';

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
      <Paper
        square
        elevation={0}
        sx={{
          borderBottom: '1px solid' + grey[300]
        }}
      >
        <Container maxWidth="xl" sx={{ py: {xs: 2, sm: 3 }}}>
          <Stack
            alignItems="flex-start"
            flexDirection={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            gap={3}>
            <Box>
              <Typography
                variant="h1"
                sx={{
                  my: -0.5,
                  py: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  maxWidth: '72ch',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                {projectData?.projectData.project.project_name}
              </Typography>
              <Stack flexDirection="row" alignItems="center" gap={1} mt={1} mb={0.25}>
                <>
                  {projectData.projectData.project.end_date ? (
                    <Stack flexDirection="row" alignItems="center" gap={0.75}>
                      <Icon path={mdiCalendarRangeOutline} size={0.75} />
                      <Typography component="span" color="textSecondary">
                        Project Timeline:
                      </Typography>
                      {getFormattedDateRangeString(
                        DATE_FORMAT.ShortMediumDateFormat,
                        projectData.projectData.project.start_date,
                        projectData.projectData.project.end_date
                      )}
                    </Stack>
                  ) : (
                    <Stack flexDirection="row" alignItems="center" gap={1}>
                      <Icon path={mdiCalendarTodayOutline} size={0.75} />
                      <Typography component="span" color="textSecondary">
                        Start Date:
                      </Typography>
                      {getFormattedDateRangeString(
                        DATE_FORMAT.ShortMediumDateFormat,
                        projectData.projectData.project.start_date
                      )}
                    </Stack>
                  )}
                </>
              </Stack>
            </Box>
            <Stack flexDirection="row" alignItems="center" gap={1}>
              <ProjectRoleGuard
                validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <>
                  <Button
                    id="project_settings-button"
                    variant="outlined"
                    color="primary"
                    startIcon={<Icon path={mdiCogOutline} size={1} />}
                    endIcon={<Icon path={mdiChevronDown} size={1} />}
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
            </Stack>
          </Stack>
        </Container>

      </Paper>

      <PublishProjectDialog open={publishProjectDialogOpen} onClose={() => setPublishProjectDialogOpen(false)} />
    </>
  );
};

export default ProjectHeader;
