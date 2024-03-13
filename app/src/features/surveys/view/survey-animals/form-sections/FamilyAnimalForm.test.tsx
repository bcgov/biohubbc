// FIX:update tests once family form refactored
export {};
// import { Formik } from 'formik';
// import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
// import { render, waitFor } from 'test-helpers/test-utils';
// //import FamilyAnimalFormContent from './FamilyAnimalForm';
//
// jest.mock('hooks/useCritterbaseApi');
//
// const mockUseCritterbaseApi = useCritterbaseApi as jest.Mock;
//
// const mockUseCritterbase = {
//   lookup: {
//     getSelectOptions: jest.fn()
//   },
//   family: {
//     getAllFamilies: jest.fn()
//   }
// };
//
// describe('FamilyAnimalForm', () => {
//   beforeEach(() => {
//     mockUseCritterbaseApi.mockImplementation(() => mockUseCritterbase);
//     mockUseCritterbase.lookup.getSelectOptions.mockClear();
//     mockUseCritterbase.family.getAllFamilies.mockClear();
//   });
//   it('should display both inputs for family form section', async () => {
//     mockUseCritterbase.lookup.getSelectOptions.mockResolvedValueOnce([{ id: 'a', value: 'a', label: 'family_1' }]);
//     mockUseCritterbase.family.getAllFamilies.mockResolvedValueOnce([{ family_id: 'a', family_label: 'family_1' }]);
//     const { getByText } = render(
//       <Formik
//         initialValues={{ general: { taxon_id: 'a' }, family: [{ family_id: 'New Family', relationship: 'parent' }] }}
//         onSubmit={() => {}}>
//         {() => <FamilyAnimalFormContent index={0} />}
//       </Formik>
//     );
//
//     await waitFor(() => {
//       expect(getByText('Family ID')).toBeInTheDocument();
//       expect(getByText('Relationship')).toBeInTheDocument();
//     });
//   });
// });
