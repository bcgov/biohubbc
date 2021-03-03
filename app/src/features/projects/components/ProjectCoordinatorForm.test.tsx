import { render } from '@testing-library/react';
import ProjectCoordinatorForm, {
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import { Formik } from 'formik';
import React from 'react';

const handleSaveAndNext = jest.fn();

const ProjectCoordinatorFilledValues = {
  first_name: 'Nerea',
  last_name: 'Oneal',
  email_address: 'quxu@mailinator.com',
  coordinator_agency: 'Qui anim qui laboris',
  share_contact_details: 'true'
};

describe('Project Coordinator Form', () => {
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
        {() => <ProjectCoordinatorForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly the filled component correctly', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectCoordinatorFilledValues}
        validationSchema={ProjectCoordinatorYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values, helper) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectCoordinatorForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
