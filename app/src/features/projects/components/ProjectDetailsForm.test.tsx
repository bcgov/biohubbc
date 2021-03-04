import { render } from '@testing-library/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import React from 'react';
import ProjectDetailsForm, {
  IProjectDetailsForm,
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from './ProjectDetailsForm';

const project_type: IMultiAutocompleteFieldOption[] = [
  {
    value: 'type_1',
    label: 'type 1'
  },
  {
    value: 'type_2',
    label: 'type 2'
  },
  {
    value: 'type_3',
    label: 'type 4'
  }
];

const project_activity: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'activity 1'
  },
  {
    value: 2,
    label: 'activity 2'
  },
  {
    value: 3,
    label: 'activity 4'
  }
];

const climate_change_initiative: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'initiative 1'
  },
  {
    value: 2,
    label: 'initiative 2'
  },
  {
    value: 3,
    label: 'initiative 3'
  }
];

describe('ProjectDetailsForm', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectDetailsFormInitialValues}
        validationSchema={ProjectDetailsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectDetailsForm project_type={project_type} project_activity={project_activity} climate_change_initiative={climate_change_initiative} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing details values', () => {
    const existingFormValues: IProjectDetailsForm = {
      project_name: 'name 1',
      project_type: 'type_1',
      project_activities: [2, 3],
      climate_change_initiatives: [1, 2],
      start_date: '2021-03-14',
      end_date: '2021-04-14'
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectDetailsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectDetailsForm project_type={project_type} project_activity={project_activity} climate_change_initiative={climate_change_initiative} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
