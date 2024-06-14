import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';

export type IAnimalsAdvancedFilters = {
  itis_tsn?: number;
};

export const AnimalsAdvancedFiltersInitialValues: IAnimalsAdvancedFilters = {
  itis_tsn: undefined
};

export interface IAnimalsListFilterFormProps {
  handleSubmit: (filterValues: IAnimalsAdvancedFilters) => void;
  initialValues?: IAnimalsAdvancedFilters;
}

/**
 * Animal advanced filters
 *
 * @param {IAnimalsListFilterFormProps} props
 * @return {*}
 */
const AnimalsListFilterForm = (props: IAnimalsListFilterFormProps) => {
  const { handleSubmit, initialValues } = props;

  return (
    <Formik initialValues={initialValues ?? AnimalsAdvancedFiltersInitialValues} onSubmit={handleSubmit}>
      {(formikProps) => (
        <FilterFieldsContainer
          fields={[
            <CustomTextField name="keyword" label="Keyword" other={{ placeholder: 'Type any keyword' }} />,
            <SpeciesAutocompleteField
              formikFieldName={'itis_tsns'}
              label={'Species'}
              placeholder="Search by taxon"
              handleSpecies={(value) => {
                if (value?.tsn) {
                  formikProps.setFieldValue('itis_tsns', value.tsn);
                }
              }}
              handleClear={() => {
                formikProps.setFieldValue('itis_tsns', undefined);
              }}
            />
          ]}
        />
      )}
    </Formik>
  );
};

export default AnimalsListFilterForm;
