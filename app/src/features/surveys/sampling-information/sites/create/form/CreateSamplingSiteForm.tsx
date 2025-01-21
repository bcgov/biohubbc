import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import CreateBlocksDialog, { BlocksFormYupSchema } from '../../blocks/create/CreateBlockDialog';
import { ICreateSampleSiteFormData } from '../CreateSamplingSitePage.interface';
import { BlockForm } from './CreateSamplingSiteForm.interface';
import CreateSamplingSiteMapControlForm from './map/CreatingSamplingSiteMapControlForm';

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
  blocks: BlocksFormYupSchema
});

const initialBlocksValues: BlockForm = {
  blocks: [],
  site_block_assignments: []
}

interface ICreateSamplingSiteFormProps {
  isSubmitting: boolean;
}

const CreateSamplingSiteForm = ({ isSubmitting }: ICreateSamplingSiteFormProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const biohubApi = useBiohubApi();
  const { submitForm } = useFormikContext<ICreateSampleSiteFormData>();
  const surveyContext = useSurveyContext();
  const history = useHistory();

  const samplingBlocksDataLoader = useDataLoader(() =>
    biohubApi.block.getSurveyBlocks(surveyContext.projectId, surveyContext.surveyId)
  );

  useEffect(() => {
    samplingBlocksDataLoader.load();
  }, [samplingBlocksDataLoader]);

  return (
    <>
      <CreateBlocksDialog
        handleClose={() => setIsDialogOpen(false)}
        handleSave={() => {}}
        isDialogOpen={isDialogOpen}
        initialValues={initialBlocksValues}
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <HorizontalSplitFormComponent title="Site Locations" summary="Import or draw the locations of sampling sites">
            <CreateSamplingSiteMapControlForm blocks={samplingBlocksDataLoader.data?.blocks ?? []} />
          </HorizontalSplitFormComponent>

          <Divider sx={{ my: 5 }} />

          <HorizontalSplitFormComponent title="Clusters" summary="Create clusters to group related sampling sites">
            <Button
              data-testid="cluster-add-button"
              variant="outlined"
              color="primary"
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
              onClick={submitForm}>
              Save and Exit
            </LoadingButton>
            <Button
              variant="outlined"
              color="primary"
              onClick={() =>
                history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`)
              }>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};

export default CreateSamplingSiteForm;
