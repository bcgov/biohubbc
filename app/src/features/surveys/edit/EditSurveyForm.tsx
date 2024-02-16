import { Stack, Theme, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { makeStyles } from '@mui/styles';
import SnackbarComponent from 'components/alert/SnackbarComponent';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { default as dayjs } from 'dayjs';
import SamplingStrategyForm from 'features/surveys/components/SamplingStrategyForm';
import SurveyPartnershipsForm, {
  SurveyPartnershipsFormInitialValues,
  SurveyPartnershipsFormYupSchema
} from 'features/surveys/view/components/SurveyPartnershipsForm';
import { Formik, FormikProps } from 'formik';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { ProjectViewObject } from 'interfaces/useProjectApi.interface';
import { IEditSurveyRequest, SurveyUpdateObject } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { StringBoolean } from 'types/misc';
import { getFormattedDate } from 'utils/Utils';
import yup from 'utils/YupSchema';
import AgreementsForm, { AgreementsYupSchema } from '../components/AgreementsForm';
import GeneralInformationForm, {
  GeneralInformationInitialValues,
  GeneralInformationYupSchema
} from '../components/GeneralInformationForm';
import ProprietaryDataForm, { ProprietaryDataYupSchema } from '../components/ProprietaryDataForm';
import PurposeAndMethodologyForm, { PurposeAndMethodologyYupSchema } from '../components/PurposeAndMethodologyForm';
import StudyAreaForm, { SurveyLocationInitialValues, SurveyLocationYupSchema } from '../components/StudyAreaForm';
import { SurveyBlockInitialValues } from '../components/SurveyBlockSection';
import SurveyFundingSourceForm, {
  SurveyFundingSourceFormInitialValues,
  SurveyFundingSourceFormYupSchema
} from '../components/SurveyFundingSourceForm';
import { SurveySiteSelectionInitialValues, SurveySiteSelectionYupSchema } from '../components/SurveySiteSelectionForm';
import SurveyUserForm, { SurveyUserJobFormInitialValues, SurveyUserJobYupSchema } from '../components/SurveyUserForm';

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
  codes: IGetAllCodeSetsResponse;
  projectData: ProjectViewObject;
  surveyData: SurveyUpdateObject;
  handleSubmit: (formikData: IEditSurveyRequest) => void;
  handleCancel: () => void;
  formikRef: React.RefObject<FormikProps<IEditSurveyRequest>>;
}

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const EditSurveyForm: React.FC<IEditSurveyForm> = (props) => {
  const classes = useStyles();

  // Initial values for the survey form sections
  const [surveyInitialValues] = useState<IEditSurveyRequest>({
    ...GeneralInformationInitialValues,
    ...{
      purpose_and_methodology: {
        intended_outcome_ids: [],
        additional_details: '',
        vantage_code_ids: []
      }
    },
    ...SurveyLocationInitialValues,
    ...SurveyFundingSourceFormInitialValues,
    ...SurveyPartnershipsFormInitialValues,
    ...SurveySiteSelectionInitialValues,
    ...{
      proprietor: {
        survey_data_proprietary: '' as unknown as StringBoolean,
        proprietary_data_category: 0,
        proprietor_name: '',
        first_nations_id: 0,
        category_rationale: '',
        disa_required: '' as unknown as StringBoolean
      }
    },
    ...{
      agreements: {
        sedis_procedures_accepted: 'true' as unknown as StringBoolean,
        foippa_requirements_accepted: 'true' as unknown as StringBoolean
      }
    },
    ...SurveyUserJobFormInitialValues,
    ...SurveyBlockInitialValues
  });

  // Yup schemas for the survey form sections
  const surveyEditYupSchemas = GeneralInformationYupSchema({
    start_date: yup
      .string()
      .isValidDateString()
      .isAfterDate(
        props.projectData.project.start_date,
        DATE_FORMAT.ShortDateFormat,
        `Survey start date cannot be before project start date ${
          props.projectData && getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, props.projectData.project.start_date)
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
        props.projectData.project.end_date,
        DATE_FORMAT.ShortDateFormat,
        `Survey end date cannot be after project end date ${
          props.projectData && getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, props.projectData.project.end_date)
        }`
      )
      .isBeforeDate(
        dayjs(DATE_LIMIT.max).toISOString(),
        DATE_FORMAT.ShortDateFormat,
        `Survey end date cannot be after ${getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, DATE_LIMIT.max)}`
      )
      .nullable()
  })
    .concat(SurveyLocationYupSchema)
    .concat(PurposeAndMethodologyYupSchema)
    .concat(ProprietaryDataYupSchema)
    .concat(SurveyFundingSourceFormYupSchema)
    .concat(AgreementsYupSchema)
    .concat(SurveyUserJobYupSchema)
    .concat(SurveySiteSelectionYupSchema)
    .concat(SurveyPartnershipsFormYupSchema);

  return (
    <Box p={5} component={Paper} display="block">
      <Formik
        innerRef={props.formikRef}
        initialValues={surveyInitialValues}
        validationSchema={surveyEditYupSchemas}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={props.handleSubmit}>
        <>
          <SnackbarComponent />
          <HorizontalSplitFormComponent
            title="General Information"
            summary=""
            component={
              <GeneralInformationForm
                type={
                  props.codes?.type?.map((item) => {
                    return { value: item.id, label: item.name };
                  }) || []
                }
                projectStartDate={props.projectData.project.start_date}
                projectEndDate={props.projectData.project.end_date}
              />
            }></HorizontalSplitFormComponent>

          <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Purpose and Methodology"
            summary=""
            component={
              <PurposeAndMethodologyForm
                intended_outcomes={
                  props.codes.intended_outcomes.map((item) => {
                    return { value: item.id, label: item.name, subText: item.description };
                  }) || []
                }
                vantage_codes={
                  props.codes.vantage_codes.map((item) => {
                    return { value: item.id, label: item.name };
                  }) || []
                }
              />
            }></HorizontalSplitFormComponent>

          <Divider className={classes.sectionDivider} />

          <HorizontalSplitFormComponent
            title="Survey Participants"
            summary="Specify the people who participated in this survey."
            component={<SurveyUserForm users={props?.surveyData?.participants || []} jobs={props.codes.survey_jobs} />}
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
            summary=""
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
            summary=""
            component={
              <ProprietaryDataForm
                proprietary_data_category={
                  props.codes.proprietor_type?.map((item) => {
                    return { value: item.id, label: item.name, is_first_nation: item.is_first_nation };
                  }) || []
                }
                first_nations={
                  props.codes.first_nations?.map((item) => {
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
              onClick={() => props.formikRef.current?.submitForm()}
              className={classes.actionButton}>
              Save and Exit
            </Button>
            <Button variant="outlined" color="primary" onClick={props.handleCancel} className={classes.actionButton}>
              Cancel
            </Button>
          </Box>
        </>
      </Formik>
    </Box>
  );
};

export default EditSurveyForm;
