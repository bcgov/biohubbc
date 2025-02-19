import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import yup from 'utils/YupSchema';
import EditBlocksForm from '../../../../blocks/form/EditBlocksForm';
import { ICreateSampleSiteFormData, IPostSurveySampleSite } from '../../../CreateSamplingSitePage.interface';
import { BlockForm } from '../../CreateSamplingSiteForm.interface';
import { SiteBlockAssignmentYupSchema } from '../../map/blocks/SamplingBlockForm';

export const BlocksYupSchema = yup.array(
  yup.object({
    survey_block_id: yup.number(),
    name: yup.string().required('Name is required'),
    description: yup.string().nullable(),
    geojson: yup.object().nullable()
  })
);

export const BlocksFormYupSchema = yup.object({
  blocks: BlocksYupSchema,
  site_block_assignments: SiteBlockAssignmentYupSchema
});

interface ICreateSamplingSiteBlockAssignmentForm {
  /**
   * Array of sampling sites that can be assigned to the new block
   */
  sites: Omit<IPostSurveySampleSite, 'geojson'>[];
  /**
   * Number of blocks, used for dynamically naming new blocks (eg. Block 1, Block 2)
   */
  blockCount: number;
}

/**
 * Returns form for creating new blocks and assigning sampling sites to those blocks
 *
 * @param {ICreateSamplingSiteBlockAssignmentForm} props
 * @returns
 */
export const CreateSamplingSiteBlockAssignmentForm = (props: ICreateSamplingSiteBlockAssignmentForm) => {
  const { sites, blockCount } = props;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { values, setFieldValue } = useFormikContext<ICreateSampleSiteFormData>();

  // Callback for when the dialog is closed
  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  // Callback for when the dialog is submitted, which updates the parent formik context
  const handleDialogSubmit = (data: BlockForm) => {
    setFieldValue('blocks', [...new Set([...values.blocks, ...data.blocks])]);
    setFieldValue('site_block_assignments', [
      ...new Set([...values.site_block_assignments, ...data.site_block_assignments])
    ]);

    // Close the dialog
    setIsDialogOpen(false);
  };

  return (
    <>
      {/* Dialog for adding blocks and block-site assignments */}
      <EditDialog
        dialogTitle="Create Clusters"
        open={isDialogOpen}
        onCancel={handleDialogClose}
        onSave={handleDialogSubmit}
        size="md"
        component={{
          initialValues: { blocks: values.blocks, site_block_assignments: values.site_block_assignments },
          validationSchema: BlocksFormYupSchema,
          element: <EditBlocksForm sites={sites} blockCount={blockCount} />
        }}
      />

      {/* Button for opening the dialog */}
      <Button
        data-testid="cluster-add-button"
        variant="outlined"
        color="primary"
        onClick={() => setIsDialogOpen(true)}
        startIcon={<Icon path={mdiPlus} size={1} />}>
        Add Cluster
      </Button>
    </>
  );
};
