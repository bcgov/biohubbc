import EditDialog from 'components/dialog/EditDialog';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import yup from 'utils/YupSchema';

export interface ISampleFormikFormProps {
  testField: string;
}

export const SampleFormikFormYupSchema = yup.object().shape({
  testField: yup
    .string()
    .max(3000, 'Cannot exceed 3000 characters')
    .required('You must provide a test field for the project')
});

const SampleFormikForm = () => {
  const formikProps = useFormikContext<ISampleFormikFormProps>();

  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <CustomTextField name="testField" label="Test Field" other={{ multiline: true, required: true, rows: 4 }} />
    </form>
  );
};

const handleOnSave = vi.fn();
const handleOnCancel = vi.fn();

const renderContainer = ({
  testFieldValue,
  dialogError,
  open = true
}: {
  testFieldValue: string;
  dialogError?: string;
  open?: boolean;
}) => {
  return render(
    <div id="root">
      <EditDialog
        dialogTitle="This is dialog title"
        dialogError={dialogError || undefined}
        open={open}
        component={{
          element: <SampleFormikForm />,
          initialValues: { testField: testFieldValue },
          validationSchema: SampleFormikFormYupSchema
        }}
        onCancel={handleOnCancel}
        onSave={handleOnSave}
      />
    </div>
  );
};

describe('EditDialog', () => {
  it('calls the onSave prop when `Save Changes` button is clicked', async () => {
    const { findByTestId, getByLabelText } = renderContainer({ testFieldValue: 'initial value' });

    const textField = getByLabelText('Test Field', { exact: false });

    fireEvent.change(textField, { target: { value: 'updated value' } });

    const saveChangesButton = await findByTestId('edit-dialog-save');

    fireEvent.click(saveChangesButton);

    await waitFor(() => {
      expect(handleOnSave).toHaveBeenCalledTimes(1);
      expect(handleOnSave).toHaveBeenCalledWith({
        testField: 'updated value'
      });
    });
  });

  it('calls the onCancel prop when `Cancel` button is clicked', async () => {
    const { findByTestId } = renderContainer({ testFieldValue: 'this is a test' });

    const cancelButton = await findByTestId('edit-dialog-cancel');

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(handleOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});
