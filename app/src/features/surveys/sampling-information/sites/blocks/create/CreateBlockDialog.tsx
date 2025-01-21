import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import yup from 'utils/YupSchema';
import { ICreateSampleSiteFormData, IPostSurveyBlock } from '../../create/CreateSamplingSitePage.interface';
import { BlockForm } from '../../create/form/CreateSamplingSiteForm.interface';
import EditBlocksForm from '../form/EditBlocksForm';

export const BlocksFormYupSchema = yup.object({
  survey_block_id: yup.number().required('Survey block ID is required'),
  name: yup.string().required('Name is required'),
  description: yup.string().nullable(),
  geojson: yup.object().nullable()
});

interface ICreateBlocksDialogProps {
  isDialogOpen: boolean;
  handleClose: () => void;
  handleSave: (data: IPostSurveyBlock) => void;
  initialValues: BlockForm;
}

export const CreateBlocksDialog = (props: ICreateBlocksDialogProps) => {
  const { initialValues, isDialogOpen, handleClose } = props;

  const formikProps = useFormikContext<ICreateSampleSiteFormData>();
  const { handleSubmit } = formikProps;

  return (
    <EditDialog
      dialogTitle="Create Clusters"
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

export default CreateBlocksDialog;
