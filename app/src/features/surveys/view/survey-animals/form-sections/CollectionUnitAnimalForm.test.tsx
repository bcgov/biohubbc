import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import { render, waitFor } from 'test-helpers/test-utils';
import { ANIMAL_FORM_MODE } from '../animal';
import CollectionUnitAnimalForm from './CollectionUnitAnimalForm';

vi.mock('hooks/useCritterbaseApi');

const mockUseCritterbaseApi = useCritterbaseApi as Mock;

const mockHandleClose = vi.fn();

const mockUseCritterbase = {
  lookup: {
    getSelectOptions: vi.fn()
  }
};

describe('CollectionUnitForm', () => {
  beforeEach(() => {
    mockUseCritterbaseApi.mockImplementation(() => mockUseCritterbase);
    mockUseCritterbase.lookup.getSelectOptions.mockClear();
  });
  it('should display two form inputs for category and name', async () => {
    mockUseCritterbase.lookup.getSelectOptions.mockResolvedValueOnce([
      { id: 'a', value: 'a', label: 'category_label' }
    ]);

    const { getByText } = render(
      <CollectionUnitAnimalForm
        formMode={ANIMAL_FORM_MODE.ADD}
        handleClose={mockHandleClose}
        open={true}
        critter={{ critter_id: 'critter', collection_units: [] } as unknown as ICritterDetailedResponse}
      />
    );

    await waitFor(() => {
      expect(getByText('Category')).toBeInTheDocument();
      expect(getByText('Name')).toBeInTheDocument();
    });
  });
});
