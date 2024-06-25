import { EditDialog } from 'components/dialog/EditDialog';
import { PeriodForm } from 'features/surveys/sampling-information/periods/create/PeriodForm';
import {
  ISurveySampleMethodPeriodData,
  SamplingSiteMethodPeriodYupSchema
} from 'features/surveys/sampling-information/periods/create/SamplingPeriodForm';
import { IGetSamplePeriodRecord } from 'interfaces/useSamplingSiteApi.interface';

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
export const EditSamplingPeriod = (props: IEditSamplingMethodPeriodProps) => {
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
