import { render, fireEvent, waitFor } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import ProjectPermitForm, {
  IProjectPermitForm,
  ProjectPermitFormInitialValues,
  ProjectPermitFormYupSchema
} from './ProjectPermitForm';

describe('ProjectPermitForm', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectPermitFormInitialValues}
        validationSchema={ProjectPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectPermitForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing permit values', () => {
    const existingFormValues: IProjectPermitForm = {
      permits: [
        {
          permit_number: '123',
          permit_type: 'Park Use Permit',
          sampling_conducted: 'true'
        },
        {
          permit_number: '3213123123',
          permit_type: 'Scientific Fish Collection Permit',
          sampling_conducted: 'false'
        }
      ]
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectPermitForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with errors on the permit_number, permit_type and sampling_conducted fields', () => {
    const existingFormValues: IProjectPermitForm = {
      permits: [
        {
          permit_number: '123',
          permit_type: 'Scientific Fish Collection Permit',
          sampling_conducted: 'true'
        }
      ]
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        initialErrors={{
          permits: [
            { permit_number: 'Error here', permit_type: 'Error here as well', sampling_conducted: 'Error here too' }
          ]
        }}
        initialTouched={{
          permits: [{ permit_number: true, permit_type: true, sampling_conducted: true }]
        }}
        onSubmit={async () => {}}>
        {() => <ProjectPermitForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with error on the permits field due to duplicates', () => {
    const existingFormValues: IProjectPermitForm = {
      permits: [
        {
          permit_number: '123',
          permit_type: 'Park Use Permit',
          sampling_conducted: 'true'
        },
        {
          permit_number: '123',
          permit_type: 'Scientific Fish Collection Permit',
          sampling_conducted: 'true'
        }
      ]
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        initialErrors={{ permits: 'Error is here' }}
        onSubmit={async () => {}}>
        {() => <ProjectPermitForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('deletes existing permits when delete icon is clicked', async () => {
    const existingFormValues: IProjectPermitForm = {
      permits: [
        {
          permit_number: '123',
          permit_type: 'Scientific Fish Collection Permit',
          sampling_conducted: 'true'
        }
      ]
    };

    const { getByTestId, queryByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectPermitFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectPermitForm />}
      </Formik>
    );

    expect(queryByText('Permit Number')).toBeInTheDocument();

    fireEvent.click(getByTestId('delete-icon'));

    await waitFor(() => {
      expect(queryByText('Permit Number')).toBeNull();
    });
  });
});
