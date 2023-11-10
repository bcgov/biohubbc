import { Breadcrumbs, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditSurveyI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyContext } from 'contexts/surveyContext';
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IEditSurveyRequest, SurveyUpdateObject } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import EditSurveyForm from './EditSurveyForm';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  sectionDivider: {
    height: '1px',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5)
  },
  pageTitleContainer: {
    maxWidth: '170ch',
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
    paddingBottom: theme.spacing(0.75),
    '& button': {
      marginLeft: theme.spacing(1)
    }
  }
}));

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const EditSurveyPage = () => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const history = useHistory();
  const urlParams: Record<string, string | number | undefined> = useParams();

  const surveyId = Number(urlParams['survey_id']);

  const [formikRef] = useState(useRef<FormikProps<IEditSurveyRequest>>(null));

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const dialogContext = useContext(DialogContext);

  const codesContext = useContext(CodesContext);
  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);
  const codes = codesContext.codesDataLoader.data;

  const projectContext = useContext(ProjectContext);
  useEffect(() => {
    projectContext.projectDataLoader.load(projectContext.projectId);
  }, [projectContext.projectDataLoader, projectContext.projectId]);
  const projectData = projectContext.projectDataLoader.data?.projectData;

  const surveyContext = useContext(SurveyContext);

  const editSurveyDL = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.survey.getSurveyForUpdate(projectId, surveyId)
  );

  if (!editSurveyDL.data && surveyId) {
    editSurveyDL.load(projectContext.projectId, surveyId);
  }
  const surveyData = editSurveyDL.data?.surveyData;

  useEffect(() => {
    const setFormikValues = (data: IEditSurveyRequest) => {
      formikRef.current?.setValues(data);
    };

    if (editSurveyDL.data) {
      setFormikValues(editSurveyDL.data.surveyData as unknown as IEditSurveyRequest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editSurveyDL]);

  const defaultCancelDialogProps = {
    dialogTitle: EditSurveyI18N.cancelTitle,
    dialogText: EditSurveyI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push('details');
    }
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push('details');
  };

  const showEditErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: EditSurveyI18N.createErrorTitle,
      dialogText: EditSurveyI18N.createErrorText,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps,
      open: true
    });
  };

  /**
   * Handle creation of surveys.
   *
   * @return {*}
   */
  const handleSubmit = async (values: IEditSurveyRequest) => {
    try {
      const response = await biohubApi.survey.updateSurvey(
        projectContext.projectId,
        surveyId,
        values as unknown as SurveyUpdateObject
      );

      if (!response?.id) {
        showEditErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
        return;
      }

      setEnableCancelCheck(false);

      surveyContext.surveyDataLoader.refresh(projectContext.projectId, surveyContext.surveyId);

      history.push(`/admin/projects/${projectData?.project.project_id}/surveys/${response.id}/details`);
    } catch (error) {
      const apiError = error as APIError;
      showEditErrorDialog({
        dialogTitle: 'Error Creating Survey',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  /**
   * Intercepts all navigation attempts (when used with a `Prompt`).
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const handleLocationChange = (location: History.Location, action: History.Action) => {
    if (!dialogContext.yesNoDialogProps.open) {
      // If the cancel dialog is not open: open it
      dialogContext.setYesNoDialog({
        ...defaultCancelDialogProps,
        onYes: () => {
          dialogContext.setYesNoDialog({ open: false });
          history.push(location.pathname);
        },
        open: true
      });
      return false;
    }

    // If the cancel dialog is already open and another location change action is triggered: allow it
    return true;
  };

  if (!codes || !projectData || !surveyData) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <Paper
        elevation={0}
        square={true}
        id="editSurveyPageTitle"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1002,
          pt: 3,
          pb: 3.75,
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: grey[300]
        }}>
        <Container maxWidth="xl">
          <Breadcrumbs>
            <Link
              component={RouterLink}
              variant="body2"
              underline="hover"
              to={`/admin/projects/${projectData.project.project_id}/`}
              aria-current="page">
              {projectData.project.project_name}
            </Link>
            <Link
              component={RouterLink}
              variant="body2"
              underline="hover"
              to={`/admin/projects/${projectData.project.project_id}/surveys/${surveyId}/details`}
              aria-current="page">
              {surveyData && surveyData.survey_details && surveyData.survey_details.survey_name}
            </Link>
            <Typography variant="body2" component="span">
              Edit
            </Typography>
          </Breadcrumbs>
          <Box
            display="flex"
            justifyContent="space-between"
            gap="1.5rem"
            sx={{
              flexDirection: { xs: 'column', lg: 'row' }
            }}>
            <Box className={classes.pageTitleContainer}>
              <Typography variant="h1" className={classes.pageTitle}>
                Edit Survey Details
              </Typography>
            </Box>
            <Box flex="0 0 auto" display="flex" alignItems="flex-start" className={classes.pageTitleActions}>
              <Button color="primary" variant="contained" onClick={() => formikRef.current?.submitForm()}>
                Save and Exit
              </Button>
              <Button color="primary" variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>
      <Box my={3}>
        <Container maxWidth="xl">
          <EditSurveyForm
            codes={codes}
            projectData={projectData}
            surveyData={surveyData}
            handleSubmit={handleSubmit}
            handleCancel={handleCancel}
            formikRef={formikRef}
          />
        </Container>
      </Box>
    </>
  );
};

export default EditSurveyPage;
