import EditDialog from 'components/dialog/EditDialog';
import { IGetSampleMethodRecord } from 'interfaces/useSamplingSiteApi.interface';
import {
  ISurveySampleMethodData,
  SamplingMethodForm,
  SamplingSiteMethodYupSchema
} from '../components/SamplingMethodForm';

interface IEditSamplingMethodFormDialogProps {
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
export const EditSamplingMethodFormDialog = (props: IEditSamplingMethodFormDialogProps) => {
  const { open, initialData, onSubmit, onClose } = props;

  return (
    <EditDialog
      dialogTitle={'Edit Sampling Method'}
      open={open}
      dialogLoading={false}
      component={{
        element: <SamplingMethodForm />,
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
