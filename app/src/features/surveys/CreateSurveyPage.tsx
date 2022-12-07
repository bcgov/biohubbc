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
import { mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { ScrollToFormikError } from 'components/formik/ScrollToFormikError';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { CreateSurveyI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { ICreateSurveyRequest, ISurveyAvailableFundingSources } from 'interfaces/useSurveyApi.interface';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import { getFormattedAmount, getFormattedDate, getFormattedDateRangeString } from 'utils/Utils';
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
  const urlParams = useParams();
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const history = useHistory();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [surveyFundingSources, setSurveyFundingSources] = useState<ISurveyAvailableFundingSources[]>([]);
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
      history.push(`/admin/projects/${projectWithDetails?.id}/surveys`);
    }
  };

  // Initial values for the survey form sections
  const [surveyInitialValues] = useState<ICreateSurveyRequest>({
    ...GeneralInformationInitialValues,
    ...PurposeAndMethodologyInitialValues,
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
      .required('Start Date is Required'),
    end_date: yup
      .string()
      .isValidDateString()
      .isEndDateSameOrAfterStartDate('start_date')
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
    .concat(PurposeAndMethodologyYupSchema)
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
    const [projectWithDetailsResponse, surveyFundingSourcesResponse] = await Promise.all([
      biohubApi.project.getProjectForView(urlParams['id']),
      biohubApi.survey.getAvailableSurveyFundingSources(urlParams['id'])
    ]);

    if (!projectWithDetailsResponse || !surveyFundingSourcesResponse) {
      // TODO error handling/messaging
      return;
    }

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
   * Handle creation of surveys.
   *
   * @return {*}
   */
  const handleSubmit = async (values: ICreateSurveyRequest) => {
    try {
      const response = await biohubApi.survey.createSurvey(Number(projectWithDetails?.id), values);

      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a survey ID.'
        });
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
                <Link color="primary" onClick={handleCancel} aria-current="page">
                  <Typography variant="body1" component="span">{projectWithDetails.project.project_name}</Typography>
                </Link>
                <Typography variant="body1" component="span">Create Survey</Typography>
              </Breadcrumbs>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Box className={classes.pageTitleContainer}>
                <Typography variant="h1" className={classes.pageTitle}>
                  Create Survey
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
                      funding_sources={
                        surveyFundingSources?.map((item) => {
                          return {
                            value: item.id,
                            label: `${
                              codes.funding_source.find((fundingCode) => fundingCode.id === item.agency_id)?.name
                            } | ${getFormattedAmount(item.funding_amount)} | ${getFormattedDateRangeString(
                              DATE_FORMAT.ShortMediumDateFormat,
                              item.start_date,
                              item.end_date
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

                <Box p={3} display="flex" justifyContent="flex-end">
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
