import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { SamplingSiteMethodYupSchema } from 'features/surveys/sampling-information/methods/components/SamplingMethodForm';
import { SamplingSiteMethodPeriodYupSchema } from 'features/surveys/sampling-information/periods/SamplingPeriodFormContainer';
import CreateBlocksDialog from 'features/surveys/sampling-information/sites/blocks/create/CreateBlockDialog';
import { ICreateSampleSiteFormData } from 'features/surveys/sampling-information/sites/create/CreateSamplingSitePage';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';
import { useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import { v4 } from 'uuid';
import CreateSamplingSiteMapControlForm from './CreatingSamplingSiteMapControlForm';

export const CreateSamplingSiteFormYupSchema = yup.object({
  survey_sample_sites: yup
    .array(
      yup.object({
        name: yup.string().default(''),
        description: yup.string().default(''),
        geojson: yup.object({})
      })
    )
    .min(1, 'At least one sampling site location is required'),
  sample_methods: yup
    .array()
    .of(
      SamplingSiteMethodYupSchema.shape({
        sample_periods: yup
          .array()
          .of(SamplingSiteMethodPeriodYupSchema)
          .min(
            1,
            'At least one sampling period is required for each method, describing when exactly this method was done'
          )
      })
    ) // Ensure each item in the array conforms to SamplingSiteMethodYupSchema
    .min(1, 'At least one sampling method is required') // Add check for at least one item in the array
});

const initialBlockValues = {
  blocks: [
    {
      survey_block_id: null,
      name: '',
      uuid: v4(),
      // geojson: { ...feature, id: uuid },
      description: null
    }
  ]
};

interface ICreateSamplingSiteFormProps {
  isSubmitting: boolean;
}

/**
 * Renders sampling site create form.
 *
 * @param {ICreateSamplingSiteFormProps} props
 * @returns {*}
 */
const CreateSamplingSiteForm = (props: ICreateSamplingSiteFormProps) => {
  const { isSubmitting } = props;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const history = useHistory();
  const { submitForm } = useFormikContext<ICreateSampleSiteFormData>();

  const surveyContext = useSurveyContext();

  console.log
  return (
    <>
      <CreateBlocksDialog
        handleClose={() => {
          setIsDialogOpen(false);
        }}
        handleSave={() => {}}
        isDialogOpen={isDialogOpen}
        initialValues={initialBlockValues}
      />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <HorizontalSplitFormComponent title="Site Locations" summary="Import or draw the locations of sampling sites">
            <CreateSamplingSiteMapControlForm />
          </HorizontalSplitFormComponent>

          <Divider sx={{ my: 5 }} />

          <HorizontalSplitFormComponent title="Clusters" summary="Create clusters to group related sampling sites">
            <Button
              data-testid="cluster-add-button"
              variant="outlined"
              color="primary"
              title="Create Cluster"
              aria-label="Create Cluster"
              onClick={() => setIsDialogOpen(true)}
              startIcon={<Icon path={mdiPlus} size={1} />}>
              Add Cluster
            </Button>
          </HorizontalSplitFormComponent>

          <Divider sx={{ my: 5 }} />

          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              onClick={() => {
                submitForm();
              }}>
              Save and Exit
            </LoadingButton>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`);
              }}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default CreateSamplingSiteForm;
