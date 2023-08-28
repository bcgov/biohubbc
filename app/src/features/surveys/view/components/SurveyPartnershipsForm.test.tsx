import { Formik } from 'formik';
import { render } from 'test-helpers/test-utils';
import SurveyPartnershipsForm, {
  ISurveyPartnershipsForm,
  SurveyPartnershipsFormInitialValues,
  SurveyPartnershipsFormYupSchema
} from './SurveyPartnershipsForm';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { CodesContext, ICodesContext } from 'contexts/codesContext';
import { codes } from 'test-helpers/code-helpers';
import { DataLoader } from 'hooks/useDataLoader';

jest.mock('../../../../hooks/useBioHubApi');
const mockBiohubApi = useBiohubApi as jest.Mock;

const mockUseApi = {
  codes: {
    getAllCodeSets: jest.fn<Promise<IGetAllCodeSetsResponse>, []>()
  }
};


const mockCodesContext: ICodesContext = {
  codesDataLoader: {
    data: codes,
    load: () => {}
  } as DataLoader<any, any, any>
};

const renderContainer = (props: any) => {
  return render(
    <CodesContext.Provider value={mockCodesContext}>
      {props.children }
    </CodesContext.Provider>
  );
};


describe('SurveyPartnershipsForm', () => {
  beforeEach(() => {
    mockBiohubApi.mockImplementation(() => mockUseApi);
    mockUseApi.codes.getAllCodeSets.mockResolvedValue(codes);
  });

  it('renders correctly with default empty values', () => {
    

    const { getByLabelText } = renderContainer(
      <Formik
        initialValues={SurveyPartnershipsFormInitialValues}
        validationSchema={SurveyPartnershipsFormInitialValues}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <SurveyPartnershipsForm />}
      </Formik>
    );

    expect(getByLabelText('Indigenous Partnerships', { exact: false })).toBeVisible();
    expect(getByLabelText('Other Partnerships', { exact: false })).toBeVisible();
  });

  it('renders correctly with existing funding values', () => {
    const existingFormValues: ISurveyPartnershipsForm = {
      partnerships: {
        indigenous_partnerships: [1, 2],
        stakeholder_partnerships: [1 as unknown as string]
      }
    };

    const { getByLabelText, getByText } = renderContainer(
      <Formik
        initialValues={existingFormValues}
        validationSchema={SurveyPartnershipsFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={async () => {}}>
        {() => <SurveyPartnershipsForm />}
      </Formik>
    );

    expect(getByLabelText('Indigenous Partnerships', { exact: false })).toBeVisible();
    expect(getByLabelText('Other Partnerships', { exact: false })).toBeVisible();
    expect(getByText('nation 1')).toBeVisible();
    expect(getByText('nation 2')).toBeVisible();
    expect(getByText('partner 1', { exact: false })).toBeVisible();
  });
});
