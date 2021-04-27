import { render } from '@testing-library/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import React from 'react';
import ProjectSpeciesForm, {
  IProjectSpeciesForm,
  ProjectSpeciesFormInitialValues,
  ProjectSpeciesFormYupSchema
} from './ProjectSpeciesForm';

const species: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'species 1'
  },
  {
    value: 2,
    label: 'species 2'
  }
];

describe('ProjectSpeciesForm', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectSpeciesFormInitialValues}
        validationSchema={ProjectSpeciesFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectSpeciesForm species={species} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing species values', () => {
    const existingFormValues: IProjectSpeciesForm = {
      focal_species: ['species 1'],
      ancillary_species: ['species 2']
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectSpeciesFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <ProjectSpeciesForm species={species} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
