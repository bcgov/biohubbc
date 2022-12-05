import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditSurveyI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useQuery } from 'hooks/useQuery';
import { IEditSurveyRequest, SurveyUpdateObject } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import EditSurveyForm from './EditSurveyForm';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  breadCrumbLinkIcon: {
    marginRight: '0.25rem'
  },
  sectionDivider: {
    height: '1px',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5)
  }
}));

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const EditSurveyPage = () => {
  const urlParams = useParams();
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const history = useHistory();
  const queryParams = useQuery();

  const [formikRef] = useState(useRef<FormikProps<IEditSurveyRequest>>(null));

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const dialogContext = useContext(DialogContext);

  const codesDataLoader = useDataLoader(() => biohubApi.codes.getAllCodeSets());
  codesDataLoader.load();

  const getProjectForViewDL = useDataLoader((projectId: number) => biohubApi.project.getProjectForView(projectId));
  getProjectForViewDL.load(urlParams['id']);

  const getSurveyFundingSourcesDL = useDataLoader((projectId: number) =>
    biohubApi.survey.getAvailableSurveyFundingSources(projectId)
  );
  getSurveyFundingSourcesDL.load(urlParams['id']);

  const editSurveyDL = useDataLoader((projectId: number, surveyId: number) =>
    biohubApi.survey.getSurveyForUpdate(projectId, surveyId)
  );

  if (!editSurveyDL.data && queryParams.surveyId) {
    editSurveyDL.load(urlParams['id'], queryParams.surveyId);
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
      history.push(`/admin/projects/${getProjectForViewDL.data?.id}/survey/${queryParams.surveyId}`);
    }
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${getProjectForViewDL.data?.id}/surveys/${queryParams.surveyId}/details`);
  };

  const handleCancelToProject = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${getProjectForViewDL.data?.id}`);
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
      console.log('values', values);

      const response = await biohubApi.survey.updateSurvey(
        urlParams['id'],
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

      history.push(`/admin/projects/${getProjectForViewDL.data?.id}/surveys/${response.id}/details`);
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

  if (!codesDataLoader.data || !getProjectForViewDL.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <Box my={3}>
        <Container maxWidth="xl">
          <Box mb={3}>
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
                onClick={handleCancelToProject}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">{getProjectForViewDL.data.project.project_name}</Typography>
              </Link>
              <Link color="primary" onClick={handleCancel} aria-current="page" className={classes.breadCrumbLink}>
                <Typography variant="body2">{editSurveyDL.data?.surveyData.survey_details?.survey_name}</Typography>
              </Link>
              <Typography variant="body2">Edit Survey</Typography>
            </Breadcrumbs>
          </Box>

          <Box mb={5}>
            <Typography variant="h1">Edit Survey</Typography>
          </Box>
          <EditSurveyForm
            codes={codesDataLoader.data}
            projectData={getProjectForViewDL.data}
            surveyFundingSources={getSurveyFundingSourcesDL.data || []}
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
