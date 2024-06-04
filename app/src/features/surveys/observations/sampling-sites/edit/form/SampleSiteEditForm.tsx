import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { SurveyContext } from 'contexts/surveyContext';
import { SamplingSiteMethodYupSchema } from 'features/surveys/observations/sampling-sites/create/form/MethodForm';
import { useFormikContext } from 'formik';
import { IGetSampleLocationDetailsForUpdate } from 'interfaces/useSamplingSiteApi.interface';
import { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import yup from 'utils/YupSchema';
import SurveySamplingSiteEditForm from '../../components/map/SurveySampleSiteEditForm';
import SamplingSiteGroupingsForm from '../../components/SamplingSiteGroupingsForm';
import SampleMethodEditForm from './SampleMethodEditForm';
import SampleSiteGeneralInformationForm from './SampleSiteGeneralInformationForm';

export interface ISampleSiteEditFormProps {
  isSubmitting: boolean;
}

export const samplingSiteYupSchema = yup.object({
  name: yup.string().default('').min(1, 'Minimum 1 character.').max(50, 'Maximum 50 characters.'),
  description: yup.string().default('').nullable(),
  survey_sample_sites: yup
    .array(yup.object())
    .min(1, 'At least one sampling site location is required')
    .max(1, 'Only one location is permitted per sampling site'),
  sample_methods: yup
    .array(yup.object().concat(SamplingSiteMethodYupSchema))
    .min(1, 'At least one sampling method is required')
});

/**
 * Returns a form for editing a sampling site
 *
 * @param props
 * @returns
 */
const SampleSiteEditForm = (props: ISampleSiteEditFormProps) => {
  const surveyContext = useContext(SurveyContext);
  const { submitForm, errors } = useFormikContext<IGetSampleLocationDetailsForUpdate>();

  console.log(errors)

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <Stack gap={5}>
          <HorizontalSplitFormComponent
            title="General Information"
            summary="Specify the name and description for this sampling site"
            component={<SampleSiteGeneralInformationForm />}></HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Site Location"
            summary="Import or draw sampling site locations used for this survey."
            component={<SurveySamplingSiteEditForm />}></HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Sampling Methods"
            summary="Specify sampling methods that were used to collect data."
            component={<SampleMethodEditForm name={'sample_methods'} />}></HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Site Groups"
            summary="Enter the stratum or group to which this site belongs."
            component={<SamplingSiteGroupingsForm />}></HorizontalSplitFormComponent>

          <Divider />

          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={props.isSubmitting}
              onClick={() => {
                submitForm();
              }}>
              Save and Exit
            </LoadingButton>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default SampleSiteEditForm;
