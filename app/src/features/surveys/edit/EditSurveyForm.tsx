import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { CodesContext } from 'contexts/codesContext';

import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SurveyPermitForm, { ISurveyPermitForm } from 'features/surveys/components/permit/SurveyPermitForm';
import { SurveyPartnershipsFormYupSchema } from 'features/surveys/view/components/SurveyPartnershipsForm';
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
import PurposeAndMethodologyForm, {
  PurposeAndMethodologyYupSchema
} from '../components/methodology/PurposeAndMethodologyForm';
import { SurveyParticipantsJobYupSchema } from '../components/participants/SurveyUserForm';
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
      <Box>
        <FormikErrorSnackbar />
        <Paper variant="outlined" sx={{ bgcolor: grey[50], p: 3, py: 5, mb: 2 }}>
          <HorizontalSplitFormComponent
            title="Collections"
            summary="Organize related surveys by adding to collections"
            component={<CollectionSurveyForm formikFieldName="collections" />}
          />
        </Paper>

        <Stack gap={5} p={3}>
          <HorizontalSplitFormComponent
            title="General"
            summary="Enter the name, dates, and objectives of your survey"
            component={<GeneralInformationForm />}
          />

          <Divider />

          <HorizontalSplitFormComponent title="Species" summary="Select species that you targetted in the survey">
            <SpeciesForm />
          </HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Data"
            summary="Enter information about the data you collected"
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
            title="Area"
            summary="Enter your general area of interest by importing a spatial file, drawing, or selecting from a map layer"
            component={<StudyAreaForm />}
          />

          <Divider />

          <HorizontalSplitFormComponent
            title="Funding"
            summary="If applicable, select funding sources that contributed to the survey">
            <Typography component="legend">Do any funding agencies require this survey to be submitted? *</Typography>
            <SurveyFundingSourceForm />
          </HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent title="Permits" summary="If applicable, select permits that enabled the survey">
            <Typography component="legend">
              Do any permitting agencies require this survey to be submitted? *
            </Typography>
            <SurveyPermitForm />
          </HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Agreements"
            summary="Acknowledge your responsibilities under the SEDIS policy and Freedom of Information requirements."
            component={<AgreementsForm />}
          />

          <Divider />
        </Stack>
      </Box>
    </Formik>
  );
};

export default EditSurveyForm;
