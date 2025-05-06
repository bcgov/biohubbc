import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HelpButtonStack from 'components/buttons/HelpButtonStack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { CodesContext } from 'contexts/codesContext';

import SurveyPermitForm, { ISurveyPermitForm } from 'features/surveys/components/permit/SurveyPermitForm';
import SurveyPartnershipsForm, {
  SurveyPartnershipsFormYupSchema
} from 'features/surveys/view/components/SurveyPartnershipsForm';
import { Formik, FormikProps } from 'formik';
import { ICreateSurveyRequest, IUpdateSurveyRequest } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useEffect } from 'react';
import yup from 'utils/YupSchema';
import AgreementsForm, { AgreementsYupSchema } from '../components/agreements/AgreementsForm';
import { ProprietaryDataYupSchema } from '../components/agreements/ProprietaryDataForm';
import SurveyFundingSourceForm, {
  ISurveyFundingSourceForm,
  SurveyFundingSourceFormYupSchema
} from '../components/funding/SurveyFundingSourceForm';
import GeneralInformationForm, {
  GeneralInformationYupSchema
} from '../components/general-information/GeneralInformationForm';
import StudyAreaForm, { SurveyLocationYupSchema } from '../components/locations/StudyAreaForm';
import { SurveyMembersForm } from '../components/member/SurveyMembersForm';
import PurposeAndMethodologyForm, {
  PurposeAndMethodologyYupSchema
} from '../components/methodology/PurposeAndMethodologyForm';
import SurveyUserForm, { SurveyParticipantsJobYupSchema } from '../components/participants/SurveyUserForm';
import { SurveySiteSelectionYupSchema } from '../components/sampling-strategy/SurveySiteSelectionForm';
import SpeciesForm, { SpeciesYupSchema } from '../components/species/SpeciesForm';
import CollectionSurveyForm from '../view/collection/form/CollectionSurveyForm';

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
  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  if (!codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const surveyEditYupSchemas = GeneralInformationYupSchema()
    .concat(PurposeAndMethodologyYupSchema)
    .concat(ProprietaryDataYupSchema)
    .concat(SurveyFundingSourceFormYupSchema)
    .concat(
      yup.object({
        collections: yup.array(yup.object({ collection_id: yup.number().required('Collection is required') }))
      })
    )
    .concat(AgreementsYupSchema)
    .concat(SurveyParticipantsJobYupSchema)
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
          summary="Enter a name and the dates of your survey. Dates may span multiple fieldwork trips."
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
          title="Members"
          summary="Invite collaborators and assign them a role"
          component={<SurveyMembersForm roles={codesContext.codesDataLoader.data?.survey_roles ?? []} />}
        />

        <Divider />
        <HorizontalSplitFormComponent title="Collections" summary="Select collections to add the survey to.">
          <CollectionSurveyForm formikFieldName="collections" />
        </HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent title="Focal species" summary="Enter species that you targetted in the survey">
          <SpeciesForm />
        </HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent
          title="Objectives"
          summary="Describe your objectives and select the type of data collected."
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
          }
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="General Location"
          summary="Import, draw or select a feature from an existing layer to define your general areas of interest. This should broadly reflect your study area."
          component={<StudyAreaForm />}
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="Permits"
          summary="Enter any permits used in the survey"
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
          title="Agreements"
          summary="Confirm that you understand the SEDIS procedures and how they relate to data in the survey"
          component={<AgreementsForm />}></HorizontalSplitFormComponent>

        <Divider />
      </Stack>
    </Formik>
  );
};

export default EditSurveyForm;
