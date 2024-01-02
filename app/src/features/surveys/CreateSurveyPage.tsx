import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { ScrollToFormikError } from 'components/formik/ScrollToFormikError';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { CreateSurveyI18N } from 'constants/i18n';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { default as dayjs } from 'dayjs';
import SurveyPartnershipsForm, {
  SurveyPartnershipsFormInitialValues,
  SurveyPartnershipsFormYupSchema
} from 'features/surveys/view/components/SurveyPartnershipsForm';
import { Formik, FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICreateSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
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
import SamplingStrategyForm from './components/SamplingStrategyForm';
import StudyAreaForm, { SurveyLocationInitialValues, SurveyLocationYupSchema } from './components/StudyAreaForm';
import { SurveyBlockInitialValues } from './components/SurveyBlockSection';
import SurveyFundingSourceForm, {
  SurveyFundingSourceFormInitialValues,
  SurveyFundingSourceFormYupSchema
} from './components/SurveyFundingSourceForm';
import { SurveySiteSelectionInitialValues, SurveySiteSelectionYupSchema } from './components/SurveySiteSelectionForm';
import SurveyUserForm, { SurveyUserJobFormInitialValues, SurveyUserJobYupSchema } from './components/SurveyUserForm';
import SurveyBaseHeader from './view/components/SurveyBaseHeader';

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const CreateSurveyPage = () => {
  const biohubApi = useBiohubApi();
  const history = useHistory();

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

  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState<boolean>(true);

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
      history.push(`/admin/projects/${projectData?.project.project_id}`);
    }
  };

  // Initial values for the survey form sections
  const [surveyInitialValues] = useState<ICreateSurveyRequest>({
    ...GeneralInformationInitialValues,
    ...PurposeAndMethodologyInitialValues,
    ...SurveyFundingSourceFormInitialValues,
    ...SurveyPartnershipsFormInitialValues,
    ...ProprietaryDataInitialValues,
    ...AgreementsInitialValues,
    ...SurveyLocationInitialValues,
    ...SurveySiteSelectionInitialValues,
    ...SurveyUserJobFormInitialValues,
    ...SurveyBlockInitialValues
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
        dayjs(DATE_LIMIT.min).toISOString(),
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
        dayjs(DATE_LIMIT.max).toISOString(),
        DATE_FORMAT.ShortDateFormat,
        `Survey end date cannot be after ${getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, DATE_LIMIT.max)}`
      )
      .nullable()
      .optional()
  })
    .concat(PurposeAndMethodologyYupSchema)
    .concat(ProprietaryDataYupSchema)
    .concat(SurveyFundingSourceFormYupSchema)
    .concat(AgreementsYupSchema)
    .concat(SurveyUserJobYupSchema)
    .concat(SurveyLocationYupSchema)
    .concat(SurveySiteSelectionYupSchema)
    .concat(SurveyPartnershipsFormYupSchema);

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/projects/${projectData?.project.project_id}`);
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
      <SurveyBaseHeader
        title="Create New Survey"
        breadCrumb={
          <Breadcrumbs>
            <Link
              component={RouterLink}
              variant="body2"
              underline="hover"
              to={`/admin/projects/${projectData.project.project_id}/`}
              aria-current="page">
              {projectData.project.project_name}
            </Link>
            <Typography variant="body2" component="span">
              Create New Survey
            </Typography>
          </Breadcrumbs>
        }
        buttonJSX={
          <Stack flexDirection="row" gap={1}>
            <Button color="primary" variant="contained" onClick={() => formikRef.current?.submitForm()}>
              Save and Exit
            </Button>
            <Button color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </Stack>
        }
      />

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
                <Stack gap={5} divider={<Divider flexItem />}>
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
                        vantage_codes={
                          codes?.vantage_codes.map((item) => {
                            return { value: item.id, label: item.name };
                          }) || []
                        }
                      />
                    }></HorizontalSplitFormComponent>

                  <HorizontalSplitFormComponent
                    title="Survey Participants"
                    summary="Specify the people who participated in this survey."
                    component={<SurveyUserForm users={[]} jobs={codes.survey_jobs} />}
                  />

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
                    title="Sampling Strategy"
                    summary="Specify site selection methods, stratums and optional sampling blocks for this survey."
                    component={<SamplingStrategyForm />}
                  />

                  <HorizontalSplitFormComponent
                    title="Study Area"
                    summary=""
                    component={<StudyAreaForm />}></HorizontalSplitFormComponent>

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

                  <HorizontalSplitFormComponent
                    title="Agreements"
                    summary=""
                    component={<AgreementsForm />}></HorizontalSplitFormComponent>

                  <Stack flexDirection="row" justifyContent="flex-end" gap={1}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        formikRef.current?.submitForm();
                      }}>
                      Save and Exit
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </>
            </Formik>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default CreateSurveyPage;
