import { render } from '@testing-library/react';
import React from 'react';
import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import { TextField } from '@material-ui/core';
import yup from 'utils/YupSchema';

export interface ISampleFormikForm {
  testField: string;
}

export const SampleFormikFormInitialValues: ISampleFormikForm = {
  testField: ''
};

export const SampleFormikFormYupSchema = yup.object().shape({
  testField: yup.string().max(3000, 'Cannot exceed 3000 characters').required('You must provide a test field for the project')
});

const SampleFormikForm = () => {
  const formikProps = useFormikContext<ISampleFormikForm>();

  const { values, handleChange, handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        id="testField"
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

describe('EditDialog', () => {
  it('matches the snapshot with no error message', () => {
    const { baseElement } = render(
      <div id="root">
        <EditDialog
          dialogTitle="This is dialog title"
          dialogText="This is dialog text"
          open={true}
          component={{
            element: <SampleFormikForm />,
            initialValues: SampleFormikFormInitialValues,
            validationSchema: SampleFormikFormYupSchema
          }}
          onClose={() => jest.fn()}
          onCancel={() => jest.fn()}
          onSave={() => jest.fn()}
        />
      </div>
    );

    expect(baseElement).toMatchSnapshot();
  });

  // it('matches the snapshot with an error message', () => {
  //   const { baseElement } = render(
  //     <div id="root">
  //       <EditDialog
  //         dialogTitle="This is dialog title"
  //         dialogText="This is dialog text"
  //         open={true}
  //         onClose={() => jest.fn()}
  //         onCancel={() => jest.fn()}
  //         onSave={() => jest.fn()}
  //       />
  //     </div>
  //   );

  //   expect(baseElement).toMatchSnapshot();
  // });
});
