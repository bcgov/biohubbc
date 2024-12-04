import { EditDialog } from 'components/dialog/EditDialog';
import {
  ISurveySampleMethodPeriodData,
  SamplePeriodPeriodForm
} from 'features/surveys/sampling-information/periods/form/sites/periods/SamplePeriodPeriodForm';
import { IGetSamplePeriodRecord } from 'interfaces/useSamplingSiteApi.interface';
import { SamplingSiteMethodPeriodYupSchema } from '../../create/CreateSamplePeriodPage';

interface IEditSamplingPeriodFormDialogProps {
  open: boolean;
  initialData: IGetSamplePeriodRecord | ISurveySampleMethodPeriodData;
  onSubmit: (data: IGetSamplePeriodRecord | ISurveySampleMethodPeriodData, index?: number) => void;
  onClose: () => void;
}

/**
 * Renders a form for editing a sampling period.
 *
 * @param {IEditSamplingPeriodFormDialogProps} props
 * @returns {*}
 */
export const EditSamplingPeriodFormDialog = (props: IEditSamplingPeriodFormDialogProps) => {
  const { open, initialData, onSubmit, onClose } = props;

  return (
    <EditDialog
      dialogTitle={'Edit Sampling Period'}
      open={open}
      dialogLoading={false}
      component={{
        element: <SamplePeriodPeriodForm />,
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
