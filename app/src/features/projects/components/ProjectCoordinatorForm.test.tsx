import renderer from 'react-test-renderer';
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
    const emptyComponent = renderer
      .create(
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
      )
      .toJSON();

    expect(emptyComponent).toMatchSnapshot();
  });

  it('renders correctly the filled component correctly', () => {
    const filledComponent = renderer
      .create(
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
      )
      .toJSON();

    expect(filledComponent).toMatchSnapshot();
  });
});
