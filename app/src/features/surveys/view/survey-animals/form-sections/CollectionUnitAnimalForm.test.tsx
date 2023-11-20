import { Formik } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { render, waitFor } from 'test-helpers/test-utils';
import { ANIMAL_SECTIONS_FORM_MAP } from '../animal-sections';
import CollectionUnitAnimalFormContent from './CollectionUnitAnimalForm';

jest.mock('hooks/useCritterbaseApi');

const mockUseCritterbaseApi = useCritterbaseApi as jest.Mock;

const mockUseCritterbase = {
  lookup: {
    getSelectOptions: jest.fn()
  }
};

const defaultCollectionUnit = ANIMAL_SECTIONS_FORM_MAP['Ecological Units'].defaultFormValue;

describe('CollectionUnitAnimalForm', () => {
  beforeEach(() => {
    mockUseCritterbaseApi.mockImplementation(() => mockUseCritterbase);
    mockUseCritterbase.lookup.getSelectOptions.mockClear();
  });
  it('should display two form inputs for category and name', async () => {
    mockUseCritterbase.lookup.getSelectOptions.mockResolvedValueOnce([
      { id: 'a', value: 'a', label: 'category_label' }
    ]);

    const { getByText } = render(
      <Formik
        initialValues={{ general: { taxon_id: 'a' }, collectionUnits: [defaultCollectionUnit] }}
        onSubmit={() => {}}>
        {() => <CollectionUnitAnimalFormContent index={0} />}
      </Formik>
    );

    await waitFor(() => {
      expect(getByText('Category')).toBeInTheDocument();
      expect(getByText('Name')).toBeInTheDocument();
    });
  });
});
