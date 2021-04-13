import { render } from '@testing-library/react';
import {
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import {
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from 'features/projects/components/ProjectDetailsForm';
import {
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from 'features/projects/components/ProjectFundingForm';
import { ProjectIUCNFormInitialValues, ProjectIUCNFormYupSchema } from 'features/projects/components/ProjectIUCNForm';
import {
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from 'features/projects/components/ProjectLocationForm';
import {
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from 'features/projects/components/ProjectObjectivesForm';
import {
  ProjectPartnershipsFormInitialValues,
  ProjectPartnershipsFormYupSchema
} from 'features/projects/components/ProjectPartnershipsForm';
import {
  ProjectSpeciesFormInitialValues,
  ProjectSpeciesFormYupSchema
} from 'features/projects/components/ProjectSpeciesForm';
import { Formik } from 'formik';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';
import ProjectStepComponents from './ProjectStepComponents';

const handleSaveAndNext = jest.fn();

describe('ProjectStepComponents', () => {
  it('renders the project coordinator', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectCoordinatorInitialValues}
        validationSchema={ProjectCoordinatorYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => <ProjectStepComponents component="ProjectCoordinator" codes={codes} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the project details with the codes values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectDetailsFormInitialValues}
        validationSchema={ProjectDetailsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectStepComponents component="ProjectDetails" codes={codes} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the project details without the codes values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectDetailsFormInitialValues}
        validationSchema={ProjectDetailsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectStepComponents
            component="ProjectDetails"
            codes={{ ...codes, project_type: (null as unknown) as any }}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the project objectives', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectObjectivesFormInitialValues}
        validationSchema={ProjectObjectivesFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectStepComponents component="ProjectObjectives" codes={codes} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the project species', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectSpeciesFormInitialValues}
        validationSchema={ProjectSpeciesFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectStepComponents component="ProjectSpecies" codes={codes} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the project IUCN', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectIUCNFormInitialValues}
        validationSchema={ProjectIUCNFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectStepComponents component="ProjectIUCN" codes={codes} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the project funding', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectFundingFormInitialValues}
        validationSchema={ProjectFundingFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectStepComponents component="ProjectFunding" codes={codes} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the project partnerships', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectPartnershipsFormInitialValues}
        validationSchema={ProjectPartnershipsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectStepComponents component="ProjectPartnerships" codes={codes} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the project location', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectLocationFormInitialValues}
        validationSchema={ProjectLocationFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectStepComponents component="ProjectLocation" codes={codes} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
