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
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import { v4 } from 'uuid';
import { ICreateSampleSiteFormData } from '../CreateSamplingSitePage.interface';
import {
  BlocksYupSchema,
  CreateSamplingSiteBlockAssignmentForm
} from './assignment/block/CreateSamplingSiteBlockAssignmentForm';
import { SiteBlockAssignmentYupSchema } from './map/blocks/SamplingBlockForm';
import CreateSamplingSiteMapControlForm from './map/CreatingSamplingSiteMapControlForm';

export const CreateSamplingSiteFormYupSchema = yup.object({
  survey_sample_sites: yup.array(
    yup.object({
      name: yup.string().required('Name is required'),
      description: yup.string().nullable(),
      geojson: yup.object().nullable()
    })
  ),
  blocks: BlocksYupSchema,
  site_block_assignments: SiteBlockAssignmentYupSchema
});

interface ICreateSamplingSiteFormProps {
  isSubmitting: boolean;
}

/**
 * Returns form for creating multiple new sampling sites, multiple new clusters,
 * and assigning both new/existing sites to new/existing clusters (many to many relationship).
 *
 * @param {ICreateSamplingSiteFormProps} props
 * @returns
 */
const CreateSamplingSiteForm = (props: ICreateSamplingSiteFormProps) => {
  const { isSubmitting } = props;

  const biohubApi = useBiohubApi();

  const { submitForm, values } = useFormikContext<ICreateSampleSiteFormData>();

  const surveyContext = useSurveyContext();
  const history = useHistory();

  // Get existing sampling sites to allow them to be added to new clusters
  const samplingSitesDataLoader = useDataLoader(() =>
    biohubApi.samplingSite.getSampleSites(surveyContext.projectId, surveyContext.surveyId)
  );

  // Get existing blocks to assign sampling sites to
  const surveyBlocksDataLoader = useDataLoader(() =>
    biohubApi.block.getSurveyBlocks(surveyContext.projectId, surveyContext.surveyId)
  );

  useEffect(() => {
    surveyBlocksDataLoader.load();
    samplingSitesDataLoader.load();
  }, [surveyBlocksDataLoader, samplingSitesDataLoader]);

  // IMPORTANT: Always include existing sites from the database AND new sites from the current formik context,
  // and add site_assignment_id/block_assignment_id as temporary unique keys for joining sites and blocks that don't yet have a primary key to reference
  const blocks = useMemo(
    () => [
      ...(surveyBlocksDataLoader.data?.blocks.map((block) => ({ ...block, block_assignment_id: v4() })) ?? []),
      ...values.blocks
    ],
    [surveyBlocksDataLoader.data, values.blocks]
  );

  // Memoize sites and combine existing and new (staged) sites
  const sites = useMemo(
    () => [
      ...(samplingSitesDataLoader.data?.sampleSites.map((site) => ({ ...site, site_assignment_id: v4() })) ?? []),
      ...values.survey_sample_sites
    ],
    [samplingSitesDataLoader.data, values.survey_sample_sites]
  );

  // Memoize sites and combine existing and new (staged) sites
  const stratums = useMemo(
    () => [
      ...(surveyContext.surveyDataLoader.data?.surveyData.site_selection.stratums.map((stratums) => ({
        ...stratums,
        stratums_assignment_id: v4()
      })) ?? []),
      ...values.stratums
    ],
    [surveyContext.surveyDataLoader.data, values.stratums]
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        {/* Map control for adding new sampling sites */}
        <HorizontalSplitFormComponent title="Site Locations" summary="Import or draw the locations of sampling sites">
          <CreateSamplingSiteMapControlForm blocks={blocks} stratums={stratums} siteCount={sites.length} />
        </HorizontalSplitFormComponent>

        <Divider sx={{ my: 5 }} />

        {/* Block control dialog for adding new blocks */}
        <HorizontalSplitFormComponent title="Clusters" summary="Create clusters to group related sampling sites">
          <CreateSamplingSiteBlockAssignmentForm sites={sites} blockCount={blocks.length} />
        </HorizontalSplitFormComponent>

        <Divider sx={{ my: 5 }} />

        {/* Block control dialog for adding new stratums */}
        <HorizontalSplitFormComponent title="Strata" summary="Create strata that sampling sites belong to">
          <CreateSamplingSiteBlockAssignmentForm sites={sites} blockCount={stratums.length} />
        </HorizontalSplitFormComponent>

        <Divider sx={{ my: 5 }} />

        {/* Save and exit button */}
        <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
          <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting} onClick={submitForm}>
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
  );
};

export default CreateSamplingSiteForm;
