import { Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
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
  mdiShareAll,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import SubmitBiohubDialog from 'components/dialog/SubmitBiohubDialog';
import SubmitSurvey, {
  ISurveySubmitForm,
  SurveySubmitFormInitialValues,
  SurveySubmitFormYupSchema
} from 'components/publish/SubmitSurvey';
import { SystemRoleGuard } from 'components/security/Guards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DeleteSurveyI18N } from 'constants/i18n';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDateRangeString } from 'utils/Utils';

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

export interface ISurveyHeaderProps {
  projectWithDetails: IGetProjectForViewResponse;
  surveyWithDetails: IGetSurveyForViewResponse;
  refresh?: () => void;
}

/**
 * Survey header for a single-survey view.
 *
 * @param {*} props
 * @return {*}
 */
const SurveyHeader: React.FC<ISurveyHeaderProps> = (props) => {
  const { projectWithDetails, surveyWithDetails } = props;

  const classes = useStyles();
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const { keycloakWrapper } = useContext(AuthStateContext);

  const [openSubmitSurvey, setOpenSubmitSurvey] = useState(false);
  const [finishSubmission, setFinishSubmission] = useState(false);

  const defaultYesNoDialogProps = {
    dialogTitle: 'Delete Survey',
    dialogText: 'Are you sure you want to delete this survey, its attachments and associated observations?',
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
      onYes: () => {
        deleteSurvey();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deleteSurvey = async () => {
    if (!projectWithDetails || !surveyWithDetails) {
      return;
    }

    try {
      const response = await biohubApi.survey.deleteSurvey(
        projectWithDetails.id,
        surveyWithDetails.surveyData.survey_details.id
      );

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }

      history.push(`/admin/projects/${projectWithDetails.id}/surveys`);
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

  return (
    <>
      <Paper square={true} elevation={0}>
        <Container maxWidth="xl">
          <Box py={4}>
            <Box mt={-1} ml={-0.5} mb={1}>
              <Button
                color="primary"
                startIcon={<Icon path={mdiArrowLeft} size={0.9} />}
                onClick={() => history.push(`/admin/projects/${projectWithDetails.id}/surveys`)}>
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
                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={() => setOpenSubmitSurvey(!openSubmitSurvey)}
                    startIcon={<Icon path={mdiShareAll} size={0.8} />}>
                    Submit Data
                  </Button>
                </SystemRoleGuard>
                <Button
                  variant="outlined"
                  startIcon={<Icon path={mdiCogOutline} size={0.8} />}
                  endIcon={<Icon path={mdiChevronDown} size={0.8} />}
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={openSurveyMenu}
                  style={{ marginLeft: '0.5rem' }}>
                  Survey Settings
                </Button>
                <Menu
                  style={{ marginTop: '8px' }}
                  id="projectSettingsMenu"
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
                        `/admin/projects/${projectWithDetails.id}/survey/edit?surveyId=${surveyWithDetails.surveyData.survey_details.id}`
                      )
                    }>
                    <ListItemIcon>
                      <Icon path={mdiPencilOutline} size={0.8} />
                    </ListItemIcon>
                    <Typography variant="inherit">Edit Survey Details</Typography>
                  </MenuItem>
                  {enableDeleteSurveyButton && (
                    <MenuItem
                      data-testid="delete-survey-button"
                      onClick={showDeleteSurveyDialog}
                      disabled={!enableDeleteSurveyButton}>
                      <ListItemIcon>
                        <Icon path={mdiTrashCanOutline} size={0.8} />
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

      <ErrorDialog
        dialogTitle="Survey data submitted!"
        dialogText="Thank you for submitting your survey data to Biohub."
        open={finishSubmission}
        onClose={() => {
          setFinishSubmission(false);
        }}
        onOk={() => {
          setFinishSubmission(false);
        }}></ErrorDialog>

      <SubmitBiohubDialog
        dialogTitle="Submit Survey Information"
        open={openSubmitSurvey}
        onClose={() => {
          setOpenSubmitSurvey(!openSubmitSurvey);
        }}
        onSubmit={async (values: ISurveySubmitForm) => {
          biohubApi.publish.publishSurvey(
            projectWithDetails.id,
            surveyWithDetails.surveyData.survey_details.id,
            values
          );
          setFinishSubmission(true);
        }}
        formikProps={{
          initialValues: SurveySubmitFormInitialValues,
          validationSchema: SurveySubmitFormYupSchema
        }}>
        <SubmitSurvey surveyDetails={surveyWithDetails} />
      </SubmitBiohubDialog>
    </>
  );
};

export default SurveyHeader;
