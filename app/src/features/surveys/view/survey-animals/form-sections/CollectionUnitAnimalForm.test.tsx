import { SurveyAnimalsI18N } from 'constants/i18n';
import { Formik } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import CollectionUnitAnimalForm from './CollectionUnitAnimalForm';

jest.mock('hooks/useCritterbaseApi');

const mockUseCritterbaseApi = useCritterbaseApi as jest.Mock;

const mockUseCritterbase = {
  lookup: {
    getSelectOptions: jest.fn()
  }
};

describe('CollectionUnitAnimalForm', () => {
  beforeEach(() => {
    mockUseCritterbaseApi.mockImplementation(() => mockUseCritterbase);
    mockUseCritterbase.lookup.getSelectOptions.mockClear();
  });
  it('should display a new part of the form when add unit clicked', async () => {
    mockUseCritterbase.lookup.getSelectOptions.mockResolvedValueOnce([
      { id: 'a', value: 'a', label: 'category_label' }
    ]);

    const { getByText } = render(
      <Formik initialValues={{ general: { taxon_id: 'a' }, collectionUnits: [] }} onSubmit={() => {}}>
        {() => <CollectionUnitAnimalForm />}
      </Formik>
    );

    await waitFor(() => {
      fireEvent.click(getByText(SurveyAnimalsI18N.animalCollectionUnitAddBtn));
      expect(getByText(SurveyAnimalsI18N.animalCollectionUnitTitle2)).toBeInTheDocument();
      expect(getByText('Unit Category')).toBeInTheDocument();
      expect(getByText('Unit Name')).toBeInTheDocument();
    });
  });
});
