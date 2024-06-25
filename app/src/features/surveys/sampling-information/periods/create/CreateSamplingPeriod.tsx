import EditDialog from 'components/dialog/EditDialog';
import { PeriodForm } from 'features/surveys/sampling-information/periods/create/PeriodForm';
import {
  ISurveySampleMethodPeriodData,
  SamplingSiteMethodPeriodYupSchema,
  SurveySampleMethodPeriodArrayItemInitialValues
} from 'features/surveys/sampling-information/periods/create/SamplingPeriodForm';

interface ISamplingPeriodProps {
  open: boolean;
  onSubmit: (data: ISurveySampleMethodPeriodData) => void;
  onClose: () => void;
}

/**
 * Returns a form for creating a sampling Period
 *
 * @returns
 */
export const CreateSamplingPeriod = (props: ISamplingPeriodProps) => {
  const handleSubmit = (values: ISurveySampleMethodPeriodData) => {
    props.onSubmit(values);
  };

  return (
    <>
      <EditDialog
        dialogTitle={'Add Sampling Period'}
        open={props.open}
        dialogLoading={false}
        component={{
          element: <PeriodForm />,
          initialValues: SurveySampleMethodPeriodArrayItemInitialValues,
          validationSchema: SamplingSiteMethodPeriodYupSchema
        }}
        dialogSaveButtonLabel="Add"
        onCancel={() => props.onClose()}
        onSave={(formValues) => {
          handleSubmit(formValues);
        }}
      />
    </>
  );
};
