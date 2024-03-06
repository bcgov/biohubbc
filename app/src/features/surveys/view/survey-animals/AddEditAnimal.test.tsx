import { AuthStateContext } from 'contexts/authStateContext';
import { IProjectAuthStateContext, ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import * as Formik from 'formik';
import { FieldArray, FieldArrayRenderProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { DataLoader } from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { BrowserRouter } from 'react-router-dom';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import { AddEditAnimal } from './AddEditAnimal';
import { AnimalSchema, AnimalSex, IAnimal } from './animal';
import { ANIMAL_SECTIONS_FORM_MAP, IAnimalSections } from './animal-sections';

jest.mock('hooks/useQuery', () => ({ useQuery: () => ({ cid: 0 }) }));
jest.mock('../../../../hooks/useBioHubApi.ts');
jest.mock('../../../../hooks/useTelemetryApi');
jest.mock('../../../../hooks/useCritterbaseApi');
const mockFormik = jest.spyOn(Formik, 'useFormikContext');
const mockBiohubApi = useBiohubApi as jest.Mock;
const mockTelemetryApi = useTelemetryApi as jest.Mock;
const mockCritterbaseApi = useCritterbaseApi as jest.Mock;

const mockValues: IAnimal = {
  general: {
    itis_tsn: 1,
    itis_scientific_name: 'itis_scientific_name',
    animal_id: 'alias',
    critter_id: 'critter',
    sex: AnimalSex.UNKNOWN,
    wlh_id: '1'
  },
  captures: [{ projection_mode: 'utm' } as any],
  markings: [],
  measurements: [],
  mortality: [{ projection_mode: 'utm' } as any],
  collectionUnits: [],
  family: [],
  device: [],
  images: []
};

const mockUseFormik = {
  submitForm: jest.fn(),
  isValid: true,
  resetForm: jest.fn(),
  values: mockValues,
  isSubmitting: false,
  initialValues: mockValues,
  isValidating: false,
  status: undefined
} as any;

const mockUseBiohub = {
  survey: {
    getSurveyCritters: jest.fn(),
    getDeploymentsInSurvey: jest.fn()
  }
};

const mockUseTelemetry = {
  devices: {
    getDeviceDetails: jest.fn()
  }
};

const mockUseCritterbase = {
  family: {
    getAllFamilies: jest.fn()
  },
  lookup: {
    getTaxonMeasurements: jest.fn()
  }
};
const mockSurveyContext: ISurveyContext = {
  artifactDataLoader: {
    data: null,
    load: jest.fn()
  } as unknown as DataLoader<any, any, any>,
  surveyId: 1,
  projectId: 1,
  surveyDataLoader: {
    data: { surveyData: { survey_details: { survey_name: 'name' } } },
    load: jest.fn()
  } as unknown as DataLoader<any, any, any>
} as unknown as ISurveyContext;

const mockProjectAuthStateContext: IProjectAuthStateContext = {
  getProjectParticipant: () => null,
  hasProjectRole: () => true,
  hasProjectPermission: () => true,
  hasSystemRole: () => true,
  getProjectId: () => 1,
  hasLoadedParticipantInfo: true
};

const mockProjectContext: IProjectContext = {
  artifactDataLoader: {
    data: null,
    load: jest.fn()
  } as unknown as DataLoader<any, any, any>,
  projectId: 1,
  projectDataLoader: {
    data: { projectData: { project: { project_name: 'name' } } },
    load: jest.fn()
  } as unknown as DataLoader<any, any, any>
} as unknown as IProjectContext;

const authState = getMockAuthState({ base: SystemAdminAuthState });

const page = (section: IAnimalSections) => (
  <AuthStateContext.Provider value={authState}>
    <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
      <ProjectContext.Provider value={mockProjectContext}>
        <SurveyContext.Provider value={mockSurveyContext}>
          <BrowserRouter>
            <Formik.Formik
              initialValues={mockValues}
              enableReinitialize
              validationSchema={AnimalSchema}
              validateOnBlur={false}
              validateOnChange={true}
              onSubmit={async (values, actions) => {}}>
              <FieldArray name={ANIMAL_SECTIONS_FORM_MAP[section].animalKeyName}>
                {(formikArrayHelpers: FieldArrayRenderProps) => (
                  <AddEditAnimal
                    section={section}
                    telemetrySaveAction={null as any}
                    deploymentRemoveAction={null as any}
                    formikArrayHelpers={formikArrayHelpers}
                  />
                )}
              </FieldArray>
            </Formik.Formik>
          </BrowserRouter>
        </SurveyContext.Provider>
      </ProjectContext.Provider>
    </ProjectAuthStateContext.Provider>
  </AuthStateContext.Provider>
);

describe('AddEditAnimal', () => {
  beforeEach(async () => {
    mockFormik.mockImplementation(() => mockUseFormik);
    mockBiohubApi.mockImplementation(() => mockUseBiohub);
    mockTelemetryApi.mockImplementation(() => mockUseTelemetry);
    mockCritterbaseApi.mockImplementation(() => mockUseCritterbase);
    mockUseBiohub.survey.getDeploymentsInSurvey.mockClear();
    mockUseBiohub.survey.getSurveyCritters.mockClear();
    mockUseTelemetry.devices.getDeviceDetails.mockClear();
    mockUseCritterbase.family.getAllFamilies.mockClear();
    mockUseCritterbase.lookup.getTaxonMeasurements.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the General section', async () => {
    const screen = render(page('General'));
    await waitFor(() => {
      const general = screen.getByText('General');
      expect(general).toBeInTheDocument();
    });
  });
  it('should render the Ecological Units section and open dialog', async () => {
    const screen = render(page('Ecological Units'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add Unit' })).toBeInTheDocument();
    });
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Add Unit' }));
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
  it('should render the Markings section and open dialog', async () => {
    const screen = render(page('Markings'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add Marking' })).toBeInTheDocument();
    });
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Add Marking' }));
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
  it('should render the Measurement section and open dialog', async () => {
    const screen = render(page('Measurements'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add Measurement' })).toBeInTheDocument();
    });
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Add Measurement' }));
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
  it('should render the Family section and open dialog', async () => {
    const screen = render(page('Family'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add Relationship' })).toBeInTheDocument();
    });
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Add Relationship' }));
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});
