import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import { TextField } from '@material-ui/core';
import yup from 'utils/YupSchema';
import { createMemoryHistory } from 'history';

import { Router } from 'react-router';

export interface ISampleFormikFormProps {
  testField: string;
}

export const SampleFormikFormYupSchema = yup.object().shape({
  testField: yup
    .string()
    .max(3000, 'Cannot exceed 3000 characters')
    .required('You must provide a test field for the project')
});

const history = createMemoryHistory();

const SampleFormikForm = () => {
  const formikProps = useFormikContext<ISampleFormikFormProps>();
  console.log(formikProps);

  const { values, handleChange, handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        id="testfield"
        name="testfield"
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

const handleOnSave = (values: ISampleFormikFormProps) => {
  //history.push('/path/after/save');
};

const renderContainer = (testFieldValue: string) => {
  return render(
    <Router history={history}>
      <div id="root">
        <EditDialog
          dialogTitle="This is dialog title"
          open={true}
          component={{
            element: <SampleFormikForm />,
            initialValues: {testField: {testFieldValue}},
            validationSchema: SampleFormikFormYupSchema
          }}
          onClose={() => jest.fn()}
          onCancel={() => jest.fn()}
          onSave={handleOnSave}
        />
      </div>
    </Router>
  );
};

describe('EditDialog', () => {
  it('matches the snapshot with no error message', () => {
    const { baseElement } = renderContainer('this is a test');

    expect(baseElement).toMatchSnapshot();
  });

  it('confirms history remains the same after user clicks `Save Changes`', async () => {
    history.push('/path/edit');

    const { findByText } = renderContainer('initial value');

    const saveChangesButton = await findByText('Save changes', { exact: false });

    fireEvent.click(saveChangesButton);

    //await waitFor(() => expect(handleOnSave).toHaveBeenCalledTimes(1));

    expect(history.location.pathname).toEqual('/path/edit');
  });

  it('confirms the text field value changes after user updates the value', async () => {
    const { getByLabelText } = renderContainer('initial value');

    const textField = await getByLabelText('Test Field', { exact: false });

    fireEvent.change(textField, { target: { value: 'updated value'}});
  });
});




// describe('EditModal', () => {


//   it('renders the editmodal correctly', async () => {

//     const { asFragment } = renderContainer();

//     expect(asFragment()).toMatchSnapshot();

//   });
// });

