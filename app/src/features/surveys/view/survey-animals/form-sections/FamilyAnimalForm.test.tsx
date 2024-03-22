import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import { render, waitFor } from 'test-helpers/test-utils';
import { ANIMAL_FORM_MODE } from '../animal';
import FamilyAnimalForm from './FamilyAnimalForm';

jest.mock('hooks/useCritterbaseApi');

const mockUseCritterbaseApi = useCritterbaseApi as jest.Mock;
const mockHandleClose = jest.fn();

const mockUseCritterbase = {
  lookup: {
    getSelectOptions: jest.fn()
  },
  family: {
    getAllFamilies: jest.fn()
  }
};

describe('FamilyAnimalForm', () => {
  beforeEach(() => {
    mockUseCritterbaseApi.mockImplementation(() => mockUseCritterbase);
    mockUseCritterbase.lookup.getSelectOptions.mockClear();
    mockUseCritterbase.family.getAllFamilies.mockClear();
  });
  it('should display both inputs for family form section', async () => {
    mockUseCritterbase.lookup.getSelectOptions.mockResolvedValueOnce([{ id: 'a', value: 'a', label: 'family_1' }]);
    mockUseCritterbase.family.getAllFamilies.mockResolvedValueOnce([{ family_id: 'a', family_label: 'family_1' }]);
    const { getByText } = render(
      <FamilyAnimalForm
        formMode={ANIMAL_FORM_MODE.ADD}
        handleClose={mockHandleClose}
        open={true}
        critter={{ critter_id: 'critter' } as unknown as ICritterDetailedResponse}
      />
    );

    await waitFor(() => {
      expect(getByText(/add family relationship/i)).toBeInTheDocument();
      expect(getByText(/child in/i)).toBeInTheDocument();
    });
  });
});
