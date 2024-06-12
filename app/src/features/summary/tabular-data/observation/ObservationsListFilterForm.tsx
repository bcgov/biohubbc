import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SearchFilters from 'features/summary/components/SearchFilters';
import { Formik, FormikProps } from 'formik';
import { useRef } from 'react';

export type IObservationsAdvancedFilters = {
  minimum_date?: string;
  maximum_date?: string;
  keyword?: string;
  minimum_count?: string;
  minimum_time?: string;
  maximum_time?: string;
  system_user_id?: number;
  itis_tsns?: number[];
};

export const ObservationAdvancedFiltersInitialValues: IObservationsAdvancedFilters = {
  minimum_date: undefined,
  maximum_date: undefined,
  keyword: undefined,
  minimum_count: undefined,
  minimum_time: undefined,
  maximum_time: undefined,
  system_user_id: undefined,
  itis_tsns: undefined
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

  const formikRef = useRef<FormikProps<IObservationsAdvancedFilters>>(null);

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialValues ?? ObservationAdvancedFiltersInitialValues}
      onSubmit={handleSubmit}>
      <SearchFilters
        fields={[
          <CustomTextField name="keyword" label="Keyword" other={{ placeholder: 'Search by keyword' }} />,
          <SpeciesAutocompleteField
            formikFieldName={'itis_tsns'}
            label={'Species'}
            placeholder="Search by taxon"
            handleSpecies={(value) => {
              formikRef.current?.setFieldValue('itis_tsns', value?.tsn);
            }}
            handleClear={() => {
              formikRef.current?.setFieldValue('itis_tsns', '');
            }}
            clearOnSelect={true}
            showSelectedValue={true}
          />,

          <SingleDateField name={'minimum_date'} label={'Observed after'} />,
          <SingleDateField name={'maximum_date'} label={'Observed before'} />
        ]}
      />
    </Formik>
  );
};
