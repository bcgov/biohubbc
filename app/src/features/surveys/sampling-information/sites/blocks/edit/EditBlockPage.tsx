import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import yup from 'utils/YupSchema';
import {
  ICreateSampleSiteFormData,
  IPostSurveyBlock,
  IPostSurveySampleSite
} from '../../create/CreateSamplingSitePage.interface';
import EditBlocksForm from '../form/EditBlocksForm';

export const BlocksFormYupSchema = yup.object({
  survey_block_id: yup.number().required('Survey block ID is required'),
  name: yup.string().required('Name is required'),
  description: yup.string().nullable(),
  geojson: yup.object().nullable()
});

interface IEditBlocksDialogProps {
  isDialogOpen: boolean;
  handleClose: () => void;
  handleSave: (data: IPostSurveyBlock) => void;
  initialValues: IPostSurveyBlock[];
  sites: Omit<IPostSurveySampleSite, 'geojson'>[];
  /**
   * The number of blocks, used for default names of new blocks
   */
  blockCount: number;
}

export const EditBlocksDialog = (props: IEditBlocksDialogProps) => {
  const { initialValues, isDialogOpen, handleClose, sites, blockCount } = props;

  const formikProps = useFormikContext<ICreateSampleSiteFormData>();
  const { handleSubmit } = formikProps;

  return (
    <EditDialog
      dialogTitle="Edit Clusters"
      open={isDialogOpen}
      onCancel={handleClose}
      onSave={() => handleSubmit()}
      size="md"
      component={{
        initialValues: initialValues,
        validationSchema: BlocksFormYupSchema,
        element: <EditBlocksForm sites={sites} blockCount={blockCount} />
      }}
    />
  );
};

export default EditBlocksDialog;
