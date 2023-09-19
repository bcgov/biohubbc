import EditDialog from 'components/dialog/EditDialog';
import yup from 'utils/YupSchema';
import MethodForm, { IEditSurveySampleMethodData, ISurveySampleMethodData } from './MethodForm';

interface IEditSamplingMethodProps {
  open: boolean;
  initialData?: IEditSurveySampleMethodData;
  onSubmit: (data: ISurveySampleMethodData, index?: number) => void;
  onClose: () => void;
}

export const SamplingSiteMethodYupSchema = yup.object({
  survey_sample_method_id: yup.number().required(),
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

const EditSamplingMethod: React.FC<IEditSamplingMethodProps> = (props) => {
  const { open, initialData, onSubmit, onClose } = props;
  return (
    <>
      <EditDialog
        dialogTitle={'Edit Sampling Method'}
        dialogText={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec placerat nisl magna, et faucibus arcu condimentum sed.'
        }
        open={open}
        dialogLoading={false}
        component={{
          element: <MethodForm />,
          initialValues: {
            survey_sample_method_id: initialData?.survey_sample_method_id || null,
            survey_sample_site_id: initialData?.survey_sample_site_id || null,
            description: initialData?.description || '',
            periods: initialData?.periods || []
          },
          validationSchema: SamplingSiteMethodYupSchema
        }}
        dialogSaveButtonLabel="Update"
        onCancel={onClose}
        onSave={(formValues) => {
          onSubmit(formValues, initialData?.index);
        }}
      />
    </>
  );
};

export default EditSamplingMethod;
