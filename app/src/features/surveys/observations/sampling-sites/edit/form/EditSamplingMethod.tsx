import EditDialog from 'components/dialog/EditDialog';
import { IGetSampleMethodRecord } from 'interfaces/useSamplingSiteApi.interface';
import MethodForm, { ISurveySampleMethodData, SamplingSiteMethodYupSchema } from '../../create/form/MethodForm';

interface IEditSamplingMethodProps {
  open: boolean;
  initialData: IGetSampleMethodRecord | ISurveySampleMethodData;
  onSubmit: (data: IGetSampleMethodRecord | ISurveySampleMethodData, index?: number) => void;
  onClose: () => void;
}

/**
 * Returns a form for editing a sampling method
 *
 * @param props
 * @returns
 */
const EditSamplingMethod = (props: IEditSamplingMethodProps) => {
  const { open, initialData, onSubmit, onClose } = props;

  return (
    <EditDialog
      dialogTitle={'Edit Sampling Method'}
      open={open}
      dialogLoading={false}
      component={{
        element: <MethodForm />,
        initialValues: initialData,
        validationSchema: SamplingSiteMethodYupSchema
      }}
      dialogSaveButtonLabel="Update"
      onCancel={onClose}
      onSave={(formValues) => {
        onSubmit(formValues);
      }}
    />
  );
};

export default EditSamplingMethod;
