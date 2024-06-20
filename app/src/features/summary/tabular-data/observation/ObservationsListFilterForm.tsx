import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';
import { useTaxonomyContext } from 'hooks/useContext';

export type IObservationsAdvancedFilters = {
  keyword?: string;
  itis_tsn?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  min_count?: string;
  system_user_id?: number;
};

export const ObservationAdvancedFiltersInitialValues: IObservationsAdvancedFilters = {
  keyword: undefined,
  itis_tsn: undefined,
  start_date: undefined,
  end_date: undefined,
  start_time: undefined,
  end_time: undefined,
  min_count: undefined,
  system_user_id: undefined
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

  const taxonomyContext = useTaxonomyContext();

  return (
    <Formik initialValues={initialValues ?? ObservationAdvancedFiltersInitialValues} onSubmit={handleSubmit}>
      {(formikProps) => (
        <FilterFieldsContainer
          fields={[
            <CustomTextField name="keyword" label="Keyword" other={{ placeholder: 'Search by keyword' }} />,
            <SpeciesAutocompleteField
              formikFieldName={'itis_tsn'}
              label={'Species'}
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
            />,

            <SingleDateField name={'start_date'} label={'Observed after'} />,
            <SingleDateField name={'end_date'} label={'Observed before'} />
          ]}
        />
      )}
    </Formik>
  );
};
