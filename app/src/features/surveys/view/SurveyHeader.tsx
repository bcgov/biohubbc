import {
  mdiCalendarRange,
  mdiChevronDown,
  mdiCogOutline,
  mdiFormatListGroup,
  mdiPencilOutline,
  mdiTrashCanOutline,
  mdiTrayArrowDown
} from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import grey from '@mui/material/colors/grey';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PageHeader from 'components/layout/PageHeader';
import PublishSurveyIdDialog from 'components/publish/PublishSurveyDialog';
import { FeatureFlagGuard, ProjectRoleGuard } from 'components/security/Guards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DeleteSurveyI18N } from 'constants/i18n';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { DialogContext } from 'contexts/dialogContext';

import { SurveyContext } from 'contexts/surveyContext';
import { SurveyExportDialog } from 'features/surveys/view/survey-export/SurveyExportDialog';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDateRangeString } from 'utils/Utils';
import { SurveyProgressChip } from '../components/SurveyProgressChip';
import CreateCollectionSurveyDialog from './collection/CreateCollectionSurveyDialog';

/**
 * Survey header for a single-survey view.
 *
 * @return {*}
 */
const SurveyHeader = () => {
  const surveyContext = useContext(SurveyContext);

  const surveyWithDetails = surveyContext.surveyDataLoader.data;

  const history = useHistory();

  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const [openSurveyExportDialog, setOpenSurveyExportDialog] = useState(false);

  const defaultYesNoDialogProps = {
    dialogTitle: DeleteSurveyI18N.deleteTitle,
    dialogText: DeleteSurveyI18N.deleteText,
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
      const response = await biohubApi.survey.deleteSurvey(surveyWithDetails.surveyData.survey_details.id);

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }

      history.goBack();
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogErrorDetails: [apiError.message], open: true });
      return error;
    }
  };

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...deleteErrorDialogProps, ...textDialogProps, open: true });
  };

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const [publishSurveyDialogOpen, setPublishSurveyDialogOpen] = useState<boolean>(false);
  const [collectionDialogIsOpen, setCollectionDialogIsOpen] = useState<boolean>(false);

  if (!surveyWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const publishDate = surveyWithDetails.surveySupplementaryData.survey_metadata_publish?.event_timestamp.split(' ')[0];

  return (
    <>
      <PageHeader
        title={surveyWithDetails.surveyData.survey_details.survey_name}
        breadCrumbJSX={
          <Breadcrumbs aria-label="breadcrumb" separator={'>'}>
            <Typography component="span" variant="inherit" color="textSecondary">
              {surveyWithDetails.surveyData.survey_details.survey_name}
            </Typography>
          </Breadcrumbs>
        }
        subTitleJSX={
          <Stack flexDirection="row" alignItems="center" gap={0.75} color="text.secondary">
            <Icon path={mdiCalendarRange} size={0.8} color={grey[600]} style={{ marginTop: 1.5 }} />
            <Typography component="span">
              {getFormattedDateRangeString(
                DATE_FORMAT.MediumDateFormat,
                surveyWithDetails.surveyData.survey_details.start_date,
                surveyWithDetails.surveyData.survey_details.end_date
              )}
            </Typography>
            <Box ml={1}>
              <SurveyProgressChip progress_id={surveyWithDetails.surveyData.survey_details.progress_id} />
            </Box>
          </Stack>
        }
        buttonJSX={
          <ProjectRoleGuard
            validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Stack flexDirection="row" alignItems="center" gap={2}>
              <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SURVEY_PAGE} />
              <FeatureFlagGuard featureFlags={['APP_FF_SUBMIT_BIOHUB']}>
                <ProjectRoleGuard
                  validSurveyRoles={[SURVEY_ROLE.ADMIN]}
                  validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <Typography
                    component="span"
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      flex: '0 0 auto',
                      mr: { sm: 0, md: 0.5 },
                      order: { sm: 3, md: 0 }
                    }}>
                    {publishDate ? (
                      <span>
                        Status:&nbsp;&nbsp;<b>Published ({publishDate})</b>
                      </span>
                    ) : (
                      <span>
                        Status:&nbsp;&nbsp;<b>Unpublished</b>
                      </span>
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
                </ProjectRoleGuard>
              </FeatureFlagGuard>
            </Stack>

            <Button
              id="survey_settings_button"
              aria-label="Survey Settings"
              aria-controls="surveySettingsMenu"
              aria-haspopup="true"
              variant="outlined"
              color="primary"
              data-testid="settings-survey-button"
              startIcon={<Icon path={mdiCogOutline} size={0.75} />}
              endIcon={<Icon path={mdiChevronDown} size={0.75} />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => setMenuAnchorEl(event.currentTarget)}>
              Settings
            </Button>

            <SurveyExportDialog
              open={openSurveyExportDialog}
              onCancel={() => {
                setOpenSurveyExportDialog(false);
                setMenuAnchorEl(null);
              }}
            />

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
              <MenuItem
                onClick={() => {
                  setCollectionDialogIsOpen(true);
                  setMenuAnchorEl(null);
                }}>
                <ListItemIcon>
                  <Icon path={mdiFormatListGroup} size={1} />
                </ListItemIcon>
                <Typography variant="inherit">Add to Collection</Typography>
              </MenuItem>
              <MenuItem onClick={() => history.push('edit')}>
                <ListItemIcon>
                  <Icon path={mdiPencilOutline} size={1} />
                </ListItemIcon>
                <Typography variant="inherit">Edit Survey Details</Typography>
              </MenuItem>
              <ProjectRoleGuard
                validSurveyRoles={[SURVEY_ROLE.ADMIN]}
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <MenuItem data-testid="delete-survey-button" onClick={showDeleteSurveyDialog}>
                  <ListItemIcon>
                    <Icon path={mdiTrashCanOutline} size={1} />
                  </ListItemIcon>
                  <Typography variant="inherit">Delete Survey</Typography>
                </MenuItem>
              </ProjectRoleGuard>
              <ProjectRoleGuard
                validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <MenuItem data-testid="export-survey-button" onClick={() => setOpenSurveyExportDialog(true)}>
                  <ListItemIcon>
                    <Icon path={mdiTrayArrowDown} size={1} />
                  </ListItemIcon>
                  <Typography variant="inherit">Export Survey</Typography>
                </MenuItem>
              </ProjectRoleGuard>
            </Menu>
          </ProjectRoleGuard>
        }
      />

      <PublishSurveyIdDialog open={publishSurveyDialogOpen} onClose={() => setPublishSurveyDialogOpen(false)} />
      <CreateCollectionSurveyDialog open={collectionDialogIsOpen} onClose={() => setCollectionDialogIsOpen(false)} />
    </>
  );
};

export default SurveyHeader;
