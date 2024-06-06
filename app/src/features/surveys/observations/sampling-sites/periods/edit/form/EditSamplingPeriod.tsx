import EditDialog from 'components/dialog/EditDialog';
import { IGetSamplePeriodRecord } from 'interfaces/useSamplingSiteApi.interface';
import PeriodForm from '../../create/form/PeriodForm';
import { ISurveySampleMethodPeriodData, SamplingSiteMethodPeriodYupSchema } from '../../create/form/SamplingPeriodForm';

interface IEditSamplingMethodPeriodProps {
  open: boolean;
  initialData: IGetSamplePeriodRecord | ISurveySampleMethodPeriodData;
  onSubmit: (data: IGetSamplePeriodRecord | ISurveySampleMethodPeriodData, index?: number) => void;
  onClose: () => void;
}

/**
 * Returns a form for editing a sampling MethodPeriod
 *
 * @param props
 * @returns
 */
const EditSamplingPeriod = (props: IEditSamplingMethodPeriodProps) => {
  const { open, initialData, onSubmit, onClose } = props;

  return (
    <EditDialog
      dialogTitle={'Edit Sampling Period'}
      open={open}
      dialogLoading={false}
      component={{
        element: <PeriodForm />,
        initialValues: initialData,
        validationSchema: SamplingSiteMethodPeriodYupSchema
      }}
      dialogSaveButtonLabel="Update"
      onCancel={onClose}
      onSave={(formValues) => {
        onSubmit(formValues);
      }}
    />
  );
};

export default EditSamplingPeriod;
