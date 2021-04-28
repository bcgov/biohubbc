import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import React from 'react';
import ProjectIUCNForm, {
  IIUCNSubClassification1Option,
  IIUCNSubClassification2Option,
  IProjectIUCNForm,
  ProjectIUCNFormInitialValues,
  ProjectIUCNFormYupSchema
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

  it('changes fields on the IUCN menu items as expected', async () => {
    const { asFragment, getAllByRole, getByRole, queryByTestId, getByText } = render(
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

    expect(queryByTestId('iucn-classification-grid')).toBeNull();

    fireEvent.click(getByText('Add Classification'));

    await waitFor(() => {
      expect(queryByTestId('iucn-classification-grid')).toBeInTheDocument();
    });

    fireEvent.mouseDown(getAllByRole('button')[0]);
    const classificationListbox = within(getByRole('listbox'));
    fireEvent.click(classificationListbox.getByText(/Class 1/i));

    fireEvent.mouseDown(getAllByRole('button')[1]);
    const subClassification1Listbox = within(getByRole('listbox'));
    fireEvent.click(subClassification1Listbox.getByText(/A Sub-class 1/i));

    fireEvent.mouseDown(getAllByRole('button')[2]);
    const subClassification2Listbox = within(getByRole('listbox'));
    fireEvent.click(subClassification2Listbox.getByText(/A Sub-class 2/i));

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('adds an IUCN classification when the add button is clicked', async () => {
    const { getByText, queryByTestId } = render(
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

    expect(queryByTestId('iucn-classification-grid')).toBeNull();

    fireEvent.click(getByText('Add Classification'));

    await waitFor(() => {
      expect(queryByTestId('iucn-classification-grid')).toBeInTheDocument();
    });
  });

  it('renders correctly with error on the iucn classifications due to duplicates', () => {
    const existingFormValues: IProjectIUCNForm = {
      classificationDetails: [
        {
          classification: 1,
          subClassification1: 3,
          subClassification2: 5
        },
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
        initialErrors={{ classificationDetails: 'Error is here' }}
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

  it('renders correctly with error on the iucn classification individual fields', () => {
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
        initialErrors={{
          classificationDetails: [
            {
              classification: 'Error here',
              subClassification1: 'Error here too',
              subClassification2: 'Error again here too'
            }
          ]
        }}
        initialTouched={{
          classificationDetails: [{ classification: true, subClassification1: true, subClassification2: true }]
        }}
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

  it('deletes existing iucn classifications when delete icon is clicked', async () => {
    const existingFormValues: IProjectIUCNForm = {
      classificationDetails: [
        {
          classification: 1,
          subClassification1: 3,
          subClassification2: 5
        }
      ]
    };

    const { getByTestId, queryByTestId } = render(
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

    expect(queryByTestId('iucn-classification-grid')).toBeInTheDocument();

    fireEvent.click(getByTestId('delete-icon'));

    await waitFor(() => {
      expect(queryByTestId('iucn-classification-grid')).toBeNull();
    });
  });
});
