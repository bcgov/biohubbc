import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { HelpBanner } from 'components/help/HelpBanner';
import { BulletedList } from 'components/list/BulletedLst';
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
import { SurveyBlocksYupSchema } from '../components/locations/blocks/view/SurveyBlocksList';
import { SurveyBoundsYupSchema } from '../components/locations/bounds/view/SurveyBoundsList';
import SurveyAreaFormContainer from '../components/locations/SurveyAreaFormContainer';
import PurposeAndMethodologyForm, {
  PurposeAndMethodologyYupSchema
} from '../components/methodology/PurposeAndMethodologyForm';
import SurveyUserForm, { SurveyUserJobYupSchema } from '../components/participants/SurveyUserForm';
import { SurveySiteSelectionYupSchema } from '../components/sampling-strategy/SurveySiteSelectionForm';
import SpeciesForm, { SpeciesYupSchema } from '../components/species/SpeciesForm';

export interface IEditSurveyForm<
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
    .concat(SurveyBlocksYupSchema)
    .concat(SurveyBoundsYupSchema)
    .concat(SurveyFundingSourceFormYupSchema)
    .concat(AgreementsYupSchema)
    .concat(SurveyUserJobYupSchema)
    .concat(SurveySiteSelectionYupSchema)
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
                  return { value: item.id, label: item.name, subText: item.description };
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
              <Typography component="legend">Were any permits used in this survey?</Typography>
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
              <Typography component="legend">Do any funding agencies require this survey to be submitted?</Typography>
              <SurveyFundingSourceForm />
            </Box>
          }
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="Study Area"
          summary="Import or draw survey bounds, spatial blocks or grids, and sampling sites."
          sidePanel={
            <HelpBanner title="Help">
              <BulletedList>
                <ListItem>
                  <ListItemText>
                    <strong>Bounds</strong> are general areas that you typically want to extrapolate findings to, such
                    as watersheds or management areas.
                  </ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    <strong>Blocks</strong> are grid cells or other spatial components used to group or guide the
                    placement of sampling sites. If you sampled blocks using transects, you should upload your blocks
                    here and your transects later as sampling sites.
                  </ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    You can import multiple blocks or bounds from one file. If your file contains <i>name</i> and&nbsp;
                    <i>description</i> fields, those fields will be imported.
                  </ListItemText>
                </ListItem>
              </BulletedList>
            </HelpBanner>
          }
          component={<SurveyAreaFormContainer />}
        />

        <Divider />

        <HorizontalSplitFormComponent
          title="Purpose and Methodology"
          summary="Select the types of data collected and describe the survey objectives"
          component={
            <PurposeAndMethodologyForm
              intended_outcomes={
                codes.intended_outcomes.map((item) => {
                  return { value: item.id, label: item.name, subText: item.description };
                }) || []
              }
              type={
                codes?.type?.map((item) => {
                  return { value: item.id, label: item.name };
                }) || []
              }
            />
          }></HorizontalSplitFormComponent>

        <Divider />

        <HorizontalSplitFormComponent
          title="Survey Participants"
          summary="Specify people who participated in this survey. Only people who have signed up for SIMS can be selected."
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
          title="Proprietary Data"
          summary="Indicate whether any data is proprietary"
          component={
            <Box component="fieldset">
              <Typography component="legend">Is any data in this survey proprietary?</Typography>
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
