import { render } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { ConfigContext, IConfig } from 'contexts/configContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { SystemAdminAuthState, getMockAuthState } from 'test-helpers/auth-helpers';
import { cleanup, waitFor } from 'test-helpers/test-utils';
import { AnimalSection } from './AnimalSection';
import { ANIMAL_SECTION } from './animal';
jest.mock('../../../../hooks/useCritterbaseApi');
const mockCritterbaseApi = useCritterbaseApi as jest.Mock;

const mockRefreshCritter = jest.fn();

const authState = getMockAuthState({ base: SystemAdminAuthState });

const authConfig: AuthProviderProps = {
  authority: 'authority',
  client_id: 'client',
  redirect_uri: 'redirect'
};

const animalSection = (section: ANIMAL_SECTION, critter?: IDetailedCritterWithInternalId) => (
  <AuthProvider {...authConfig}>
    <ConfigContext.Provider value={{} as IConfig}>
      <AuthStateContext.Provider value={authState}>
        <AnimalSection section={section} refreshCritter={mockRefreshCritter} critter={critter} />
      </AuthStateContext.Provider>
    </ConfigContext.Provider>
  </AuthProvider>
);

describe('AnimalSection', () => {
  beforeEach(() => {
    mockCritterbaseApi.mockImplementation(() => ({
      family: {
        getAllFamilies: jest.fn()
      }
    }));
  });
  afterEach(() => {
    cleanup();
  });
  it('should mount with empty state with no critter', async () => {
    const screen = render(animalSection(ANIMAL_SECTION.GENERAL));
    await waitFor(() => {
      const header = screen.getByRole('heading', { name: /no animal selected/i });
      expect(header).toBeInTheDocument();
    });
  });

  it('should render the general section', async () => {
    const screen = render(
      animalSection(ANIMAL_SECTION.GENERAL, {
        critterbase_critter_id: 'blah',
        critter_id: 1
      } as IDetailedCritterWithInternalId)
    );
    await waitFor(() => {
      const header = screen.getByRole('heading', { name: ANIMAL_SECTION.GENERAL });
      expect(header).toBeInTheDocument();
    });
  });

  it('should render the collection units section', async () => {
    const screen = render(
      animalSection(ANIMAL_SECTION.COLLECTION_UNITS, {
        critterbase_critter_id: 'blah',
        critter_id: 1,
        collection_units: []
      } as unknown as IDetailedCritterWithInternalId)
    );
    await waitFor(() => {
      const header = screen.getByRole('heading', { name: ANIMAL_SECTION.COLLECTION_UNITS });
      expect(header).toBeInTheDocument();
    });
  });

  it('should render the markings section', async () => {
    const screen = render(
      animalSection(ANIMAL_SECTION.MARKINGS, {
        critter_id: 1,
        critterbase_critter_id: 'blah',
        markings: []
      } as unknown as IDetailedCritterWithInternalId)
    );
    await waitFor(() => {
      const header = screen.getByRole('heading', { name: ANIMAL_SECTION.MARKINGS });
      expect(header).toBeInTheDocument();
    });
  });

  it('should render the measurements section', async () => {
    const screen = render(
      animalSection(ANIMAL_SECTION.MEASUREMENTS, {
        critter_id: 1,
        critterbase_critter_id: 'blah',
        measurements: { qualitative: [], quantitative: [] }
      } as unknown as IDetailedCritterWithInternalId)
    );
    await waitFor(() => {
      const header = screen.getByRole('heading', { name: ANIMAL_SECTION.MEASUREMENTS });
      expect(header).toBeInTheDocument();
    });
  });

  it('should render the captures section', async () => {
    const screen = render(
      animalSection(ANIMAL_SECTION.CAPTURES, {
        critter_id: 1,
        critterbase_critter_id: 'blah',
        captures: []
      } as unknown as IDetailedCritterWithInternalId)
    );
    await waitFor(() => {
      const header = screen.getByRole('heading', { name: ANIMAL_SECTION.CAPTURES });
      expect(header).toBeInTheDocument();
    });
  });

  it('should render the mortality section', async () => {
    const screen = render(
      animalSection(ANIMAL_SECTION.MORTALITY, {
        critter_id: 1,
        critterbase_critter_id: 'blah',
        mortality: []
      } as unknown as IDetailedCritterWithInternalId)
    );
    await waitFor(() => {
      const header = screen.getByRole('heading', { name: ANIMAL_SECTION.MORTALITY });
      expect(header).toBeInTheDocument();
    });
  });

  it('should render the family section', async () => {
    const screen = render(
      animalSection(ANIMAL_SECTION.FAMILY, {
        critter_id: 1,
        critterbase_critter_id: 'blah',
        family_parent: [],
        family_child: []
      } as unknown as IDetailedCritterWithInternalId)
    );
    await waitFor(() => {
      const header = screen.getByRole('heading', { name: ANIMAL_SECTION.FAMILY });
      expect(header).toBeInTheDocument();
    });
  });
});
