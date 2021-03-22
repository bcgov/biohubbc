import { render } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import ProjectIUCNForm, {
  IProjectIUCNForm,
  ProjectIUCNFormInitialValues,
  ProjectIUCNFormYupSchema,
  IIUCNSubClassification1Option,
  IIUCNSubClassification2Option
} from './ProjectIUCNForm';

const classifications: IMultiAutocompleteFieldOption[] = [
  {
    value: 1,
    label: 'Class 1'
  },
  {
    value: 2,
    label: 'Class 2'
  }
];

const subClassifications1: IIUCNSubClassification1Option[] = [
  {
    value: 3,
    iucn1_id: 1,
    label: 'A Sub-class 1'
  },
  {
    value: 4,
    iucn1_id: 2,
    label: 'A Sub-class 1 again'
  }
];

const subClassifications2: IIUCNSubClassification2Option[] = [
  {
    value: 5,
    iucn2_id: 3,
    label: 'A Sub-class 2'
  },
  {
    value: 6,
    iucn2_id: 4,
    label: 'A Sub-class 2 again'
  }
];

describe('ProjectIUCNForm', () => {
  it('renders correctly with default empty values', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProjectIUCNFormInitialValues}
        validationSchema={ProjectIUCNFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectIUCNForm
            classifications={classifications}
            subClassifications1={subClassifications1}
            subClassifications2={subClassifications2}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing details values', () => {
    const existingFormValues: IProjectIUCNForm = {
      classificationDetails: [
        {
          classification: 1,
          subClassification1: 3,
          subClassification2: 5
        }
      ]
    };

    const { asFragment } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectIUCNFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => (
          <ProjectIUCNForm
            classifications={classifications}
            subClassifications1={subClassifications1}
            subClassifications2={subClassifications2}
          />
        )}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
