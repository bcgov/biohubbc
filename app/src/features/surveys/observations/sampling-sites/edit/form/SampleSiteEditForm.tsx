import { LoadingButton } from '@mui/lab';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { SurveyContext } from 'contexts/surveyContext';
import { SamplingSiteMethodYupSchema } from 'features/surveys/components/MethodForm';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IEditSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { useContext, useEffect } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import yup from 'utils/YupSchema';
import SurveySamplingSiteEditForm from '../../components/map/SurveySampleSiteEditForm';
import SamplingSiteGroupingsForm from '../../components/SamplingSiteGroupingsForm';
import SampleMethodEditForm from './SampleMethodEditForm';
import SampleSiteGeneralInformationForm from './SampleSiteGeneralInformationForm';

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
  const { submitForm, setValues } = useFormikContext<IEditSamplingSiteRequest>();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveySampleSiteId = Number(urlParams['survey_sample_site_id']);

  const biohubApi = useBiohubApi();

  const projectId = surveyContext.projectId;
  const surveyId = surveyContext.surveyId;

  const samplingSiteDataLoader = useDataLoader(() =>
    biohubApi.samplingSite.getSampleSiteById(projectId, surveyId, surveySampleSiteId)
  );

  if (!samplingSiteDataLoader.data) {
    samplingSiteDataLoader.load();
  }

  useEffect(() => {
    if (samplingSiteDataLoader.data) {
      const data = samplingSiteDataLoader.data;

      const formInitialValues: IEditSamplingSiteRequest = {
        sampleSite: {
          name: data.name,
          description: data.description,
          survey_id: data.survey_id,
          survey_sample_sites: [data.geojson as unknown as Feature],
          methods:
            data.sample_methods?.map((item) => {
              return {
                survey_sample_method_id: item.survey_sample_method_id,
                survey_sample_site_id: item.survey_sample_site_id,
                method_lookup_id: item.method_lookup_id,
                method_response_metric_id: item.method_response_metric_id,
                description: item.description,
                periods: item.sample_periods || []
              };
            }) || [],
          blocks: data.sample_blocks?.map((block) => block.survey_sample_block_id) || [],
          stratums: data.sample_stratums?.map((stratum) => stratum.survey_sample_stratum_id) || []
        }
      };

      setValues(formInitialValues);
    }
  }, [samplingSiteDataLoader]);

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
            component={<SampleMethodEditForm name={'sampleSite.methods'} />}></HorizontalSplitFormComponent>

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
              onClick={() => submitForm()}>
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
