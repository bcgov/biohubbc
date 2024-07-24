import CustomTextField from 'components/fields/CustomTextField';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';
import { useTaxonomyContext } from 'hooks/useContext';

export type ISurveyAdvancedFilters = {
  keyword?: string;
  itis_tsn?: number;
  system_user_id?: string;
};

export const SurveyAdvancedFiltersInitialValues: ISurveyAdvancedFilters = {
  keyword: undefined,
  itis_tsn: undefined,
  system_user_id: undefined
};

export interface ISurveysListFilterFormProps {
  handleSubmit: (filterValues: ISurveyAdvancedFilters) => void;
  initialValues?: ISurveyAdvancedFilters;
}

/**
 * Survey advanced filters
 *
 * @param {ISurveysListFilterFormProps} props
 * @return {*}
 */
const SurveysListFilterForm = (props: ISurveysListFilterFormProps) => {
  const { handleSubmit, initialValues } = props;

  const taxonomyContext = useTaxonomyContext();

  return (
    <Formik
      initialValues={initialValues ?? SurveyAdvancedFiltersInitialValues}
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
              key="survey-keyword-filter"
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
              key="survey-tsn-filter"
            />,
            <SystemUserAutocompleteField
              formikFieldName="system_user_id"
              label="User"
              placeholder="Search by user"
              onSelect={(value) => {
                if (value?.system_user_id) {
                  formikProps.setFieldValue('system_user_id', value.system_user_id);
                }
              }}
              onClear={() => {
                formikProps.setFieldValue('system_user_id', undefined);
              }}
              key="survey-user-filter"
            />
          ]}
        />
      )}
    </Formik>
  );
};

export default SurveysListFilterForm;
