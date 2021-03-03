import { render } from '@testing-library/react';
import ProjectCoordinatorForm, {
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import { Formik } from 'formik';
import React from 'react';
import { act } from 'react-dom/test-utils';

const handleSaveAndNext = jest.fn();

const renderContainer = () => {
  return render(
    <Formik
      initialValues={ProjectCoordinatorInitialValues}
      validationSchema={ProjectCoordinatorYupSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={async (values, helper) => {
        handleSaveAndNext(values);
      }}>
      {(props) => (
        <ProjectCoordinatorForm />)}
    </Formik>
  );
};

describe('ProjectCoordinatorForm', () => {
  it('shows the first name input label', async () => {
    await act(async () => {
      const { findByText } = renderContainer();
      const PageTitle = await findByText('First Name');

      expect(PageTitle).toBeVisible();

      expect(handleSaveAndNext).not.toHaveBeenCalled();
    });
  });

  it('matches the snapshot', async () => {
    await act(async () => {
      const { baseElement } = renderContainer();

      expect(baseElement).toMatchSnapshot();
    });
  });
});
