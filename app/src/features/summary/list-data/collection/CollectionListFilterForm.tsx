import CustomTextField from 'components/fields/CustomTextField';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';
import { useTaxonomyContext } from 'hooks/useContext';

export type ICollectionAdvancedFilters = {
  keyword?: string;
  itis_tsn?: number;
  system_user_id?: string;
  parent_collection_id?: number | null;
};

export const CollectionAdvancedFiltersInitialValues: ICollectionAdvancedFilters = {
  keyword: undefined,
  itis_tsn: undefined,
  system_user_id: undefined,
  parent_collection_id: undefined
};

interface ICollectionsListFilterFormProps {
  handleSubmit: (filterValues: ICollectionAdvancedFilters) => void;
  initialValues?: ICollectionAdvancedFilters;
}

/**
 * Collection advanced filters
 *
 * @param {ICollectionsListFilterFormProps} props
 * @return {*}
 */
const CollectionsListFilterForm = (props: ICollectionsListFilterFormProps) => {
  const { handleSubmit, initialValues } = props;

  const taxonomyContext = useTaxonomyContext();

  return (
    <Formik
      initialValues={initialValues ?? CollectionAdvancedFiltersInitialValues}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
      validateOnMount={false}>
      {(formikProps) => (
        <FilterFieldsContainer
          fields={[
            <CustomTextField
              name="keyword"
              label="Keyword"
              other={{ placeholder: 'Search by keyword' }}
              key="collection-keyword-filter"
            />,
            <SpeciesAutocompleteField
              formikFieldName="itis_tsn"
              label="Species"
              placeholder="Search by taxon"
              defaultSpecies={
                (initialValues?.itis_tsn &&
                  taxonomyContext.getCachedSpeciesTaxonomyByIdAsync(Number(initialValues.itis_tsn))) ||
                undefined
              }
              handleSpecies={(value) => {
                if (value?.tsn) {
                  formikProps.setFieldValue('itis_tsn', value.tsn);
                }
              }}
              handleClear={() => {
                formikProps.setFieldValue('itis_tsn', undefined);
              }}
              key="collection-tsn-filter"
            />,
            <SystemUserAutocompleteField
              formikFieldName="system_user_id"
              label="User"
              onSelect={(value) => {
                if (value?.system_user_id) {
                  formikProps.setFieldValue('system_user_id', value.system_user_id);
                }
              }}
              onClear={() => {
                formikProps.setFieldValue('system_user_id', undefined);
              }}
              key="collection-user-filter"
            />
          ]}
        />
      )}
    </Formik>
  );
};

export default CollectionsListFilterForm;
