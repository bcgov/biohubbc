import EditDialog from 'components/dialog/EditDialog';
import {
  ISurveySampleMethodFormData,
  SamplingMethodForm,
  SamplingSiteMethodYupSchema,
  SurveySampleMethodDataInitialValues
} from '../components/SamplingMethodForm';

interface ICreateSamplingMethodFormDialogProps {
  open: boolean;
  onSubmit: (data: ISurveySampleMethodFormData) => void;
  onClose: () => void;
}

/**
 * Returns a form for creating a sampling method
 *
 * @returns
 */
export const CreateSamplingMethodFormDialog = (props: ICreateSamplingMethodFormDialogProps) => {
  const { open, onSubmit, onClose } = props;

  return (
    <EditDialog<ISurveySampleMethodFormData>
      dialogTitle={'Add Sampling Method'}
      open={open}
      dialogLoading={false}
      component={{
        element: <SamplingMethodForm />,
        initialValues: SurveySampleMethodDataInitialValues(),
        validationSchema: SamplingSiteMethodYupSchema
      }}
      dialogSaveButtonLabel="Add"
      onCancel={() => onClose()}
      onSave={(formValues) => {
        onSubmit(formValues);
      }}
    />
  );
};
