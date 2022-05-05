import { render } from '@testing-library/react';
import ProjectCoordinatorForm, {
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import { Formik } from 'formik';
import React from 'react';

const handleSaveAndNext = jest.fn();

const agencies = ['Agency 1', 'Agency 2', 'Agency 3'];

const projectCoordinatorFilledValues = {
  first_name: 'Nerea',
  last_name: 'Oneal',
  email_address: 'quxu@mailinator.com',
  coordinator_agency: 'Agency 3',
  share_contact_details: 'true'
};

describe('Project Contact Form', () => {
  it('renders correctly the empty component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectCoordinatorInitialValues}
        validationSchema={ProjectCoordinatorYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectCoordinatorForm coordinator_agency={[]} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly the filled component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={projectCoordinatorFilledValues}
        validationSchema={ProjectCoordinatorYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values, helper) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectCoordinatorForm coordinator_agency={agencies} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
