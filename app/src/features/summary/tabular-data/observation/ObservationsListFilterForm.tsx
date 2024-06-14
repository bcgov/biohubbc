import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';

export type IObservationsAdvancedFilters = {
  minimum_date?: string;
  maximum_date?: string;
  keyword?: string;
  minimum_count?: string;
  minimum_time?: string;
  maximum_time?: string;
  system_user_id?: number;
  itis_tsn?: number;
};

export const ObservationAdvancedFiltersInitialValues: IObservationsAdvancedFilters = {
  minimum_date: undefined,
  maximum_date: undefined,
  keyword: undefined,
  minimum_count: undefined,
  minimum_time: undefined,
  maximum_time: undefined,
  system_user_id: undefined,
  itis_tsn: undefined
};

export interface IObservationsListFilterFormProps {
  handleSubmit: (filterValues: IObservationsAdvancedFilters) => void;
  initialValues?: IObservationsAdvancedFilters;
}

/**
 * Observation advanced filters
 *
 * @param {IObservationsListFilterFormProps} props
 * @return {*}
 */
export const ObservationsListFilterForm = (props: IObservationsListFilterFormProps) => {
  const { handleSubmit, initialValues } = props;

  return (
    <Formik initialValues={initialValues ?? ObservationAdvancedFiltersInitialValues} onSubmit={handleSubmit}>
      {(formikProps) => (
        <FilterFieldsContainer
          fields={[
            <CustomTextField name="keyword" label="Keyword" other={{ placeholder: 'Search by keyword' }} />,
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
            />,

            <SingleDateField name={'minimum_date'} label={'Observed after'} />,
            <SingleDateField name={'maximum_date'} label={'Observed before'} />
          ]}
        />
      )}
    </Formik>
  );
};
