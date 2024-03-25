import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { IDetailedCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { getMockAuthState, SystemAdminAuthState } from 'test-helpers/auth-helpers';
import { cleanup, waitFor } from 'test-helpers/test-utils';
import appTheme from 'themes/appTheme';
import { ANIMAL_SECTION } from './animal';
import { AnimalSection } from './AnimalSection';
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
  <ThemeProvider theme={appTheme}>
    <AuthProvider {...authConfig}>
      <AuthStateContext.Provider value={authState}>
        <AnimalSection section={section} refreshCritter={mockRefreshCritter} critter={critter} />
      </AuthStateContext.Provider>
    </AuthProvider>
  </ThemeProvider>
);

describe('AnimalSection', () => {
  beforeEach(() => {
    mockCritterbaseApi.mockImplementation(() => {});
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
        critter_id: 'blah',
        survey_critter_id: 1
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
        critter_id: 'blah',
        survey_critter_id: 1,
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
        critter_id: 'blah',
        survey_critter_id: 1,
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
        critter_id: 'blah',
        survey_critter_id: 1,
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
        critter_id: 'blah',
        survey_critter_id: 1,
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
        critter_id: 'blah',
        survey_critter_id: 1,
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
        critter_id: 'blah',
        survey_critter_id: 1,
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
