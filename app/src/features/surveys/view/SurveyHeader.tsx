import { mdiChevronDown, mdiCog, mdiPencil, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PublishSurveyIdDialog from 'components/publish/PublishSurveyDialog';
import { ProjectRoleGuard } from 'components/security/Guards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DeleteSurveyI18N } from 'constants/i18n';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { ConfigContext } from 'contexts/configContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyContext } from 'contexts/surveyContext';
import { APIError } from 'hooks/api/useAxios';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { hasAtLeastOneValidValue } from 'utils/authUtils';
import { getFormattedDateRangeString } from 'utils/Utils';
import SurveyBaseHeader from './components/SurveyBaseHeader';

/**
 * Survey header for a single-survey view.
 *
 * @return {*}
 */
const SurveyHeader = () => {
  const surveyContext = useContext(SurveyContext);
  const projectContext = useContext(ProjectContext);
  const configContext = useContext(ConfigContext);

  const surveyWithDetails = surveyContext.surveyDataLoader.data;
  const projectWithDetails = projectContext.projectDataLoader.data;

  const history = useHistory();

  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const authStateContext = useAuthStateContext();

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
  const enableDeleteSurveyButton = hasAtLeastOneValidValue(
    [SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.PROJECT_CREATOR],
    authStateContext.simsUserWrapper.roleNames
  );

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [publishSurveyDialogOpen, setPublishSurveyDialogOpen] = useState<boolean>(false);

  if (!surveyWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const publishDate = surveyWithDetails.surveySupplementaryData.survey_metadata_publish?.event_timestamp.split(' ')[0];

  const BIOHUB_FEATURE_FLAG = configContext?.BIOHUB_FEATURE_FLAG;

  return (
    <>
      <SurveyBaseHeader
        title={surveyWithDetails.surveyData.survey_details.survey_name}
        breadCrumb={
          <Breadcrumbs>
            <Link
              component={RouterLink}
              variant="body2"
              underline="hover"
              to={`/admin/projects/${projectWithDetails?.projectData.project.project_id}`}
              aria-current="page">
              {projectWithDetails?.projectData.project.project_name}
            </Link>
            <Typography variant="body2" component="span">
              {surveyWithDetails.surveyData.survey_details.survey_name}
            </Typography>
          </Breadcrumbs>
        }
        subTitle={
          <Stack flexDirection="row" alignItems="center" gap={0.25} mt={1} mb={0.25}>
            <Stack flexDirection="row" alignItems="center">
              <Typography component="span" color="textSecondary" sx={{ mr: 1 }}>
                Timeline:
              </Typography>
              <Typography component="span">
                {getFormattedDateRangeString(
                  DATE_FORMAT.ShortMediumDateFormat,
                  surveyWithDetails.surveyData.survey_details.start_date,
                  surveyWithDetails.surveyData.survey_details.end_date
                )}
              </Typography>
            </Stack>
          </Stack>
        }
        buttonJSX={
          <ProjectRoleGuard
            validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Stack flexDirection="row" alignItems="center" gap={1}>
              {BIOHUB_FEATURE_FLAG && (
                <>
                  <Typography
                    component="span"
                    variant="subtitle2"
                    fontSize="0.9rem"
                    fontWeight="700"
                    sx={{
                      flex: '0 0 auto',
                      mr: { sm: 0, md: 0.5 },
                      order: { sm: 3, md: 0 }
                    }}>
                    {publishDate ? (
                      <>
                        <Typography component="span" color="textSecondary" variant="inherit" sx={{ mr: 0.5 }}>
                          Published:
                        </Typography>
                        <Typography component="span" variant="inherit">
                          {publishDate}
                        </Typography>
                      </>
                    ) : (
                      <Typography component="span" color="textSecondary" variant="inherit" sx={{ mr: 1 }}>
                        Never Published
                      </Typography>
                    )}
                  </Typography>
                  <Button
                    title="Submit Survey Data and Documents"
                    color="primary"
                    variant="contained"
                    onClick={() => setPublishSurveyDialogOpen(true)}
                    style={{ minWidth: '7rem' }}>
                    Publish
                  </Button>
                </>
              )}
              <Button
                component={RouterLink}
                to={`/admin/projects/${projectContext.projectId}/surveys/${surveyContext.surveyId}/edit`}
                variant="outlined"
                color="primary"
                startIcon={<Icon path={mdiPencil} size={0.75} />}>
                Edit
              </Button>
            </Stack>

            <Button
              sx={{ display: 'none' }}
              id="survey_settings_button"
              aria-label="Survey Settings"
              aria-controls="surveySettingsMenu"
              aria-haspopup="true"
              variant="outlined"
              color="primary"
              data-testid="settings-survey-button"
              startIcon={<Icon path={mdiCog} size={1} />}
              endIcon={<Icon path={mdiChevronDown} size={1} />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => setMenuAnchorEl(event.currentTarget)}>
              Settings
            </Button>

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
                  <Icon path={mdiPencil} size={1} />
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
          </ProjectRoleGuard>
        }
      />

      <PublishSurveyIdDialog open={publishSurveyDialogOpen} onClose={() => setPublishSurveyDialogOpen(false)} />
    </>
  );
};

export default SurveyHeader;
