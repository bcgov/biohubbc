import { render } from '@testing-library/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import React from 'react';
import ProjectPartnershipsForm, {
  IProjectPartnershipsForm,
  ProjectPartnershipsFormInitialValues,
  ProjectPartnershipsFormYupSchema
} from './ProjectPartnershipsForm';

const first_nations: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'nation 1'
  },
  {
    value: 2,
    label: 'nation 2'
  }
];

const stakeholder_partnerships: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'partner 1'
  },
  {
    value: 2,
    label: 'partner 2'
  }
];

describe('ProjectPartnershipsForm', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectPartnershipsFormInitialValues}
        validationSchema={ProjectPartnershipsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectPartnershipsForm first_nations={first_nations} stakeholder_partnerships={stakeholder_partnerships} />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing funding values', () => {
    const existingFormValues: IProjectPartnershipsForm = {
      indigenous_partnerships: [1, 2],
      stakeholder_partnerships: ['partner 1']
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectPartnershipsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectPartnershipsForm first_nations={first_nations} stakeholder_partnerships={stakeholder_partnerships} />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
