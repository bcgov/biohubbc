import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';
import { useCodesContext, useTaxonomyContext } from 'hooks/useContext';
import { FindSurveyHabitatFeaturesFilters } from 'interfaces/useSurveyHabitatFeatureApi.interface';
import { useEffect } from 'react';

export type SurveyHabitatFeaturesAdvancedFilters = Omit<
  FindSurveyHabitatFeaturesFilters,
  'habitat_feature_type_ids' | 'itis_tsns'
> & {
  habitat_feature_type_id?: number;
  itis_tsn?: number;
};

export const SurveyHabitatFeaturesAdvancedFiltersInitialValues: SurveyHabitatFeaturesAdvancedFilters = {
  keyword: undefined,
  habitat_feature_type_id: undefined,
  itis_tsn: undefined,
  start_date: undefined,
  end_date: undefined,
  start_time: undefined,
  end_time: undefined,
  min_count: undefined,
  system_user_id: undefined
};

export interface IHabitatFeaturesListFilterFormProps {
  handleSubmit: (filterValues: SurveyHabitatFeaturesAdvancedFilters) => void;
  initialValues?: SurveyHabitatFeaturesAdvancedFilters;
}

/**
 * HabitatFeature advanced filters
 *
 * @param {IHabitatFeaturesListFilterFormProps} props
 * @return {*}
 */
export const HabitatFeaturesListFilterForm = (props: IHabitatFeaturesListFilterFormProps) => {
  const { handleSubmit, initialValues } = props;

  const codesContext = useCodesContext();
  const taxonomyContext = useTaxonomyContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const habitatFeatureTypeOptions =
    codesContext.codesDataLoader.data?.habitat_feature_types.map((item) => {
      return {
        value: item.id,
        label: item.name,
        description: item.description
      };
    }) ?? [];

  return (
    <Formik initialValues={initialValues ?? SurveyHabitatFeaturesAdvancedFiltersInitialValues} onSubmit={handleSubmit}>
      {(formikProps) => (
        <FilterFieldsContainer
          fields={[
            <CustomTextField
              name="keyword"
              label="Keyword"
              other={{ placeholder: 'Search by keyword' }}
              key="habitat-features-keyword-filter"
            />,
            <AutocompleteField
              id="habitat_feature_type_id"
              name="habitat_feature_type_id"
              label="Type"
              options={habitatFeatureTypeOptions}
              key="habitat-features-habitat-feature-type-filter"
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
              key="habitat-features-tsn-filter"
            />,

            <SingleDateField
              name={'start_date'}
              id="start_date"
              label={'Observed after'}
              key="habitat-features-start-date-filter"
            />,
            <SingleDateField
              name={'end_date'}
              id="end_date"
              label={'Observed before'}
              key="habitat-features-end-date-filter"
            />
          ]}
        />
      )}
    </Formik>
  );
};
