import CustomTextField from 'components/fields/CustomTextField';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';

export type ISurveyAdvancedFilters = {
  keyword?: string;
  itis_tsn?: number;
  person?: string;
};

export const SurveyAdvancedFiltersInitialValues: ISurveyAdvancedFilters = {
  keyword: undefined,
  itis_tsn: undefined,
  person: undefined
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
              label="Person"
              placeholder="Find Projects that a person has access to"
              formikFieldName="system_user_id"
              key="survey-person-filter"
            />
          ]}
        />
      )}
    </Formik>
  );
};

export default SurveysListFilterForm;
