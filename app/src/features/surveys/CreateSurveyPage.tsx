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
import { ICreateSurveyRequest, SurveyPermitNumbers } from 'interfaces/useSurveyApi.interface';
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
import CreateSurveySection from './CreateSurveySection';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { DialogContext } from 'contexts/dialogContext';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import yup from 'utils/YupSchema';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import moment from 'moment';
import { getFormattedDate } from 'utils/Utils';

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

  const park: IMultiAutocompleteFieldOption[] = [
    {
      value: 'Park name 1',
      label: 'Park name 1'
    },
    {
      value: 'Park name 2',
      label: 'Park name 2'
    }
  ];

  const management_unit: IMultiAutocompleteFieldOption[] = [
    {
      value: 'Management unit 1',
      label: 'Management unit 1'
    },
    {
      value: 'Management unit 2',
      label: 'Management unit 2'
    }
  ];

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingPermitNumbers, setIsLoadingPermitNumbers] = useState(false);
  const [permitNumbers, setPermitNumbers] = useState<SurveyPermitNumbers[]>([]);
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
      history.push(`/projects/${projectWithDetails?.id}/surveys`);
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
    const getPermitNumbers = async (projectId: number) => {
      const permitNumbersResponse = await biohubApi.survey.getSurveyPermitNumbers(projectId);

      if (!permitNumbersResponse) {
        // TODO error handling/messaging
        return;
      }

      setPermitNumbers(permitNumbersResponse);
    };

    if (!isLoadingPermitNumbers && !permitNumbers.length && projectWithDetails) {
      getPermitNumbers(projectWithDetails.id);
      setIsLoadingPermitNumbers(true);
    }
  }, [biohubApi.survey, isLoadingPermitNumbers, permitNumbers, projectWithDetails]);

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
    const projectWithDetailsResponse = await biohubApi.project.getProjectForView(urlParams['id']);

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [biohubApi.project, urlParams]);

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/projects/${projectWithDetails?.id}/surveys`);
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

      history.push(`/projects/${projectWithDetails?.id}/surveys/${response.id}/details`);
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
                onClick={() => history.push('/projects')}
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

          <Box mb={3}>
            <Typography variant="h1">Create Survey</Typography>
          </Box>
          <Box mb={5}>
            <Typography variant="body1">
              Lorem Ipsum dolor sit amet, consecteur, Lorem Ipsum dolor sit amet, consecteur. Lorem Ipsum dolor sit
              amet, consecteur. Lorem Ipsum dolor sit amet, consecteur. Lorem Ipsum dolor sit amet, consecteur
            </Typography>
          </Box>
          <Box component={Paper} display="block">
            <Formik
              innerRef={formikRef}
              initialValues={surveyInitialValues}
              validationSchema={surveyYupSchemas}
              validateOnBlur={true}
              validateOnChange={false}
              onSubmit={() => {}}>
              <>
                <CreateSurveySection
                  title="General Information"
                  summary="General Information Summary (to be completed)"
                  component={
                    <GeneralInformationForm
                      species={
                        codes?.species?.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                      permit_numbers={
                        permitNumbers?.map((item) => {
                          return { value: item.number, label: item.number };
                        }) || []
                      }
                      projectStartDate={projectWithDetails.project.start_date}
                      projectEndDate={projectWithDetails.project.end_date}
                    />
                  }></CreateSurveySection>
                <Divider className={classes.sectionDivider} />

                <CreateSurveySection
                  title="Study Area"
                  summary="Study Area Summary (to be completed)"
                  component={<StudyAreaForm park={park} management_unit={management_unit} />}></CreateSurveySection>
                <Divider className={classes.sectionDivider} />

                <CreateSurveySection
                  title="Proprietary Data"
                  summary="Proprietary Data Summary (to be completed)"
                  component={
                    <ProprietaryDataForm
                      proprietary_data_category={
                        codes?.proprietor_type?.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                      first_nations={
                        codes?.first_nations?.map((item) => {
                          return { value: item.id, label: item.name };
                        }) || []
                      }
                    />
                  }></CreateSurveySection>
                <Divider className={classes.sectionDivider} />

                <CreateSurveySection
                  title="Agreements"
                  summary="Agreements Summary (to be completed)"
                  component={<AgreementsForm />}></CreateSurveySection>
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
