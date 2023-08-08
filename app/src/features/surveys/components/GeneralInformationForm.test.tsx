import GeneralInformationForm, {
  GeneralInformationInitialValues,
  GeneralInformationYupSchema,
  IGeneralInformationForm
} from 'features/surveys/components/GeneralInformationForm';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { getProjectForViewResponse } from 'test-helpers/project-helpers';
import { render, waitFor } from 'test-helpers/test-utils';

jest.mock('../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  taxonomy: {
    searchSpecies: jest.fn().mockResolvedValue({ searchResponse: [] }),
    getSpeciesFromIds: jest.fn().mockResolvedValue({ searchResponse: [] })
  }
};

const handleSaveAndNext = jest.fn();

const generalInformationFilledValues: IGeneralInformationForm = {
  survey_details: {
    survey_name: 'survey name',
    start_date: '2000-04-09 11:53:53',
    end_date: '2020-05-10 11:53:53',
    biologist_first_name: 'first',
    biologist_last_name: 'last'
  },
  species: {
    focal_species: [1],
    ancillary_species: [2]
  },
  permit: {
    permits: [
      {
        permit_number: '12345',
        permit_type: 'Park Use Permit'
      }
    ]
  }
};

describe('General Information Form', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.taxonomy.searchSpecies.mockResolvedValue({ searchResponse: [] });
    mockUseApi.taxonomy.getSpeciesFromIds.mockResolvedValue({ searchResponse: [] });
  });

  it('renders correctly the empty component correctly', async () => {
    const { asFragment } = render(
      <Formik
        initialValues={GeneralInformationInitialValues}
        validationSchema={GeneralInformationYupSchema()}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => (
          <GeneralInformationForm
            projectStartDate={getProjectForViewResponse.projectData.project.start_date}
            projectEndDate={getProjectForViewResponse.projectData.project.end_date}
          />
        )}
      </Formik>
    );
    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly the filled component correctly', async () => {
    const { asFragment } = render(
      <Formik
        initialValues={generalInformationFilledValues}
        validationSchema={GeneralInformationYupSchema()}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => (
          <GeneralInformationForm
            projectStartDate={getProjectForViewResponse.projectData.project.start_date}
            projectEndDate={getProjectForViewResponse.projectData.project.end_date}
          />
        )}
      </Formik>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('renders correctly when errors exist', async () => {
    const { asFragment } = render(
      <Formik
        initialValues={generalInformationFilledValues}
        validationSchema={GeneralInformationYupSchema()}
        validateOnBlur={true}
        initialErrors={{
          survey_details: {
            survey_name: 'error on survey name field',
            start_date: 'error on start date field',
            end_date: 'error on end date field',
            biologist_first_name: 'error on biologist first name field',
            biologist_last_name: 'error on biologist last name field'
          },
          species: {
            focal_species: 'error on species field'
          }
        }}
        initialTouched={{
          survey_details: {
            survey_name: true,
            start_date: true,
            end_date: true,
            biologist_first_name: true,
            biologist_last_name: true
          },
          species: {
            focal_species: true
          }
        }}
        validateOnChange={false}
        onSubmit={async (values) => {
          handleSaveAndNext(values);
        }}>
        {() => (
          <GeneralInformationForm
            projectStartDate={getProjectForViewResponse.projectData.project.start_date}
            projectEndDate={getProjectForViewResponse.projectData.project.end_date}
          />
        )}
      </Formik>
    );

    await waitFor(() => {
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
