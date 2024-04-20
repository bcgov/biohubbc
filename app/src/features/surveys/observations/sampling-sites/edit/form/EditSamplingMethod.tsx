import EditDialog from 'components/dialog/EditDialog';
import { IGetSampleMethodRecord } from 'interfaces/useSamplingSiteApi.interface';
import { ISurveySampleMethodData, SamplingSiteMethodYupSchema } from '../../create/form/MethodCreateForm';
import MethodEditForm from './MethodEditForm';

interface IEditSamplingMethodProps {
  open: boolean;
  initialData: IGetSampleMethodRecord | ISurveySampleMethodData;
  onSubmit: (data: IGetSampleMethodRecord | ISurveySampleMethodData, index?: number) => void;
  onClose: () => void;
}

const EditSamplingMethod: React.FC<IEditSamplingMethodProps> = (props) => {
  const { open, initialData, onSubmit, onClose } = props;

  return (
    <>
      <EditDialog
        dialogTitle={'Edit Sampling Method'}
        open={open}
        dialogLoading={false}
        component={{
          element: <MethodEditForm />,
          initialValues: initialData,
          validationSchema: SamplingSiteMethodYupSchema
        }}
        dialogSaveButtonLabel="Update"
        onCancel={onClose}
        onSave={(formValues) => {
          onSubmit(formValues);
        }}
      />
    </>
  );
};

export default EditSamplingMethod;
