import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { ScrollToFormikError } from 'components/formik/ScrollToFormikError';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { CreateSurveyI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import SurveyPartnershipsForm, {
  SurveyPartnershipsFormInitialValues,
  SurveyPartnershipsFormYupSchema
} from 'features/surveys/view/components/SurveyPartnershipsForm';
import { Formik, FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICreateSurveyRequest } from 'interfaces/useSurveyApi.interface';
import moment from 'moment';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { getFormattedDate } from 'utils/Utils';
import yup from 'utils/YupSchema';
import AgreementsForm, { AgreementsInitialValues, AgreementsYupSchema } from './components/AgreementsForm';
import GeneralInformationForm, {
  GeneralInformationInitialValues,
  GeneralInformationYupSchema
} from './components/GeneralInformationForm';
import ProprietaryDataForm, {
  ProprietaryDataInitialValues,
  ProprietaryDataYupSchema
} from './components/ProprietaryDataForm';
import PurposeAndMethodologyForm, {
  PurposeAndMethodologyInitialValues,
  PurposeAndMethodologyYupSchema
} from './components/PurposeAndMethodologyForm';
import StudyAreaForm, { StudyAreaInitialValues, StudyAreaYupSchema } from './components/StudyAreaForm';
import SurveyFundingSourceForm, {
  SurveyFundingSourceFormInitialValues,
  SurveyFundingSourceFormYupSchema
} from './components/SurveyFundingSourceForm';
import SurveyUserForm, { SurveyUserJobFormInitialValues, SurveyUserJobYupSchema } from './components/SurveyUserForm';

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
const CreateSurveyPage = () => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const history = useHistory();

  const codesContext = useContext(CodesContext);
  useEffect(() => codesContext.codesDataLoader.load(), [codesContext.codesDataLoader]);
  const codes = codesContext.codesDataLoader.data;

  const projectContext = useContext(ProjectContext);
  useEffect(
    () => projectContext.projectDataLoader.load(projectContext.projectId),
    [projectContext.projectDataLoader, projectContext.projectId]
  );
  const projectData = projectContext.projectDataLoader.data?.projectData;

  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const dialogContext = useContext(DialogContext);

  const defaultCancelDialogProps = {
    dialogTitle: CreateSurveyI18N.cancelTitle,
    dialogText: CreateSurveyI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push(`/admin/projects/${projectData?.project.project_id}/surveys`);
    }
  };

  // Initial values for the survey form sections
  const [surveyInitialValues] = useState<ICreateSurveyRequest>({
    ...GeneralInformationInitialValues,
    ...PurposeAndMethodologyInitialValues,
    ...StudyAreaInitialValues,
    ...SurveyFundingSourceFormInitialValues,
    ...SurveyPartnershipsFormInitialValues,
    ...ProprietaryDataInitialValues,
    ...AgreementsInitialValues,
    ...SurveyUserJobFormInitialValues
  });

  // Yup schemas for the survey form sections
  const surveyYupSchemas = GeneralInformationYupSchema({
    start_date: yup
      .string()
      .isValidDateString()
      .isAfterDate(
        projectData?.project.start_date,
        DATE_FORMAT.ShortDateFormat,
        `Survey start date cannot be before project start date ${
          projectData && getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, projectData.project.start_date)
        }`
      )
      .isAfterDate(
        moment(DATE_LIMIT.min).toISOString(),
        DATE_FORMAT.ShortDateFormat,
        `Survey start date cannot be before ${getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, DATE_LIMIT.min)}`
      )
      .required('Start Date is Required'),
    end_date: yup
      .string()
      .isValidDateString()
      .isEndDateSameOrAfterStartDate('start_date')
      .isBeforeDate(
        projectData?.project.end_date,
        DATE_FORMAT.ShortDateFormat,
        `Survey end date cannot be after project end date ${
          projectData && getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, projectData.project.end_date)
        }`
      )
      .isBeforeDate(
        moment(DATE_LIMIT.max).toISOString(),
        DATE_FORMAT.ShortDateFormat,
        `Survey end date cannot be after ${getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, DATE_LIMIT.max)}`
      )
  })
    .concat(StudyAreaYupSchema)
    .concat(PurposeAndMethodologyYupSchema)
    .concat(ProprietaryDataYupSchema)
    .concat(SurveyFundingSourceFormYupSchema)
    .concat(AgreementsYupSchema)
    .concat(SurveyUserJobYupSchema)
    .concat(SurveyPartnershipsFormYupSchema);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectData?.project.project_id}/surveys`);
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateSurveyI18N.createErrorTitle,
      dialogText: CreateSurveyI18N.createErrorText,
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
  const handleSubmit = async (values: ICreateSurveyRequest) => {
    try {
      const response = await biohubApi.survey.createSurvey(Number(projectData?.project.project_id), values);

      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
        return;
      }

      setEnableCancelCheck(false);

      history.push(`/admin/projects/${projectData?.project.project_id}/surveys/${response.id}/details`);
    } catch (error) {
      const apiError = error as APIError;
      showCreateErrorDialog({
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
                  Create New Survey
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
          <Box p={5} component={Paper} display="block">
            <Formik
              innerRef={formikRef}
              initialValues={surveyInitialValues}
              validationSchema={surveyYupSchemas}
              validateOnBlur={true}
              validateOnChange={false}
              onSubmit={handleSubmit}>
              <>
                <ScrollToFormikError fieldOrder={Object.keys(surveyInitialValues)} />

                <HorizontalSplitFormComponent
                  title="General Information"
                  summary=""
                  component={
                    <GeneralInformationForm
                      type={
                        codes?.type?.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                      projectStartDate={projectData.project.start_date}
                      projectEndDate={projectData.project.end_date}
                    />
                  }></HorizontalSplitFormComponent>

                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Purpose and Methodology"
                  summary=""
                  component={
                    <PurposeAndMethodologyForm
                      intended_outcomes={
                        codes?.intended_outcomes.map((item) => {
                          return { value: item.id, label: item.name, subText: item.description };
                        }) || []
                      }
                      field_methods={
                        codes?.field_methods.map((item) => {
                          return { value: item.id, label: item.name, subText: item.description };
                        }) || []
                      }
                      ecological_seasons={
                        codes?.ecological_seasons.map((item) => {
                          return { value: item.id, label: item.name, subText: item.description };
                        }) || []
                      }
                      vantage_codes={
                        codes?.vantage_codes.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                    />
                  }></HorizontalSplitFormComponent>

                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Survey Participants"
                  summary="Specify the people who participated in this survey."
                  component={<SurveyUserForm users={[]} jobs={codes.survey_jobs} />}
                />

                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Funding Sources"
                  summary="Specify funding sources for this survey."
                  component={
                    <Box>
                      <Box component="fieldset">
                        <Typography component="legend">Add Funding Sources</Typography>
                        <Box mt={1}>
                          <SurveyFundingSourceForm />
                        </Box>
                      </Box>
                      <Box component="fieldset" mt={5}>
                        <Typography component="legend">Additional Partnerships</Typography>
                        <Box mt={1}>
                          <SurveyPartnershipsForm />
                        </Box>
                      </Box>
                    </Box>
                  }
                />

                <HorizontalSplitFormComponent
                  title="Site Selection Strategy"
                  summary="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec placerat nisl magna, et faucibus arcu condimentum sed."
                  component={
                    <Box component="fieldset">
                      <Typography component="legend">Site Selection Strategy</Typography>
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{
                          maxWidth: '72ch'
                        }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec placerat nisl magna, et faucibus arcu condimentum sed.
                      </Typography>
                      <Box mt={1}>
                        <SurveyFundingSourceForm />
                      </Box>
                    </Box>
                  }
                />

                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Study Area"
                  summary=""
                  component={<StudyAreaForm />}></HorizontalSplitFormComponent>

                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Proprietary Data"
                  summary=""
                  component={
                    <ProprietaryDataForm
                      proprietary_data_category={
                        codes?.proprietor_type?.map((item) => {
                          return { value: item.id, label: item.name, is_first_nation: item.is_first_nation };
                        }) || []
                      }
                      first_nations={
                        codes?.first_nations?.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                    />
                  }></HorizontalSplitFormComponent>

                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Agreements"
                  summary=""
                  component={<AgreementsForm />}></HorizontalSplitFormComponent>

                <Divider className={classes.sectionDivider} />

                <Box display="flex" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={() => formikRef.current?.submitForm()}
                    className={classes.actionButton}>
                    Save and Exit
                  </Button>
                  <Button variant="outlined" color="primary" onClick={handleCancel} className={classes.actionButton}>
                    Cancel
                  </Button>
                </Box>
              </>
            </Formik>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default CreateSurveyPage;
