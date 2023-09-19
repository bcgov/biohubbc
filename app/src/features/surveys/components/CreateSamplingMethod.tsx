import EditDialog from 'components/dialog/EditDialog';
import { useState } from 'react';
import yup from 'utils/YupSchema';
import MethodForm, { ISurveySampleMethodData } from './MethodForm';

interface ISamplingMethodProps {
  open: boolean;
  onSubmit: (data: ISurveySampleMethodData) => void;
  onClose: () => void;
}

export const SamplingSiteMethodYupSchema = yup.object({
  method_lookup_id: yup.number().required(),
  description: yup.string().required(),
  periods: yup
    .array(
      yup.object({
        start_date: yup.string().isValidDateString().required(),
        end_date: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date').required()
      })
    )
    .min(1, 'At least 1 filled in time period is required for a Sampling Method')
});

const CreateSamplingMethod: React.FC<ISamplingMethodProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (values: ISurveySampleMethodData) => {
    setIsSubmitting(false);
    props.onSubmit(values);
  };

  return (
    <>
      <EditDialog
        dialogTitle={'Add Sampling Method'}
        dialogText={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec placerat nisl magna, et faucibus arcu condimentum sed.'
        }
        open={props.open}
        dialogLoading={isSubmitting}
        component={{
          element: <MethodForm />,
          initialValues: {
            survey_sample_method_id: null,
            survey_sample_site_id: null,
            method_lookup_id: null,
            description: '',
            periods: []
          },
          validationSchema: SamplingSiteMethodYupSchema
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

export default CreateSamplingMethod;
