import React from 'react';
//import { findByText as render } from '@testing-library/react';
import renderer from 'react-test-renderer';
//import { createMemoryHistory } from 'history';
import { Router } from 'react-router';
import ProjectCoordinatorForm from './ProjectCoordinatorForm';
import ProjectCoordinatorInitialValues from './ProjectCoordinatorForm';
import ProjectCoordinatorYupSchema from './ProjectCoordinatorForm';

<Formik
  initialValues={ProjectCoordinatorInitialValues}
  validationSchema={ProjectCoordinatorYupSchema}
  validateOnBlur={true}
  validateOnChange={false}
   onSubmit={async (values, helper) => {
     //handleSaveAndNext(values);
   }}>
  {(props) => <ProjectCoordinatorForm />}
</Formik>

const renderContainer = () => {
  return render(
    <Router history={history}>
      <ProjectCoordinatorForm />,
    </Router>
  );
};

const history = createMemoryHistory();

describe('ProjectPage.test', () => {
  it('renders blank project page', () => {
    const tree = renderer.create(
      <Router history={history}>
        <ProjectCoordinatorForm />
      </Router>
    );


    history.push('/home');
    history.push('/projects/create');
    const { findByText} = renderContainer();
    const FindFirstName = await findByText('first name');
    expect(FindFirstName).toBeVisible();

    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('renders project page with mock data', () => {
    const tree = renderer.create(
      <Router history={history}>
        <ProjectCoordinatorForm />
      </Router>
    );

    // TODO test snapshot of a populated project page

    const AreYouSureTitle = await findByText('Cancel Create Project');

    expect(tree).toBeDefined();
  });
});
