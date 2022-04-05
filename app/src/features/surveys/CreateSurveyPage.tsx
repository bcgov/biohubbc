import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateSurveyI18N } from 'constants/i18n';
import { Formik, FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { ICreateSurveyRequest, SurveyFundingSources, SurveyPermits } from 'interfaces/useSurveyApi.interface';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { validateFormFieldsAndReportCompletion } from 'utils/customValidation';
import AgreementsForm, { AgreementsInitialValues, AgreementsYupSchema } from './components/AgreementsForm';
import GeneralInformationForm, {
  GeneralInformationInitialValues,
  GeneralInformationYupSchema
} from './components/GeneralInformationForm';
import ProprietaryDataForm, {
  ProprietaryDataInitialValues,
  ProprietaryDataYupSchema
} from './components/ProprietaryDataForm';
import StudyAreaForm, { StudyAreaInitialValues, StudyAreaYupSchema } from './components/StudyAreaForm';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { DialogContext } from 'contexts/dialogContext';
import yup from 'utils/YupSchema';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import moment from 'moment';
import { getFormattedAmount, getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';
import PurposeAndMethologyForm from './components/PurposeAndMethodologyForm';

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
  finishContainer: {
    padding: theme.spacing(3),
    backgroundColor: 'transparent'
  },
  surveySection: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(5),

    '&:last-child': {
      marginBottom: 0
    },
    '&:first-child': {
      marginTop: 0
    }
  },
  sectionDivider: {
    height: '1px'
  }
}));

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const CreateSurveyPage = () => {
  const urlParams = useParams();
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const history = useHistory();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [surveyPermits, setSurveyPermits] = useState<SurveyPermits[]>([]);
  const [surveyFundingSources, setSurveyFundingSources] = useState<SurveyFundingSources[]>([]);
  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  const intended_outcomes = [
    { id: 1, name: 'intended outcome 1' },
    { id: 2, name: 'intended outcome 2' },
    { id: 3, name: 'intended outcome 3' }
  ];

  const ecological_seasons = [
    { id: 1, name: 'ecological season 1' },
    { id: 2, name: 'ecological season 2' },
    { id: 3, name: 'ecological season 3' }
  ];

  const vantage_codes = [
    { id: 1, name: 'vantage code 1' },
    { id: 2, name: 'vantage code 2' },
    { id: 3, name: 'vantage code 3' }
  ];

  const field_methods = [
    { id: 1, name: 'method 1' },
    { id: 2, name: 'method 2' },
    { id: 3, name: 'method 3' }
  ];

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
      history.push(`/admin/projects/${projectWithDetails?.id}/surveys`);
    }
  };

  // Initial values for the survey form sections
  const [surveyInitialValues] = useState({
    ...GeneralInformationInitialValues,
    ...StudyAreaInitialValues,
    ...ProprietaryDataInitialValues,
    ...AgreementsInitialValues
  });

  // Yup schemas for the survey form sections
  const surveyYupSchemas = GeneralInformationYupSchema({
    start_date: yup
      .string()
      .isValidDateString()
      .isAfterDate(
        projectWithDetails?.project.start_date,
        DATE_FORMAT.ShortDateFormat,
        `Survey start date cannot be before project start date ${
          projectWithDetails &&
          getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, projectWithDetails.project.start_date)
        }`
      )
      .isAfterDate(
        moment(DATE_LIMIT.min).toISOString(),
        DATE_FORMAT.ShortDateFormat,
        `Survey start date cannot be before ${getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, DATE_LIMIT.min)}`
      )
      .required('Required'),
    end_date: yup
      .string()
      .isValidDateString()
      .isEndDateAfterStartDate('start_date')
      .isBeforeDate(
        projectWithDetails?.project.end_date,
        DATE_FORMAT.ShortDateFormat,
        `Survey end date cannot be after project end date ${
          projectWithDetails && getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, projectWithDetails.project.end_date)
        }`
      )
      .isBeforeDate(
        moment(DATE_LIMIT.max).toISOString(),
        DATE_FORMAT.ShortDateFormat,
        `Survey end date cannot be after ${getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, DATE_LIMIT.max)}`
      )
  })
    .concat(StudyAreaYupSchema)
    .concat(ProprietaryDataYupSchema)
    .concat(AgreementsYupSchema);

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.codes.getAllCodeSets();

      if (!codesResponse) {
        // TODO error handling/messaging
        return;
      }

      setCodes(codesResponse);
    };

    if (!isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(true);
    }
  }, [urlParams, biohubApi.codes, isLoadingCodes, codes]);

  const getProject = useCallback(async () => {
    const [projectWithDetailsResponse, surveyPermitsResponse, surveyFundingSourcesResponse] = await Promise.all([
      biohubApi.project.getProjectForView(urlParams['id']),
      biohubApi.survey.getSurveyPermits(urlParams['id']),
      biohubApi.survey.getSurveyFundingSources(urlParams['id'])
    ]);

    if (!projectWithDetailsResponse || !surveyPermitsResponse || !surveyFundingSourcesResponse) {
      // TODO error handling/messaging
      return;
    }

    setSurveyPermits(surveyPermitsResponse);
    setSurveyFundingSources(surveyFundingSourcesResponse);
    setProjectWithDetails(projectWithDetailsResponse);
  }, [biohubApi.project, biohubApi.survey, urlParams]);

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectWithDetails?.id}/surveys`);
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
   * Creates a new project survey record
   *
   * @param {ICreateSurveyRequest} surveyPostObject
   * @return {*}
   */
  const createSurvey = async (surveyPostObject: ICreateSurveyRequest) => {
    const response = await biohubApi.survey.createSurvey(Number(projectWithDetails?.id), surveyPostObject);

    if (!response?.id) {
      showCreateErrorDialog({ dialogError: 'The response from the server was null, or did not contain a survey ID.' });
      return;
    }

    return response;
  };

  /**
   * Handle creation of surveys.
   */
  const handleSubmit = async () => {
    if (!formikRef?.current) {
      return;
    }

    await formikRef.current?.submitForm();

    const isValid = await validateFormFieldsAndReportCompletion(
      formikRef.current?.values,
      formikRef.current?.validateForm
    );

    if (!isValid) {
      showCreateErrorDialog({
        dialogTitle: 'Create Survey Form Incomplete',
        dialogText:
          'The form is missing some required fields/sections highlighted in red. Please fill them out and try again.'
      });

      return;
    }

    try {
      const response = await createSurvey(formikRef.current?.values);

      if (!response) {
        return;
      }

      setEnableCancelCheck(false);

      history.push(`/admin/projects/${projectWithDetails?.id}/surveys/${response.id}/details`);
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

  if (!codes || !projectWithDetails) {
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
              <Link color="primary" onClick={handleCancel} aria-current="page" className={classes.breadCrumbLink}>
                <Typography variant="body2">{projectWithDetails.project.project_name}</Typography>
              </Link>
              <Typography variant="body2">Create Survey</Typography>
            </Breadcrumbs>
          </Box>

          <Box mb={5}>
            <Typography variant="h1">Create Survey</Typography>
          </Box>
          <Box py="3" component={Paper} display="block">
            <Formik
              innerRef={formikRef}
              initialValues={surveyInitialValues}
              validationSchema={surveyYupSchemas}
              validateOnBlur={true}
              validateOnChange={false}
              onSubmit={() => {}}>
              <>
                <HorizontalSplitFormComponent
                  title="General Information"
                  summary=""
                  component={
                    <GeneralInformationForm
                      species={
                        codes?.species?.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                      permit_numbers={
                        surveyPermits?.map((item) => {
                          return { value: item.number, label: `${item.number} - ${item.type}` };
                        }) || []
                      }
                      funding_sources={
                        surveyFundingSources?.map((item) => {
                          return {
                            value: item.pfsId,
                            label: `${item.agencyName} | ${getFormattedAmount(
                              item.amount
                            )} | ${getFormattedDateRangeString(
                              DATE_FORMAT.ShortMediumDateFormat,
                              item.startDate,
                              item.endDate
                            )}`
                          };
                        }) || []
                      }
                      projectStartDate={projectWithDetails.project.start_date}
                      projectEndDate={projectWithDetails.project.end_date}
                    />
                  }></HorizontalSplitFormComponent>

                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Purpose And Methodology"
                  summary=""
                  component={
                    <PurposeAndMethologyForm
                      intended_outcomes={
                        intended_outcomes.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                      field_methods={
                        field_methods.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                      ecological_seasons={
                        ecological_seasons.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                      vantage_codes={
                        vantage_codes.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                    />
                  }></HorizontalSplitFormComponent>

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
              </>
            </Formik>

            <Box p={3} display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                className={classes.actionButton}>
                Save and Exit
              </Button>
              <Button variant="outlined" color="primary" onClick={handleCancel} className={classes.actionButton}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default CreateSurveyPage;
