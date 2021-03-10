import { render } from '@testing-library/react';
import { Formik } from 'formik';
import React from 'react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import ProjectIUCNForm, {
  IProjectIUCNForm,
  ProjectIUCNFormInitialValues,
  ProjectIUCNFormYupSchema
} from './ProjectIUCNForm';

const classifications: IMultiAutocompleteFieldOption[] = [
  {
    value: 'class_1',
    label: 'Class 1'
  },
  {
    value: 'class_2',
    label: 'Class 2'
  }
];

const subClassifications: IMultiAutocompleteFieldOption[] = [
  {
    value: 'subclass_1',
    label: 'Sub-class 1'
  },
  {
    value: 'subclass_2',
    label: 'Sub-class 2'
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
        {() => <ProjectIUCNForm classifications={classifications} subClassifications={subClassifications} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with existing details values', () => {
    const existingFormValues: IProjectIUCNForm = {
      classificationDetails: [
        {
          classification: 'class_1',
          subClassification1: 'subclass_1',
          subClassification2: 'subclass_2'
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
        {() => <ProjectIUCNForm classifications={classifications} subClassifications={subClassifications} />}
      </Formik>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
