import { AuthStateContext } from 'contexts/authStateContext';
import { IProjectAuthStateContext, ProjectAuthStateContext } from 'contexts/projectAuthStateContext';
import { IProjectContext, ProjectContext } from 'contexts/projectContext';
import { ISurveyContext, SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { DataLoader } from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { BrowserRouter } from 'react-router-dom';
import { SystemAdminAuthState, getMockAuthState } from 'test-helpers/auth-helpers';
import { cleanup, fireEvent, render, waitFor } from 'test-helpers/test-utils';
import { SurveyAnimalsPage } from './SurveyAnimalsPage';

jest.mock('hooks/useQuery', () => ({ useQuery: () => ({ critter_id: 0 }) }));
jest.mock('../../../../hooks/useBioHubApi.ts');
jest.mock('../../../../hooks/useTelemetryApi');
jest.mock('../../../../hooks/useCritterbaseApi');
const mockBiohubApi = useBiohubApi as jest.Mock;
const mockTelemetryApi = useTelemetryApi as jest.Mock;
const mockCritterbaseApi = useCritterbaseApi as jest.Mock;

const mockUseBiohub = {
  survey: {
    getSurveyCritters: jest.fn(),
    getDeploymentsInSurvey: jest.fn()
  },
  taxonomy: {
    getSpeciesFromIds: jest.fn()
  }
};

const mockUseTelemetry = {
  devices: {
    getDeviceDetails: jest.fn()
  }
};

const mockUseCritterbase = {
  critters: {
    getDetailedCritter: jest.fn()
  },
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

const page = (
  <AuthStateContext.Provider value={authState}>
    <ProjectAuthStateContext.Provider value={mockProjectAuthStateContext}>
      <ProjectContext.Provider value={mockProjectContext}>
        <SurveyContext.Provider value={mockSurveyContext}>
          <BrowserRouter>
            <SurveyAnimalsPage />
          </BrowserRouter>
        </SurveyContext.Provider>
      </ProjectContext.Provider>
    </ProjectAuthStateContext.Provider>
  </AuthStateContext.Provider>
);

describe('SurveyAnimalsPage', () => {
  beforeEach(async () => {
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

  it('should render the add critter dialog', async () => {
    const screen = render(page);

    await waitFor(() => {
      const addAnimalBtn = screen.getByRole('button', { name: 'Add' });
      expect(addAnimalBtn).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Add'));
    });

    await waitFor(() => {
      expect(screen.getByText('Add Critter')).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Cancel'));
    });
  });

  it('should be able to select critter from navbar', async () => {
    mockUseBiohub.survey.getSurveyCritters.mockResolvedValueOnce([
      {
        animal_id: 'test-critter-alias',
        wlh_id: '123-45',
        critter_id: 1,
        critterbase_critter_id: 'blah',
        taxon: 'a',
        created_at: 'a'
      }
    ]);
    const screen = render(page);
    await waitFor(() => {
      const addAnimalBtn = screen.getByRole('button', { name: 'Add' });
      expect(addAnimalBtn).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('test-critter-alias')).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('test-critter-alias'));
    });

    await waitFor(() => {
      expect(screen.getByText('General')).toBeInTheDocument();
    });
  });
});
