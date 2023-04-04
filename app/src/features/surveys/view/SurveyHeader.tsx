import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import {
  mdiArrowLeft,
  mdiCalendarRangeOutline,
  mdiChevronDown,
  mdiCogOutline,
  mdiPencilOutline,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import PublishSurveyButton from 'components/publish/PublishSurveyButton';
import { SystemRoleGuard } from 'components/security/Guards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DeleteSurveyI18N } from 'constants/i18n';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDateRangeString } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  pageTitleContainer: {
    maxWidth: '150ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  pageTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    overflow: 'hidden'
  },
  pageTitleActions: {
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75)
  }
}));

/**
 * Survey header for a single-survey view.
 *
 * @return {*}
 */
const SurveyHeader = () => {
  const surveyContext = useContext(SurveyContext);
  const surveyWithDetails = surveyContext.surveyDataLoader.data;

  const classes = useStyles();
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
      yesButtonProps: { color: 'secondary' },
      yesButtonLabel: 'Delete',
      noButtonProps: { color: 'primary', variant: 'outlined' },
      noButtonLabel: 'Cancel',
      onYes: () => {
        deleteSurvey();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
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

      history.push(`/admin/projects/${surveyContext.projectId}/surveys`);
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

  // Show/Hide Project Settings Menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const openSurveyMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeSurveyMenu = () => {
    setAnchorEl(null);
  };

  if (!surveyWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Paper square={true} elevation={0}>
        <Container maxWidth="xl">
          <Box py={4}>
            <Box mt={-1} ml={-0.5} mb={0.5}>
              <Button
                color="primary"
                startIcon={<Icon path={mdiArrowLeft} size={0.9} />}
                onClick={() => history.push(`/admin/projects/${surveyContext.projectId}/surveys`)}>
                <strong>Back to Project</strong>
              </Button>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box className={classes.pageTitleContainer}>
                <Typography variant="h1" className={classes.pageTitle}>
                  Survey: <span>{surveyWithDetails.surveyData.survey_details.survey_name}</span>
                </Typography>
                <Box mt={0.75} display="flex" alignItems="center">
                  <Typography
                    component="span"
                    variant="subtitle1"
                    color="textSecondary"
                    style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon path={mdiCalendarRangeOutline} size={0.9} style={{ marginRight: '0.5rem' }} />
                    Survey Timeline:&nbsp;&nbsp;
                    {getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat,
                      surveyWithDetails.surveyData.survey_details.start_date,
                      surveyWithDetails.surveyData.survey_details.end_date
                    )}
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="flex-start" flex="0 0 auto" className={classes.pageTitleActions}>
                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <PublishSurveyButton />
                </SystemRoleGuard>
                <Button
                  id="survey_settings_button"
                  aria-label="Survey Settings"
                  aria-controls="surveySettingsMenu"
                  aria-haspopup="true"
                  variant="outlined"
                  startIcon={<Icon path={mdiCogOutline} size={1} />}
                  endIcon={<Icon path={mdiChevronDown} size={1} />}
                  onClick={openSurveyMenu}
                  style={{ marginLeft: '0.5rem' }}>
                  Settings
                </Button>
                <Menu
                  id="surveySettingsMenu"
                  aria-labelledby="survey_settings_button"
                  style={{ marginTop: '8px' }}
                  anchorEl={anchorEl}
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
                  open={Boolean(anchorEl)}
                  onClose={closeSurveyMenu}>
                  <MenuItem
                    onClick={() =>
                      history.push(
                        `/admin/projects/${surveyContext.projectId}/survey/edit?surveyId=${surveyWithDetails.surveyData.survey_details.id}`
                      )
                    }>
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
          </Box>
        </Container>
      </Paper>
    </>
  );
};

export default SurveyHeader;
