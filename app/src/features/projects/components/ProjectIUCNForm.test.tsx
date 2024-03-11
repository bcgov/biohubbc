import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { Formik } from 'formik';
import { fireEvent, render, waitFor, within } from 'test-helpers/test-utils';
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

// TODO This component is deprecated and should be removedF
describe.skip('ProjectIUCNForm', () => {
  it('renders correctly with default empty values', () => {
    const { queryByLabelText } = render(
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
    expect(queryByLabelText('Classification')).toBe(null);
    expect(queryByLabelText('Sub-classification')).toBe(null);
  });

  it('renders correctly with existing details values', () => {
    const existingFormValues: IProjectIUCNForm = {
      iucn: {
        classificationDetails: [
          {
            classification: 1,
            subClassification1: 3,
            subClassification2: 5
          }
        ]
      }
    };

    const { getByLabelText, getByText, getAllByLabelText } = render(
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

    expect(getByLabelText('Classification')).toBeVisible();
    expect(getAllByLabelText('Sub-classification').length).toEqual(2);
    expect(getByText('Class 1')).toBeVisible();
    expect(getByText('A Sub-class 1', { exact: false })).toBeVisible();
    expect(getByText('A Sub-class 2', { exact: false })).toBeVisible();
  });

  it('changes fields on the IUCN menu items as expected', async () => {
    const { getByLabelText, getAllByRole, getByRole, queryByTestId, getByText, getAllByLabelText } = render(
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
      expect(getByLabelText('Classification')).toBeVisible();
      expect(getAllByLabelText('Sub-classification').length).toEqual(2);
      expect(getByText('Class 1')).toBeVisible();
      expect(getByText('A Sub-class 1', { exact: false })).toBeVisible();
      expect(getByText('A Sub-class 2', { exact: false })).toBeVisible();
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
      iucn: {
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
      }
    };

    const { getAllByText, getByText } = render(
      <Formik
        initialValues={existingFormValues}
        validationSchema={ProjectIUCNFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        initialErrors={{ iucn: { classificationDetails: 'Error is here' } }}
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

    expect(getAllByText('Class 1').length).toEqual(2);
    expect(getAllByText('A Sub-class 1').length).toEqual(2);
    expect(getAllByText('A Sub-class 2').length).toEqual(2);
    expect(getByText('Error is here')).toBeVisible();
  });

  it('deletes existing iucn classifications when delete icon is clicked', async () => {
    const existingFormValues: IProjectIUCNForm = {
      iucn: {
        classificationDetails: [
          {
            classification: 1,
            subClassification1: 3,
            subClassification2: 5
          }
        ]
      }
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
