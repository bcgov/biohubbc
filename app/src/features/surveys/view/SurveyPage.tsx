import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import {
  mdiClipboardCheckMultipleOutline,
  mdiInformationOutline,
  mdiPaperclip,
  mdiToggleSwitch,
  mdiToggleSwitchOffOutline,
  mdiTrashCanOutline,
  mdiEye
} from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SurveyStatusType } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import { getFormattedDateRangeString } from 'utils/Utils';
import SurveyAttachments from './SurveyAttachments';
import SurveyObservations from './SurveyObservations';
import SurveySummaryResults from './SurveySummaryResults';

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
    padding: '0px 8px',
    borderRadius: '4px',
    color: 'white'
  },
  chipActive: {
    backgroundColor: theme.palette.warning.main
  },
  chipCompleted: {
    backgroundColor: theme.palette.success.main
  },
  spacingRight: {
    paddingRight: '1rem'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

/**
 * Page to display a single Survey.
 *
 * @return {*}
 */
const SurveyPage: React.FC = () => {
  const location = useLocation();
  const classes = useStyles();
  const history = useHistory();
  const urlParams = useParams();
  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [isLoadingCodes, setIsLoadingCodes] = useState(true);

  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);
  const [surveyWithDetails, setSurveyWithDetails] = useState<IGetSurveyForViewResponse | null>(null);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();

  const { keycloakWrapper } = useContext(AuthStateContext);

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.codes.getAllCodeSets();

      if (!codesResponse) {
        return;
      }

      setCodes(codesResponse);
    };

    if (isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(false);
    }
  }, [urlParams, biohubApi.codes, isLoadingCodes, codes]);

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await biohubApi.project.getProjectForView(urlParams['id']);

    if (!projectWithDetailsResponse) {
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [biohubApi.project, urlParams]);

  const getSurvey = useCallback(async () => {
    const surveyWithDetailsResponse = await biohubApi.survey.getSurveyForView(urlParams['id'], urlParams['survey_id']);

    if (!surveyWithDetailsResponse) {
      return;
    }
    setSurveyWithDetails(surveyWithDetailsResponse);
  }, [biohubApi.survey, urlParams]);

  useEffect(() => {
    if (isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(false);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  useEffect(() => {
    if (isLoadingSurvey && !surveyWithDetails) {
      getSurvey();
      setIsLoadingSurvey(false);
    }
  }, [isLoadingSurvey, surveyWithDetails, getSurvey]);

  const defaultYesNoDialogProps = {
    dialogTitle: 'Delete Survey',
    dialogText: 'Are you sure you want to delete this survey, its attachments and associated observations?',
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const publishSurvey = async (publish: boolean) => {
    try {
      await biohubApi.survey.publishSurvey(urlParams['id'], urlParams['survey_id'], publish);

      await getSurvey();
    } catch (error) {
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
        return;
      }

      history.push(`/admin/projects/${projectWithDetails.id}/surveys`);
    } catch (error) {
      return error;
    }
  };

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (SurveyStatusType.ACTIVE === status_name) {
      chipLabel = 'ACTIVE';
      chipStatusClass = classes.chipActive;
    } else if (SurveyStatusType.COMPLETED === status_name) {
      chipLabel = 'COMPLETED';
      chipStatusClass = classes.chipCompleted;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  if (!projectWithDetails || !surveyWithDetails || !codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  // Show delete button if you are a system admin or a project admin
  const showDeleteSurveyButton = keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]);
  // Enable delete button if you a system admin OR a project admin and the survey is not published
  const enableDeleteSurveyButton =
    keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.SYSTEM_ADMIN]) ||
    (keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.PROJECT_ADMIN]) && !surveyWithDetails.survey_details.publish_date);

  return (
    <>
      <Paper elevation={2} square={true}>
        <Container maxWidth="xl">
          <Box mb={3} pt={3}>
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

          <Box display="flex" justifyContent="space-between">
            <Box pb={4}>
              <Box mb={1} display="flex">
                <Typography className={classes.spacingRight} variant="h1">
                  {surveyWithDetails.survey_details.survey_name}
                </Typography>
                {getChipIcon(surveyWithDetails.survey_details.completion_status)}
              </Box>
              <Box>
                <Typography variant="subtitle1" color="textSecondary">
                  {getFormattedDateRangeString(
                    DATE_FORMAT.ShortMediumDateFormat2,
                    surveyWithDetails.survey_details.start_date,
                    surveyWithDetails.survey_details.end_date
                  )}
                </Typography>
              </Box>
            </Box>
            <Box ml={4} mb={4}>
              <Button
                variant="outlined"
                className={classes.actionButton}
                color="primary"
                data-testid="publish-survey-button"
                startIcon={
                  <Icon
                    path={surveyWithDetails.survey_details.publish_date ? mdiToggleSwitch : mdiToggleSwitchOffOutline}
                    size={1}
                  />
                }
                onClick={async () => await publishSurvey(!surveyWithDetails.survey_details.publish_date)}>
                {surveyWithDetails.survey_details.publish_date ? 'Unpublish Survey' : 'Publish Survey'}
              </Button>
              {showDeleteSurveyButton && (
                <Tooltip
                  arrow
                  color="secondary"
                  title={!enableDeleteSurveyButton ? 'Cannot delete a published survey' : ''}>
                  <>
                    <Button
                      variant="outlined"
                      color="primary"
                      className={classes.actionButton}
                      data-testid="delete-survey-button"
                      startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
                      onClick={showDeleteSurveyDialog}
                      disabled={!enableDeleteSurveyButton}>
                      Delete Survey
                    </Button>
                  </>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="row" py={6}>
          <Box component="aside" mr={6} mt={-2}>
            <Paper>
              <List component="nav" role="navigation" className={classes.surveyNav} aria-label="Survey Navigation">
                <ListItem component={NavLink} to="details">
                  <ListItemIcon>
                    <Icon path={mdiInformationOutline} size={1} />
                  </ListItemIcon>
                  <ListItemText>Survey Details</ListItemText>
                </ListItem>
                <ListItem component={NavLink} to="results">
                  <ListItemIcon>
                    <Icon path={mdiClipboardCheckMultipleOutline} size={1} />
                  </ListItemIcon>
                  <ListItemText>Summary Results</ListItemText>
                </ListItem>
                <ListItem component={NavLink} to="observations">
                  <ListItemIcon>
                    <Icon path={mdiEye} size={1} />
                  </ListItemIcon>
                  <ListItemText>Observations</ListItemText>
                </ListItem>
                <ListItem component={NavLink} to="attachments">
                  <ListItemIcon>
                    <Icon path={mdiPaperclip} size={1} />
                  </ListItemIcon>
                  <ListItemText>Attachments</ListItemText>
                </ListItem>
              </List>
            </Paper>
          </Box>
          <Box component="article" flex="1 1 auto">
            {location.pathname.includes('/details') && (
              <SurveyDetails
                projectForViewData={projectWithDetails}
                surveyForViewData={surveyWithDetails}
                codes={codes}
                refresh={getSurvey}
              />
            )}
            {location.pathname.includes('/results') && <SurveySummaryResults />}
            {location.pathname.includes('/observations') && <SurveyObservations refresh={getSurvey} />}
            {location.pathname.includes('/attachments') && (
              <SurveyAttachments projectForViewData={projectWithDetails} surveyForViewData={surveyWithDetails} />
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default SurveyPage;
