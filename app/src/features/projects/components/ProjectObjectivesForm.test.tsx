import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import ProjectObjectivesForm, {
  IProjectObjectivesForm,
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from './ProjectObjectivesForm';

describe('ProjectObjectivesForm', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectObjectivesFormInitialValues}
        validationSchema={ProjectObjectivesFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectObjectivesForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing objective/caveat values', () => {
    const existingFormValues: IProjectObjectivesForm = {
      objectives: 'a project objective',
      caveats: 'a nice little caveat'
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectObjectivesFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectObjectivesForm />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
