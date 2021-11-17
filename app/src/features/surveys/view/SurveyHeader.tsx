import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DeleteSurveyI18N, PublishSurveyI18N } from 'constants/i18n';
import { SurveyStatusType } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useContext } from 'react';
import { useHistory, useParams } from 'react-router';
import { getFormattedDateRangeString } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  surveyNav: {
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
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
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
  spacingRight: {
    paddingRight: '1rem'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  surveyTitle: {
    fontWeight: 400
  }
}));

export interface ISurveyHeaderProps {
  projectWithDetails: IGetProjectForViewResponse;
  surveyWithDetails: IGetSurveyForViewResponse;
  refresh: () => void;
}

/**
 * Survey header for a single-survey view.
 *
 * @param {*} props
 * @return {*}
 */
const SurveyHeader: React.FC<ISurveyHeaderProps> = (props) => {
  const { projectWithDetails, surveyWithDetails, refresh } = props;

  const classes = useStyles();
  const history = useHistory();
  const urlParams = useParams();

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

  const publishSurvey = async (publish: boolean) => {
    if (!projectWithDetails || !surveyWithDetails) {
      return;
    }

    try {
      const response = await biohubApi.survey.publishSurvey(urlParams['id'], urlParams['survey_id'], publish);

      if (!response) {
        showPublishErrorDialog({ open: true });
        return;
      }

      await refresh();
    } catch (error) {
      const apiError = error as APIError;
      showPublishErrorDialog({ dialogText: apiError.message, open: true });
      return error;
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
      const response = await biohubApi.survey.deleteSurvey(projectWithDetails.id, surveyWithDetails.survey_details.id);

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

  const publishErrorDialogProps = {
    ...deleteErrorDialogProps,
    dialogTitle: PublishSurveyI18N.publishErrorTitle,
    dialogText: PublishSurveyI18N.publishErrorText
  };

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...deleteErrorDialogProps, ...textDialogProps, open: true });
  };

  const showPublishErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...publishErrorDialogProps, ...textDialogProps, open: true });
  };

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (SurveyStatusType.ACTIVE === status_name) {
      chipLabel = 'Active';
      chipStatusClass = classes.chipActive;
    } else if (SurveyStatusType.COMPLETED === status_name) {
      chipLabel = 'Completed';
      chipStatusClass = classes.chipCompleted;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  // Show delete button if you are a system admin or a project admin
  const showDeleteSurveyButton = keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]);
  // Enable delete button if you a system admin OR a project admin and the survey is not published
  const enableDeleteSurveyButton =
    keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.SYSTEM_ADMIN]) ||
    (keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.PROJECT_ADMIN]) && !surveyWithDetails.survey_details.publish_date);

  return (
    <>
      <Paper square={true}>
        <Container maxWidth="xl">
          <Box pt={3} pb={2}>
            <Breadcrumbs>
              <Link
                color="primary"
                onClick={() => history.push('/admin/projects')}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">Projects</Typography>
              </Link>
              <Link
                color="primary"
                onClick={() => history.push(`/admin/projects/${projectWithDetails.id}/surveys`)}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">{projectWithDetails.project.project_name}</Typography>
              </Link>
              <Typography variant="body2">{surveyWithDetails.survey_details.survey_name}</Typography>
            </Breadcrumbs>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box pb={3}>
              <Box mb={1.5} display="flex">
                <Typography className={classes.spacingRight} variant="h1">
                  Survey - <span className={classes.surveyTitle}>{surveyWithDetails.survey_details.survey_name}</span>
                </Typography>
              </Box>
              <Box mb={0.75} display="flex" alignItems="center">
                {getChipIcon(surveyWithDetails.survey_details.completion_status)}
                &nbsp;&nbsp;
                <Typography component="span" variant="subtitle1" color="textSecondary">
                  <span>Timeline:</span>{' '}
                  {getFormattedDateRangeString(
                    DATE_FORMAT.ShortMediumDateFormat,
                    surveyWithDetails.survey_details.start_date,
                    surveyWithDetails.survey_details.end_date
                  )}
                </Typography>
              </Box>
            </Box>
            <Box ml={4} mb={4}>
              <Button
                variant="outlined"
                color="primary"
                className={classes.actionButton}
                data-testid="publish-survey-button"
                onClick={() => publishSurvey(!surveyWithDetails.survey_details.publish_date)}>
                {surveyWithDetails.survey_details.publish_date ? 'Unpublish Survey' : 'Publish Survey'}
              </Button>
              {showDeleteSurveyButton && (
                <Tooltip
                  arrow
                  color="secondary"
                  title={!enableDeleteSurveyButton ? 'Cannot delete a published survey' : ''}>
                  <>
                    <IconButton
                      data-testid="delete-survey-button"
                      onClick={showDeleteSurveyDialog}
                      disabled={!enableDeleteSurveyButton}>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </IconButton>
                  </>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Container>
      </Paper>
    </>
  );
};

export default SurveyHeader;
