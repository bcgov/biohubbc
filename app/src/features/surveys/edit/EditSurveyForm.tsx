import { Stack, Theme, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { makeStyles } from '@mui/styles';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import { default as dayjs } from 'dayjs';
import SamplingStrategyForm from 'features/surveys/components/SamplingStrategyForm';
import SurveyPartnershipsForm, {
  SurveyPartnershipsFormYupSchema
} from 'features/surveys/view/components/SurveyPartnershipsForm';
import { Formik, FormikProps } from 'formik';
import { ICreateSurveyRequest, IEditSurveyRequest, SurveyUpdateObject } from 'interfaces/useSurveyApi.interface';
import React, { useContext } from 'react';
import { getFormattedDate } from 'utils/Utils';
import yup from 'utils/YupSchema';
import AgreementsForm, { AgreementsYupSchema } from '../components/AgreementsForm';
import GeneralInformationForm, { GeneralInformationYupSchema } from '../components/GeneralInformationForm';
import ProprietaryDataForm, { ProprietaryDataYupSchema } from '../components/ProprietaryDataForm';
import PurposeAndMethodologyForm, { PurposeAndMethodologyYupSchema } from '../components/PurposeAndMethodologyForm';
import StudyAreaForm, { SurveyLocationYupSchema } from '../components/StudyAreaForm';
import SurveyFundingSourceForm, { SurveyFundingSourceFormYupSchema } from '../components/SurveyFundingSourceForm';
import { SurveySiteSelectionYupSchema } from '../components/SurveySiteSelectionForm';
import SurveyUserForm, { SurveyUserJobYupSchema } from '../components/SurveyUserForm';

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
  }
}));

export interface IEditSurveyForm {
  initialSurveyData: SurveyUpdateObject | ICreateSurveyRequest;
  handleSubmit: (formikData: IEditSurveyRequest) => void;
  formikRef: React.RefObject<FormikProps<IEditSurveyRequest>>;
}

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const EditSurveyForm = (props: IEditSurveyForm) => {
  const classes = useStyles();

  const projectContext = useContext(ProjectContext);
  const projectData = projectContext.projectDataLoader.data?.projectData;

  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;

  if (!projectData || !codes) {
    return <></>;
  }

  const surveyEditYupSchemas = GeneralInformationYupSchema({
    start_date: yup
      .string()
      .isValidDateString()
      .isAfterDate(
        projectData.project.start_date,
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
        projectData.project.end_date,
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

  return (
    <Formik
      innerRef={props.formikRef}
      initialValues={props.initialSurveyData as unknown as IEditSurveyRequest}
      validationSchema={surveyEditYupSchemas}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={props.handleSubmit}>
      <>
        <FormikErrorSnackbar />
        <HorizontalSplitFormComponent
          title="General Information"
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
          component={
            <PurposeAndMethodologyForm
              intended_outcomes={
                codes.intended_outcomes.map((item) => {
                  return { value: item.id, label: item.name, subText: item.description };
                }) || []
              }
              vantage_codes={
                codes.vantage_codes.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          }></HorizontalSplitFormComponent>

        <Divider className={classes.sectionDivider} />

        <HorizontalSplitFormComponent
          title="Survey Participants"
          summary="Specify the people who participated in this survey."
          component={<SurveyUserForm jobs={codes.survey_jobs} />}
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

        <Divider className={classes.sectionDivider} />

        <HorizontalSplitFormComponent
          title="Sampling Strategy"
          summary="Specify site selection methods, stratums and optional sampling blocks for this survey."
          component={<SamplingStrategyForm />}
        />

        <Divider className={classes.sectionDivider} />

        <HorizontalSplitFormComponent
          title="Study Area"
          component={
            <Box component="fieldset">
              <Typography component="legend">Define Survey Study Area</Typography>
              <Stack gap={3}>
                <Typography variant="body1" color="textSecondary">
                  Import, draw or select a feature from an existing layer to define the study areas for this survey.
                </Typography>
                <StudyAreaForm />
              </Stack>
            </Box>
          }
        />

        <Divider className={classes.sectionDivider} />

        <HorizontalSplitFormComponent
          title="Proprietary Data"
          component={
            <ProprietaryDataForm
              proprietary_data_category={
                codes.proprietor_type?.map((item) => {
                  return { value: item.id, label: item.name, is_first_nation: item.is_first_nation };
                }) || []
              }
              first_nations={
                codes.first_nations?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          }></HorizontalSplitFormComponent>

        <Divider className={classes.sectionDivider} />

        <HorizontalSplitFormComponent title="Agreements" component={<AgreementsForm />}></HorizontalSplitFormComponent>
        <Divider className={classes.sectionDivider} />
      </>
    </Formik>
  );
};

export default EditSurveyForm;
