import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import yup from 'utils/YupSchema';
import { ICreateSampleSiteFormData, IPostSurveyBlock } from '../../create/CreateSamplingSitePage.interface';
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
}

export const EditBlocksDialog = (props: IEditBlocksDialogProps) => {
  const { initialValues, isDialogOpen, handleClose } = props;

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
        element: <EditBlocksForm />
      }}
    />
  );
};

export default EditBlocksDialog;
