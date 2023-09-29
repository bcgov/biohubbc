import { SurveyAnimalsI18N } from 'constants/i18n';
import { Formik } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { fireEvent, render, waitFor } from 'test-helpers/test-utils';
import FamilyAnimalForm from './FamilyAnimalForm';

jest.mock('hooks/useCritterbaseApi');

const mockUseCritterbaseApi = useCritterbaseApi as jest.Mock;

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
  it('should display a new part of the form when add unit clicked', async () => {
    mockUseCritterbase.lookup.getSelectOptions.mockResolvedValueOnce([{ id: 'a', value: 'a', label: 'family_1' }]);
    mockUseCritterbase.family.getAllFamilies.mockResolvedValueOnce([{ family_id: 'a', family_label: 'family_1' }]);
    const { getByText } = render(
      <Formik
        initialValues={{ general: { taxon_id: 'a' }, family: [{ family_id: 'New Family', relationship: 'parent' }] }}
        onSubmit={() => {}}>
        {() => <FamilyAnimalForm />}
      </Formik>
    );

    await waitFor(() => {
      fireEvent.click(getByText(SurveyAnimalsI18N.animalFamilyAddBtn));
      expect(getByText(SurveyAnimalsI18N.animalFamilyTitle2)).toBeInTheDocument();
      expect(getByText('Family ID')).toBeInTheDocument();
      expect(getByText('Relationship')).toBeInTheDocument();
    });
  });
});
