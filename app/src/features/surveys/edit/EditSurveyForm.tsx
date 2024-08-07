import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import SamplingStrategyForm from 'features/surveys/components/sampling-strategy/SamplingStrategyForm';
import SurveyPartnershipsForm, {
  SurveyPartnershipsFormYupSchema
} from 'features/surveys/view/components/SurveyPartnershipsForm';
import { Formik, FormikProps } from 'formik';
import { ICreateSurveyRequest, IEditSurveyRequest, SurveyUpdateObject } from 'interfaces/useSurveyApi.interface';
import React, { useContext } from 'react';
import AgreementsForm, { AgreementsYupSchema } from '../components/agreements/AgreementsForm';
import ProprietaryDataForm, { ProprietaryDataYupSchema } from '../components/agreements/ProprietaryDataForm';
import SurveyFundingSourceForm, {
  SurveyFundingSourceFormYupSchema
} from '../components/funding/SurveyFundingSourceForm';
import GeneralInformationForm, {
  GeneralInformationYupSchema
} from '../components/general-information/GeneralInformationForm';
import StudyAreaForm, { SurveyLocationYupSchema } from '../components/locations/StudyAreaForm';
import PurposeAndMethodologyForm, {
  PurposeAndMethodologyYupSchema
} from '../components/methodology/PurposeAndMethodologyForm';
import SurveyUserForm, { SurveyUserJobYupSchema } from '../components/participants/SurveyUserForm';
import { SurveySiteSelectionYupSchema } from '../components/sampling-strategy/SurveySiteSelectionForm';
import { ISurveyPermitForm } from '../SurveyPermitForm';

export interface IEditSurveyForm {
  initialSurveyData: SurveyUpdateObject | (ICreateSurveyRequest & ISurveyPermitForm);
  handleSubmit: (formikData: IEditSurveyRequest) => void;
  formikRef: React.RefObject<FormikProps<IEditSurveyRequest>>;
}

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const EditSurveyForm = (props: IEditSurveyForm) => {
  const projectContext = useContext(ProjectContext);
  const projectData = projectContext.projectDataLoader.data?.projectData;

  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;

  if (!projectData || !codes) {
    return <></>;
  }

  const surveyEditYupSchemas = GeneralInformationYupSchema()
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
      initialValues={props.initialSurveyData as IEditSurveyRequest}
      validationSchema={surveyEditYupSchemas}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={props.handleSubmit}>
      <Stack gap={5}>
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
              progress={
                codes?.survey_progress?.map((item) => {
                  return { value: item.id, label: item.name, subText: item.description };
                }) || []
              }
            />
          }></HorizontalSplitFormComponent>

        <Divider />

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

        <Divider />

        <HorizontalSplitFormComponent
          title="Survey Participants"
          summary="Specify the people who participated in this survey."
          component={<SurveyUserForm jobs={codes.survey_jobs} />}
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="Funding Sources"
          summary="Specify funding sources for this survey."
          component={
            <Box>
              <Box component="fieldset">
                <Typography component="legend">Add Funding Sources</Typography>
                <SurveyFundingSourceForm />
              </Box>
              <Box component="fieldset" mt={5}>
                <Typography component="legend">Additional Partnerships</Typography>
                <SurveyPartnershipsForm />
              </Box>
            </Box>
          }
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="Sampling Strategy"
          summary="Specify site selection methods, stratums and optional sampling blocks for this survey."
          component={<SamplingStrategyForm />}
        />

        <Divider />

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

        <Divider />

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

        <Divider />

        <HorizontalSplitFormComponent title="Agreements" component={<AgreementsForm />}></HorizontalSplitFormComponent>

        <Divider />
      </Stack>
    </Formik>
  );
};

export default EditSurveyForm;
