import { Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiCogOutline,mdiPencilOutline, mdiChevronDown, mdiCalendarRangeOutline, mdiChevronRight, mdiTrashCanOutline, mdiInformationOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
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
import React, { useContext } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDateRangeString } from 'utils/Utils';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

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

  const showUploadSurveyDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Upload Survey to BioHub',
      dialogText: 'Are you sure you want to upload this survey, its attachments and associated observations?',
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      onNo: () => dialogContext.setYesNoDialog({ open: false }),
      open: true,
      onYes: () => {
        uploadSurvey();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const uploadSurvey = async () => {
    if (!projectWithDetails || !surveyWithDetails) {
      return;
    }

    try {
      await biohubApi.survey.uploadSurveyDataToBioHub(
        projectWithDetails.id,
        surveyWithDetails.surveyData.survey_details.id
      );
    } catch (error) {
      const apiError = error as APIError;
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: 'Failed to Upload to BioHub',
        dialogText: 'Failed to Upload to BioHub',
        dialogError: apiError.message,
        onClose: () => dialogContext.setErrorDialog({ open: false }),
        onOk: () => dialogContext.setErrorDialog({ open: false })
      });
      return error;
    }
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

  const [open, setOpen] = React.useState(false);

  const openSecurityDialog = () => {
    setOpen(true);
  };

  const closeSecurityDialog = () => {
    setOpen(false);
  };

  return (
    <>
    <Paper square={true} elevation={0}>
      <Container maxWidth="xl">
        <Box py={4}>
          <Box mb={2}>
            <Breadcrumbs separator={<Icon path={mdiChevronRight} size={0.8} />}>
              <Link
                color="primary"
                onClick={() => history.push('/admin/projects')}
                aria-current="page">
                <Typography variant="body1" component="span">Projects</Typography>
              </Link>
              <Link
                color="primary"
                onClick={() => history.push(`/admin/projects/${projectWithDetails.id}/surveys`)}
                aria-current="page">
                <Typography variant="body1" component="span">{projectWithDetails.project.project_name}</Typography>
              </Link>
              <Typography variant="body1" component="span">{surveyWithDetails.surveyData.survey_details.survey_name}</Typography>
            </Breadcrumbs>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Box className={classes.pageTitleContainer}>
              <Typography variant="h1" className={classes.pageTitle}>
                Survey: <span>{surveyWithDetails.surveyData.survey_details.survey_name}</span>
              </Typography>
              <Box mt={0.75} display="flex" alignItems="center">
                <Typography component="span" variant="subtitle1" color="textSecondary" style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon path={mdiCalendarRangeOutline} size={0.8} style={{ marginRight: '0.5rem' }} />
                  <strong>Survey Timeline:&nbsp;&nbsp;</strong>
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
                <Button color="primary" variant="contained" onClick={showUploadSurveyDialog}>
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
                style={{marginLeft: '0.5rem'}}>
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
                <MenuItem>
                  <ListItemIcon>
                    <Icon path={mdiPencilOutline} size={0.8} />
                  </ListItemIcon>
                  <Typography variant="inherit">Edit Survey Details</Typography>
                </MenuItem>
                {enableDeleteSurveyButton && (
                  <MenuItem data-testid="delete-survey-button" onClick={showDeleteSurveyDialog} disabled={!enableDeleteSurveyButton}>
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

    <Container maxWidth="xl" style={{marginTop: '24px'}}>
      <Paper elevation={0}>
        <Alert variant="filled" severity="error" icon={<Icon path={mdiInformationOutline} size={1.25} />}>
          <AlertTitle style={{fontWeight: 700}}>Security Requested</AlertTitle>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" display="inline" color="inherit">Additional security has been reqeusted for this survey.</Typography>&nbsp;<Button variant="text" style={{textDecoration: 'underline', fontSize: 'inherit', margin: '-6px 0'}} color="inherit" onClick={openSecurityDialog}>View Details</Button>
          </Box>
        </Alert>
      </Paper>
    </Container>
    
    <Dialog
        open={open}
        onClose={closeSecurityDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="md"
      >
        <DialogTitle id="alert-dialog-title">Security Requested</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            Additional Security has been requested for this survey. See details below.
          </DialogContentText> */}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Proprietor Name
              </Typography>
              <Typography component="dd" variant="body1">
                Proprietor Names
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Data Category
              </Typography>
              <Typography component="dd" variant="body1">
                Awaiting Publication
              </Typography>
            </Grid>
            <Grid item>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Category Rationale
              </Typography>
              <Typography style={{ wordBreak: 'break-all' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum
              </Typography>
            </Grid>
          </Grid>

        </DialogContent>
        <DialogActions>
          <Button onClick={closeSecurityDialog} variant="outlined" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    
    </>
  );
};

export default SurveyHeader;
