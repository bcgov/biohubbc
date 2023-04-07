import { Button, Paper } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditSurveyI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useQuery } from 'hooks/useQuery';
import { IEditSurveyRequest, SurveyUpdateObject } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
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
  const queryParams = useQuery();

  const [formikRef] = useState(useRef<FormikProps<IEditSurveyRequest>>(null));

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const dialogContext = useContext(DialogContext);

  const codesContext = useContext(CodesContext);
  useEffect(() => codesContext.codesDataLoader.load(), [codesContext.codesDataLoader]);
  const codes = codesContext.codesDataLoader.data;

  const projectContext = useContext(ProjectContext);
  useEffect(() => projectContext.projectDataLoader.load(projectContext.projectId), [
    projectContext.projectDataLoader,
    projectContext.projectId
  ]);
  const projectData = projectContext.projectDataLoader.data?.projectData;

  const getSurveyFundingSourcesDataLoader = useDataLoader(() =>
    biohubApi.survey.getAvailableSurveyFundingSources(projectContext.projectId)
  );
  getSurveyFundingSourcesDataLoader.load();
  const fundingSourcesData = getSurveyFundingSourcesDataLoader.data || [];

  const editSurveyDL = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.survey.getSurveyForUpdate(projectId, surveyId)
  );

  if (!editSurveyDL.data && queryParams.surveyId) {
    editSurveyDL.load(projectContext.projectId, queryParams.surveyId);
  }

  useEffect(() => {
    const setFormikValues = (data: IEditSurveyRequest) => {
      formikRef.current?.setValues(data);
    };

    if (editSurveyDL.data) {
      setFormikValues((editSurveyDL.data.surveyData as unknown) as IEditSurveyRequest);
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
      history.push(`/admin/projects/${projectContext.projectId}/survey/${queryParams.surveyId}`);
    }
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectContext.projectId}/surveys/${queryParams.surveyId}/details`);
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
        Number(queryParams.surveyId),
        (values as unknown) as SurveyUpdateObject
      );

      if (!response?.id) {
        showEditErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
        return;
      }

      setEnableCancelCheck(false);

      history.push(`/admin/projects/${projectData?.project.id}/surveys/${response.id}/details`);
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

  if (!codes || !projectData) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <Paper square={true} elevation={0}>
        <Container maxWidth="xl">
          <Box py={4}>
            <Box display="flex" justifyContent="space-between">
              <Box className={classes.pageTitleContainer}>
                <Typography variant="h1" className={classes.pageTitle}>
                  Edit Survey Details
                </Typography>
              </Box>
              <Box flex="0 0 auto" className={classes.pageTitleActions}>
                <Button color="primary" variant="contained" onClick={() => formikRef.current?.submitForm()}>
                  Save and Exit
                </Button>
                <Button color="primary" variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Paper>
      <Box my={3}>
        <Container maxWidth="xl">
          <EditSurveyForm
            codes={codes}
            projectData={projectData}
            surveyFundingSources={fundingSourcesData}
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
