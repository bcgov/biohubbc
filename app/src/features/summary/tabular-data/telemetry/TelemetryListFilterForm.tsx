import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';
import { useTaxonomyContext } from 'hooks/useContext';

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
 * TODO: The filter fields are disabled for now. The fields are functional (the values are captured and passed to the
 * backend), but the backend does not currently use them for filtering.
 *
 * @param {ITelemetryListFilterFormProps} props
 * @return {*}
 */
const TelemetryListFilterForm = (props: ITelemetryListFilterFormProps) => {
  const { handleSubmit, initialValues } = props;

  const taxonomyContext = useTaxonomyContext();

  return (
    <Formik initialValues={initialValues ?? TelemetryAdvancedFiltersInitialValues} onSubmit={handleSubmit}>
      {(formikProps) => (
        <FilterFieldsContainer
          fields={[
            <CustomTextField
              name="keyword"
              label="Keyword"
              other={{
                placeholder: 'Type any keyword',
                disabled: true // See TODO
              }}
              key="telemetry-keyword-filter"
            />,
            <SpeciesAutocompleteField
              formikFieldName={'itis_tsns'}
              label={'Species'}
              placeholder="Search by taxon"
              defaultSpecies={
                (initialValues?.itis_tsn &&
                  taxonomyContext.getCachedSpeciesTaxonomyByIdAsync(Number(initialValues.itis_tsn))) ||
                undefined
              }
              handleSpecies={(value) => {
                if (value?.tsn) {
                  formikProps.setFieldValue('itis_tsns', value.tsn);
                }
              }}
              handleClear={() => {
                formikProps.setFieldValue('itis_tsns', undefined);
              }}
              disabled={true} // See TODO
              key="telemetry-tsn-filter"
            />
          ]}
        />
      )}
    </Formik>
  );
};

export default TelemetryListFilterForm;
