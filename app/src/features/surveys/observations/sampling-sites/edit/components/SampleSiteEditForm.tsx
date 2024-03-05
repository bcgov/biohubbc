import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { Container } from '@mui/system';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { SurveyContext } from 'contexts/surveyContext';
import { ISurveySampleMethodData, SamplingSiteMethodYupSchema } from 'features/surveys/components/MethodForm';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { IGetSampleBlockDetails, IGetSampleStratumDetails } from 'interfaces/useSurveyApi.interface';
import { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import yup from 'utils/YupSchema';
import SamplingSiteGroupingsForm from '../../components/SamplingSiteGroupingsForm';
import SampleMethodEditForm from './SampleMethodEditForm';
import SampleSiteGeneralInformationForm from './SampleSiteGeneralInformationForm';
import SurveySamplingSiteEditForm from './SurveySampleSiteEditForm';

export interface IEditSamplingSiteRequest {
  sampleSite: {
    name: string;
    description: string;
    survey_id: number;
    survey_sample_sites: Feature[]; // extracted list from shape files (used for formik loading)
    geojson?: Feature; // geojson object from map (used for sending to api)
    methods: ISurveySampleMethodData[];
    blocks: IGetSampleBlockDetails[];
    stratums: IGetSampleStratumDetails[];
  };
}

export interface ISampleSiteEditFormProps {
  isSubmitting: boolean;
}

export const samplingSiteYupSchema = yup.object({
  sampleSite: yup.object({
    name: yup.string().default('').max(50, 'Maximum 50 characters.'),
    description: yup.string().default('').nullable(),
    survey_sample_sites: yup
      .array(yup.object())
      .min(1, 'At least one sampling site location is required')
      .max(1, 'Only one location is permitted per sampling site'),
    methods: yup
      .array(yup.object().concat(SamplingSiteMethodYupSchema))
      .min(1, 'At least one sampling method is required')
  })
});

const SampleSiteEditForm = (props: ISampleSiteEditFormProps) => {
  const surveyContext = useContext(SurveyContext);
  const { submitForm } = useFormikContext<IEditSamplingSiteRequest>();

  return (
    <>
      <Container maxWidth="xl">
        <Box py={3}>
          <Paper
            elevation={0}
            sx={{
              p: 5,
              '& hr': {
                height: '1px',
                mt: 5,
                mb: 5
              }
            }}>
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
              component={<SampleMethodEditForm name={'sampleSite.methods'} />}></HorizontalSplitFormComponent>

            <Divider />

            <HorizontalSplitFormComponent
              title="Site Groups"
              summary="Enter the stratum or group to which this site belongs."
              component={<SamplingSiteGroupingsForm />}></HorizontalSplitFormComponent>

            <Divider />

            <Box display="flex" justifyContent="flex-end">
              <Box
                sx={{
                  '& [class^="MuiButton"]': {
                    minWidth: '6rem'
                  }
                }}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  loading={props.isSubmitting}
                  onClick={() => submitForm()}>
                  Save and Exit
                </LoadingButton>
                <Button
                  variant="outlined"
                  color="primary"
                  component={RouterLink}
                  to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`}
                  sx={{
                    ml: 1
                  }}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default SampleSiteEditForm;
