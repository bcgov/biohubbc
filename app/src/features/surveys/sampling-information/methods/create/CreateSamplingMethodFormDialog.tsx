import EditDialog from 'components/dialog/EditDialog';
import {
  ISurveySampleMethodData,
  SamplingMethodForm,
  SamplingSiteMethodYupSchema,
  SurveySampleMethodDataInitialValues
} from '../components/SamplingMethodForm';

interface ICreateSamplingMethodFormDialogProps {
  open: boolean;
  onSubmit: (data: ISurveySampleMethodData) => void;
  onClose: () => void;
}

/**
 * Returns a form for creating a sampling method
 *
 * @returns
 */
export const CreateSamplingMethodFormDialog = (props: ICreateSamplingMethodFormDialogProps) => {
  const handleSubmit = (values: ISurveySampleMethodData) => {
    props.onSubmit(values);
  };

  return (
    <EditDialog
      dialogTitle={'Add Sampling Method'}
      open={props.open}
      dialogLoading={false}
      component={{
        element: <SamplingMethodForm />,
        initialValues: SurveySampleMethodDataInitialValues,
        validationSchema: SamplingSiteMethodYupSchema
      }}
      dialogSaveButtonLabel="Add"
      onCancel={() => props.onClose()}
      onSave={(formValues) => {
        handleSubmit(formValues);
      }}
    />
  );
};
