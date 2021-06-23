import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { mdiClipboardCheckMultipleOutline, mdiTrashCanOutline, mdiInformationOutline, mdiPaperclip } from '@mdi/js';
import Icon from '@mdi/react';
import SurveyDetails from 'features/surveys/view/SurveyDetails';
import React, { useContext, useCallback, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { useHistory, useParams, useLocation } from 'react-router';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import CircularProgress from '@material-ui/core/CircularProgress';
import { getFormattedDateRangeString } from 'utils/Utils';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import SurveyAttachments from './SurveyAttachments';
import SurveyObservations from './SurveyObservations';
import Button from '@material-ui/core/Button';
import { DialogContext } from 'contexts/dialogContext';

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

      history.push(`/projects/${projectWithDetails.id}/surveys`);
    } catch (error) {
      return error;
    }
  };

  if (!projectWithDetails || !surveyWithDetails || !codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Paper elevation={2} square={true}>
        <Container maxWidth="xl">
          <Box mb={3} pt={3}>
            <Breadcrumbs>
              <Link
                color="primary"
                onClick={() => history.push('/projects')}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">Projects</Typography>
              </Link>
              <Link
                color="primary"
                onClick={() => history.push(`/projects/${projectWithDetails.id}/surveys`)}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">{projectWithDetails.project.project_name}</Typography>
              </Link>
              <Typography variant="body2">{surveyWithDetails.survey_details.survey_name}</Typography>
            </Breadcrumbs>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Box pb={4}>
              <Box mb={1}>
                <Typography variant="h1">{surveyWithDetails.survey_details.survey_name}</Typography>
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
                color="primary"
                data-testid="delete-survey-button"
                startIcon={<Icon path={mdiTrashCanOutline} size={1} />}
                onClick={showDeleteSurveyDialog}>
                Delete Survey
              </Button>
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
                <ListItem component={NavLink} to="observations">
                  <ListItemIcon>
                    <Icon path={mdiClipboardCheckMultipleOutline} size={1} />
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
            {location.pathname.includes('/observations') && (
              <SurveyObservations projectForViewData={projectWithDetails} surveyForViewData={surveyWithDetails} />
            )}
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
