import { fireEvent, render, waitFor, within, screen } from '@testing-library/react';
import { Formik } from 'formik';
import ProprietaryDataForm, {
  ProprietaryDataInitialValues,
  ProprietaryDataYupSchema
} from 'features/surveys/components/ProprietaryDataForm';
import React from 'react';
import { codes } from 'test-helpers/code-helpers';

const handleSaveAndNext = jest.fn();

const proprietaryDataFilledValues = {
  proprietary_data_category: 'Proprietor code 1',
  proprietor_name: 'name',
  category_rational: 'rational is cause it is true',
  survey_data_proprietary: 'true',
  data_sharing_agreement_required: 'true'
};

describe('Proprietary Data Form', () => {
  it('renders correctly the empty component correctly when survey data is not proprietary', () => {
    const { asFragment } = render(
      <Formik
        initialValues={ProprietaryDataInitialValues}
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
                return { value: item.id, label: item.name };
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

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly the filled component correctly when survey data is proprietary', () => {
    const { asFragment } = render(
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
                return { value: item.id, label: item.name };
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

    expect(asFragment()).toMatchSnapshot();
  });

  it('shows the first nations dropdown when data category is selected as First Nations and clears the proprietor name field when category goes from first nations to something else', async () => {
    const { getByText, getAllByRole, getByRole } = render(
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
                return { value: item.id, label: item.name };
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

    fireEvent.mouseDown(getAllByRole('textbox')[0]);
    const dataCategoryListbox1 = within(getByRole('listbox'));
    fireEvent.click(dataCategoryListbox1.getByText(/First Nations Land/i));

    fireEvent.mouseDown(getAllByRole('textbox')[1]);
    const proprietorNameListbox = within(getByRole('listbox'));
    fireEvent.click(proprietorNameListbox.getByText(/First nations code/i));

    await waitFor(() => {
      expect(screen.getByDisplayValue('First nations code')).toBeInTheDocument();
    });

    fireEvent.mouseDown(getAllByRole('textbox')[0]);
    const dataCategoryListbox2 = within(getByRole('listbox'));
    fireEvent.click(dataCategoryListbox2.getByText(/Proprietor code 1/i));

    await waitFor(() => {
      expect(screen.queryByDisplayValue('First nations code')).toBeNull();
    });
  });

  it('renders correctly when errors exist when survey data is proprietary', () => {
    const { asFragment } = render(
      <Formik
        initialValues={proprietaryDataFilledValues}
        validationSchema={ProprietaryDataYupSchema}
        validateOnBlur={true}
        initialErrors={{
          survey_data_proprietary: 'error on survey data proprietary field',
          proprietary_data_category: 'error on proprietary data category field',
          proprietor_name: 'error on proprietor name field',
          category_rational: 'error on category rational field',
          data_sharing_agreement_required: 'error on data sharing agreement required field'
        }}
        initialTouched={{
          survey_data_proprietary: true,
          proprietary_data_category: true,
          proprietor_name: true,
          category_rational: true,
          data_sharing_agreement_required: true
        }}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => (
          <ProprietaryDataForm
            proprietary_data_category={
              codes?.proprietor_type?.map((item) => {
                return { value: item.id, label: item.name };
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

    expect(asFragment()).toMatchSnapshot();
  });
});
