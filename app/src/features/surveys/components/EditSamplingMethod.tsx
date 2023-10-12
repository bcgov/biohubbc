import EditDialog from 'components/dialog/EditDialog';
import yup from 'utils/YupSchema';
import MethodForm, {
  IEditSurveySampleMethodData,
  ISurveySampleMethodData,
  SurveySampleMethodDataInitialValues
} from './MethodForm';

interface IEditSamplingMethodProps {
  open: boolean;
  initialData?: IEditSurveySampleMethodData;
  onSubmit: (data: ISurveySampleMethodData, index?: number) => void;
  onClose: () => void;
}

export const SamplingSiteMethodYupSchema = yup.object({
  method_lookup_id: yup.number().required(),
  description: yup.string().required(),
  periods: yup
    .array(
      yup.object({
        start_date: yup.string().isValidDateString().required('Start date is required'),
        end_date: yup
          .string()
          .isValidDateString()
          .isEndDateSameOrAfterStartDate('start_date')
          .required('End date is required')
      })
    )
    .hasUniqueDateRanges('Periods cannot overlap', 'start_date', 'end_state')
    .min(1, 'At least one time period is required')
});

const EditSamplingMethod: React.FC<IEditSamplingMethodProps> = (props) => {
  const { open, initialData, onSubmit, onClose } = props;
  return (
    <>
      <EditDialog
        dialogTitle={'Edit Sampling Method'}
        open={open}
        dialogLoading={false}
        component={{
          element: <MethodForm />,
          initialValues: initialData || SurveySampleMethodDataInitialValues,
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
