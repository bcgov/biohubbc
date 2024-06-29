import { EditDialog } from 'components/dialog/EditDialog';
import { SamplingPeriodForm } from 'features/surveys/sampling-information/periods/components/SamplingPeriodForm';
import {
  ISurveySampleMethodPeriodData,
  SamplingSiteMethodPeriodYupSchema
} from 'features/surveys/sampling-information/periods/SamplingPeriodFormContainer';
import { IGetSamplePeriodRecord } from 'interfaces/useSamplingSiteApi.interface';

interface IEditSamplingPeriodFormDialogProps {
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
export const EditSamplingPeriodFormDialog = (props: IEditSamplingPeriodFormDialogProps) => {
  const { open, initialData, onSubmit, onClose } = props;

  return (
    <EditDialog
      dialogTitle={'Edit Sampling Period'}
      open={open}
      dialogLoading={false}
      component={{
        element: <SamplingPeriodForm />,
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
