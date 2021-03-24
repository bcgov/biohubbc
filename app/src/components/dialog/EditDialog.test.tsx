import { TextField } from '@material-ui/core';
import { fireEvent, render, waitFor } from '@testing-library/react';
import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import React from 'react';
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

  const { values, handleChange, handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        id="testfield"
        name="testField"
        label="Test Field"
        multiline
        required={true}
        rows={4}
        fullWidth
        variant="outlined"
        value={values.testField}
        onChange={handleChange}
      />
    </form>
  );
};

const handleOnSave = jest.fn();
const handleOnCancel = jest.fn();
const handleOnClose = jest.fn();

const renderContainer = (testFieldValue: string) => {
  return render(
    <div id="root">
      <EditDialog
        dialogTitle="This is dialog title"
        open={true}
        component={{
          element: <SampleFormikForm />,
          initialValues: { testField: testFieldValue },
          validationSchema: SampleFormikFormYupSchema
        }}
        onClose={handleOnClose}
        onCancel={handleOnCancel}
        onSave={handleOnSave}
      />
    </div>
  );
};

describe('EditDialog', () => {
  it('matches the snapshot with no error message', () => {
    const { baseElement } = renderContainer('this is a test');

    expect(baseElement).toMatchSnapshot();
  });

  it('calls the onSave prop when `Save Changes` button is clicked', async () => {
    const { findByText, getByLabelText } = renderContainer('initial value');

    const textField = await getByLabelText('Test Field', { exact: false });

    fireEvent.change(textField, { target: { value: 'updated value' } });

    const saveChangesButton = await findByText('Save Changes', { exact: false });

    fireEvent.click(saveChangesButton);

    await waitFor(() => {
      expect(handleOnSave).toHaveBeenCalledTimes(1);
      expect(handleOnSave).toHaveBeenCalledWith({
        testField: 'updated value'
      });
    });
  });

  it('calls the onCancel prop when `Cancel` button is clicked', async () => {
    const { findByText } = renderContainer('');

    const cancelButton = await findByText('Cancel', { exact: false });

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(handleOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});
