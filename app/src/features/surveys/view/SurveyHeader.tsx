import {
  mdiCalendarRangeOutline,
  mdiChevronDown,
  mdiCogOutline,
  mdiPencilOutline,
  mdiTrashCanOutline,
  // mdiCircle,
  mdiMapMarkerOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PublishSurveyDialog from 'components/publish/PublishSurveyDialog';
import { ProjectRoleGuard, SystemRoleGuard } from 'components/security/Guards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DeleteSurveyI18N } from 'constants/i18n';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyContext } from 'contexts/surveyContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import Link from '@mui/material/Link';
import { getFormattedDateRangeString } from 'utils/Utils';
import { Link as RouterLink } from 'react-router-dom'

/**
 * Survey header for a single-survey view.
 *
 * @return {*}
 */
const SurveyHeader = () => {
  const surveyContext = useContext(SurveyContext);
  const projectContext = useContext(ProjectContext);

  const surveyWithDetails = surveyContext.surveyDataLoader.data;
  const projectWithDetails = projectContext.projectDataLoader.data;

  const history = useHistory();

  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const { keycloakWrapper } = useContext(AuthStateContext);

  const defaultYesNoDialogProps = {
    dialogTitle: 'Delete Survey?',
    dialogText: 'Are you sure you want to delete this survey? This action cannot be undone.',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const deleteErrorDialogProps = {
    dialogTitle: DeleteSurveyI18N.deleteErrorTitle,
    dialogText: DeleteSurveyI18N.deleteErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showDeleteSurveyDialog = () => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      yesButtonProps: { color: 'error' },
      yesButtonLabel: 'Delete',
      noButtonProps: { color: 'primary', variant: 'outlined' },
      noButtonLabel: 'Cancel',
      onYes: () => {
        deleteSurvey();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
    setMenuAnchorEl(null);
  };

  const deleteSurvey = async () => {
    if (!surveyWithDetails) {
      return <></>;
    }

    try {
      const response = await biohubApi.survey.deleteSurvey(
        surveyContext.projectId,
        surveyWithDetails.surveyData.survey_details.id
      );

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }
      projectContext.surveysListDataLoader.refresh(projectContext.projectId);

      history.push(`/admin/projects/${surveyContext.projectId}`);
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogText: apiError.message, open: true });
      return error;
    }
  };

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...deleteErrorDialogProps, ...textDialogProps, open: true });
  };

  // Enable delete button if you a system admin or a project admin
  const enableDeleteSurveyButton = keycloakWrapper?.hasSystemRole([
    SYSTEM_ROLE.SYSTEM_ADMIN,
    SYSTEM_ROLE.DATA_ADMINISTRATOR,
    SYSTEM_ROLE.PROJECT_CREATOR
  ]);

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [publishSurveyDialogOpen, setPublishSurveyDialogOpen] = useState<boolean>(false);

  if (!surveyWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Paper square={true} elevation={0}
        sx={{
          pt: 3,
          pb: 3.
        }}
      >
        <Container maxWidth="xl" >
          <Breadcrumbs
            sx={{
              mb: 1.5
            }}
          >
            <Link
              component={RouterLink}
              variant="body2" 
              underline="hover"
              to={`/admin/projects/${projectWithDetails?.projectData.project.project_id}`}
              aria-current="page"
            >
              {projectWithDetails?.projectData.project.project_name}
            </Link>
            <Typography variant="body2" component="span">
              {surveyWithDetails.surveyData.survey_details.survey_name}
            </Typography>
          </Breadcrumbs>
          <Box
            display="flex"
            justifyContent="space-between"
            gap="1.5rem"
            sx={{
              flexDirection: { xs: 'column', lg: 'row' }
            }}
          >
            <Box>
              <Typography
                variant="h2" 
                component="h1"
                sx={{
                  display: 'block',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }} 
                >
                {surveyWithDetails.surveyData.survey_details.survey_name}
              </Typography>
              <Box mt={1} display="flex" alignItems="center" flexWrap="wrap">
                <Typography
                  className="info"
                  component="span"
                  variant="subtitle1"
                  color='textSecondary'
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mr: 2
                    // '&.info': {
                    //   '& svg': {
                    //     color: 'info.main'
                    //   }
                    // }
                  }}
                >
                  <Icon path={mdiMapMarkerOutline} size={0.875}/>
                  <Typography component="span" sx={{ml: 0.75}}>Region(s): Omenica, Peace, Skeena</Typography>
                </Typography>
                <Typography
                  component="span"
                  variant="subtitle1"
                  color='textSecondary'
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    '& svg': {
                      color: 'text.secondary'
                    }
                  }}
                >
                  <Icon path={mdiCalendarRangeOutline} size={0.875} />
                  <Typography component="span" sx={{ml: 0.75}}>
                    {getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat,
                      surveyWithDetails.surveyData.survey_details.start_date,
                      surveyWithDetails.surveyData.survey_details.end_date
                    )}
                  </Typography>
                </Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="flex-start" flex="0 0 auto">
              <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <Button
                  title="Submit Survey Data and Documents"
                  color="primary"
                  variant="contained"
                  onClick={() => setPublishSurveyDialogOpen(true)}
                  sx={{
                    display: 'none',
                    minWidth: '7rem'
                  }}>
                  Submit
                </Button>
              </SystemRoleGuard>
              <ProjectRoleGuard
                validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <Button
                  id="survey_settings_button"
                  aria-label="Survey Settings"
                  aria-controls="surveySettingsMenu"
                  aria-haspopup="true"
                  variant="outlined"
                  color="primary"
                  startIcon={<Icon path={mdiCogOutline} size={1} />}
                  endIcon={<Icon path={mdiChevronDown} size={1} />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => setMenuAnchorEl(event.currentTarget)}>
                  Settings
                </Button>
              </ProjectRoleGuard>
              <Menu
                id="surveySettingsMenu"
                aria-labelledby="survey_settings_button"
                style={{ marginTop: '8px' }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                keepMounted
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={() => setMenuAnchorEl(null)}>
                <MenuItem onClick={() => history.push('edit')}>
                  <ListItemIcon>
                    <Icon path={mdiPencilOutline} size={1} />
                  </ListItemIcon>
                  <Typography variant="inherit">Edit Survey Details</Typography>
                </MenuItem>
                {enableDeleteSurveyButton && (
                  <MenuItem
                    data-testid="delete-survey-button"
                    onClick={showDeleteSurveyDialog}
                    disabled={!enableDeleteSurveyButton}>
                    <ListItemIcon>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </ListItemIcon>
                    <Typography variant="inherit">Delete Survey</Typography>
                  </MenuItem>
                )}
              </Menu>
            </Box>
          </Box>
        </Container>
      </Paper>

      <PublishSurveyDialog open={publishSurveyDialogOpen} onClose={() => setPublishSurveyDialogOpen(false)} />
    </>
  );
};

export default SurveyHeader;
