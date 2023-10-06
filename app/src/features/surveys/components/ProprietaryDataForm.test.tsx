import ProprietaryDataForm, {
  IProprietaryDataForm,
  ProprietaryDataYupSchema
} from 'features/surveys/components/ProprietaryDataForm';
import { Formik } from 'formik';
import { codes } from 'test-helpers/code-helpers';
import { fireEvent, render, screen, waitFor, within } from 'test-helpers/test-utils';

const handleSaveAndNext = jest.fn();

const proprietaryDataFilledValues: IProprietaryDataForm = {
  proprietor: {
    proprietary_data_category: 123,
    proprietor_name: 'name',
    first_nations_id: 0,
    survey_data_proprietary: 'true',
    category_rationale: 'rationale is cause it is true',
    disa_required: 'true'
  }
};

describe('Proprietary Data Form', () => {
  it('shows the first nations dropdown when data category is selected as First Nations and clears the proprietor name field when category goes from first nations to something else', async () => {
    const { getByText, getByRole, getByTestId } = render(
      <Formik
        initialValues={proprietaryDataFilledValues}
        validationSchema={ProprietaryDataYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => (
          <ProprietaryDataForm
            proprietary_data_category={
              codes?.proprietor_type?.map((item) => {
                return { value: item.id, label: item.name, is_first_nation: item.is_first_nation };
              }) || []
            }
            first_nations={
              codes?.first_nations?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
          />
        )}
      </Formik>
    );

    await waitFor(() => {
      expect(getByText('Proprietary Information')).toBeInTheDocument();
    });

    /*
    find proprietor category
    select first nations

    find proprietor name
    select first nations code

    should be displayed

    find proprietor category
    select non first nations

    find proprietor name
    should be blank
    */

    const autocomplete = getByTestId('proprietary_data_category');
    const acInput = within(autocomplete).getByRole('combobox');

    // open autocomplete listbox
    fireEvent.mouseDown(acInput);

    // items in autocomplete dropdown
    let acListBox = within(getByRole('listbox'));
    // select first nations
    fireEvent.click(acListBox.getByText(/First Nations Land/i));

    // select first nations code
    const firstNationsAutocomplete = getByTestId('first_nations_id');
    const firstNationsACInput = within(firstNationsAutocomplete).getByRole('combobox');
    fireEvent.mouseDown(firstNationsACInput);
    // items in autocomplete dropdown
    const firstNationsListBox = within(getByRole('listbox'));
    // select first nations
    fireEvent.click(firstNationsListBox.getByText(/First nations code/i));

    await waitFor(() => {
      expect(screen.getByDisplayValue('First nations code')).toBeInTheDocument();
    });

    // open autocomplete listbox
    fireEvent.mouseDown(acInput);

    // refetch listbox because it would have rendered a new instance of the listbox
    acListBox = within(getByRole('listbox'));

    fireEvent.click(acListBox.getByText(/Proprietor code 1/i));
    await waitFor(() => {
      expect(screen.queryByDisplayValue('First nations code')).toBeNull();
    });
  });
});
