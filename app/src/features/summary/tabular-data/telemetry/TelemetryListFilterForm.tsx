import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';

export type ITelemetryAdvancedFilters = {
  itis_tsn?: number;
};

export const TelemetryAdvancedFiltersInitialValues: ITelemetryAdvancedFilters = {
  itis_tsn: undefined
};

export interface ITelemetryListFilterFormProps {
  handleSubmit: (filterValues: ITelemetryAdvancedFilters) => void;
  initialValues?: ITelemetryAdvancedFilters;
}

/**
 * Telemetry advanced filters
 *
 * @param {ITelemetryListFilterFormProps} props
 * @return {*}
 */
const TelemetryListFilterForm = (props: ITelemetryListFilterFormProps) => {
  const { handleSubmit, initialValues } = props;

  return (
    <Formik initialValues={initialValues ?? TelemetryAdvancedFiltersInitialValues} onSubmit={handleSubmit}>
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
              clearOnSelect={true}
            />
          ]}
        />
      )}
    </Formik>
  );
};

export default TelemetryListFilterForm;
