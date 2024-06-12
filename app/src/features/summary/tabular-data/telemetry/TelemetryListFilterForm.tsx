import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import CustomTextField from 'components/fields/CustomTextField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import SearchFilters from 'features/summary/components/SearchFilters';
import { Formik, FormikProps } from 'formik';
import React, { useRef } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import { ITelemetryAdvancedFilters } from './TelemetryListContainer';

export interface ITelemetryListFilterFormProps {
  paginationSort: ApiPaginationRequestOptions;
  handleSubmit: (filterValues: ITelemetryAdvancedFilters) => void;
  handleReset: () => void;
}

export const TelemetryAdvancedFiltersInitialValues: ITelemetryAdvancedFilters = {
  itis_tsns: []
};

const TelemetryListFilterForm: React.FC<ITelemetryListFilterFormProps> = (props) => {
  const formikRef = useRef<FormikProps<ITelemetryAdvancedFilters>>(null);

  const searchBackgroundColor = grey[50];

  //   const debounced = useMemo(
  //     () =>
  //       debounce((values: ITelemetryAdvancedFilters) => {
  //         props.handleSubmit(values);
  //       }, 300),
  //     [props]
  //   );

  return (
    <Box p={2} bgcolor={searchBackgroundColor}>
      <Formik innerRef={formikRef} initialValues={TelemetryAdvancedFiltersInitialValues} onSubmit={props.handleSubmit}>
        <SearchFilters
          fields={[
            <CustomTextField name="keyword" label="Keyword" other={{ placeholder: 'Type any keyword' }} />,
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
            />
          ]}
        />
      </Formik>
    </Box>
  );
};

export default TelemetryListFilterForm;
