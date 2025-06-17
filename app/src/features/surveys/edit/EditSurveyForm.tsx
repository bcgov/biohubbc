import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HelpButtonStack from 'components/buttons/HelpButtonStack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import SurveyPermitForm, { ISurveyPermitForm } from 'features/surveys/components/permit/SurveyPermitForm';
import SamplingStrategyForm from 'features/surveys/components/sampling-strategy/SamplingStrategyForm';
import SurveyPartnershipsForm, {
  SurveyPartnershipsFormYupSchema
} from 'features/surveys/view/components/SurveyPartnershipsForm';
import { Formik, FormikProps } from 'formik';
import { ICreateSurveyRequest, IUpdateSurveyRequest } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useEffect } from 'react';
import AgreementsForm, { AgreementsYupSchema } from '../components/agreements/AgreementsForm';
import ProprietaryDataForm, { ProprietaryDataYupSchema } from '../components/agreements/ProprietaryDataForm';
import SurveyFundingSourceForm, {
  ISurveyFundingSourceForm,
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
import SpeciesForm, { SpeciesYupSchema } from '../components/species/SpeciesForm';

interface IEditSurveyForm<
  T extends
    | (IUpdateSurveyRequest & ISurveyPermitForm & ISurveyFundingSourceForm)
    | (ICreateSurveyRequest & ISurveyPermitForm & ISurveyFundingSourceForm)
> {
  initialSurveyData: T;
  handleSubmit: (formikData: T) => void;
  formikRef: React.RefObject<FormikProps<T>>;
}

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const EditSurveyForm = <
  T extends
    | (IUpdateSurveyRequest & ISurveyPermitForm & ISurveyFundingSourceForm)
    | (ICreateSurveyRequest & ISurveyPermitForm & ISurveyFundingSourceForm)
>(
  props: IEditSurveyForm<T>
) => {
  const projectContext = useContext(ProjectContext);
  const projectData = projectContext.projectDataLoader.data?.projectData;

  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  if (!projectData || !codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const surveyEditYupSchemas = GeneralInformationYupSchema()
    .concat(PurposeAndMethodologyYupSchema)
    .concat(ProprietaryDataYupSchema)
    .concat(SurveyFundingSourceFormYupSchema)
    .concat(AgreementsYupSchema)
    .concat(SurveyUserJobYupSchema)
    .concat(SurveyLocationYupSchema)
    .concat(SurveySiteSelectionYupSchema)
    .concat(SurveyPartnershipsFormYupSchema)
    .concat(SpeciesYupSchema);

  return (
    <Formik<T>
      innerRef={props.formikRef}
      initialValues={props.initialSurveyData}
      validationSchema={surveyEditYupSchemas}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={props.handleSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />
        <HorizontalSplitFormComponent
          title="General Information"
          summary="Enter information about the survey"
          component={
            <GeneralInformationForm
              progress={
                codes?.survey_progress?.map((item) => {
                  return { value: item.id, label: item.name, description: item.description };
                }) || []
              }
            />
          }></HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent
          title="Focal species"
          summary="Enter focal species that were targetted in the survey">
          <SpeciesForm />
        </HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent
          title="Permits"
          summary="Enter any permits used in this survey"
          component={
            <Box component="fieldset">
              <HelpButtonStack helpText="Any permits with data submission requirements must be listed.">
                <Typography fontWeight={700}>Were any permits used in this survey?</Typography>
              </HelpButtonStack>
              <SurveyPermitForm />
            </Box>
          }
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="Funding Sources"
          summary="Specify funding sources for this survey"
          component={
            <Box component="fieldset">
              <HelpButtonStack helpText="Any funding sources with data submission requirements must be listed.">
                <Typography fontWeight={700}>Do any funding agencies require this survey to be submitted?</Typography>
              </HelpButtonStack>
              <SurveyFundingSourceForm />
            </Box>
          }
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="Purpose and Methodology"
          summary="Select the types of data collected and describe the survey objectives"
          component={
            <PurposeAndMethodologyForm
              intended_outcomes={
                codes.intended_outcomes?.map((item) => ({
                  value: item.id,
                  label: item.name,
                  description: item.description
                })) ?? []
              }
              type={
                codes.survey_data_type?.map((item) => ({
                  value: item.id,
                  label: item.name,
                  description: item.description
                })) ?? []
              }
            />
          }></HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent
          title="Survey Participants"
          summary="Specify people who participated in this survey"
          component={<SurveyUserForm jobs={codes.survey_jobs} />}
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="Partnerships"
          summary="Enter any partners involved in the survey"
          component={<SurveyPartnershipsForm />}
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="Sampling Strategy"
          summary="Specify site selection methods, stratums and optional sampling blocks for this survey"
          component={<SamplingStrategyForm />}
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="Study Area"
          summary="Import, draw or select a feature from an existing layer to define general areas of interest where survey findings apply."
          component={<StudyAreaForm />}
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="Proprietary Data"
          summary="Indicate whether any data is proprietary"
          component={
            <Box component="fieldset">
              <HelpButtonStack helpText="Proprietary data is information collected while on private or First Nations land and that the land owner or First Nation has requested be secured, or for which the data provider has ownership rights.">
                <Typography fontWeight={700}>Is any data in this survey proprietary?</Typography>
              </HelpButtonStack>
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
            </Box>
          }></HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent
          title="Agreements"
          summary="Confirm that you understand the SEDIS procedures and how they relate to data in the survey"
          component={<AgreementsForm />}></HorizontalSplitFormComponent>

        <Divider />
      </Stack>
    </Formik>
  );
};

export default EditSurveyForm;
