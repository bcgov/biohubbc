import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import CustomTextField from 'components/fields/CustomTextField';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';

import SearchFilters from 'features/summary/components/SearchFilters';
import { Formik, FormikProps } from 'formik';
import { useRef } from 'react';

export type ISurveyAdvancedFilters = {
  keyword?: string;
  start_date?: string;
  end_date?: string;
  person?: string;
};

export const SurveyAdvancedFiltersInitialValues: ISurveyAdvancedFilters = {
  keyword: undefined,
  start_date: undefined,
  end_date: undefined,
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

  const formikRef = useRef<FormikProps<ISurveyAdvancedFilters>>(null);

  return (
    <Box p={2} bgcolor={grey[50]}>
      <Formik
        innerRef={formikRef}
        initialValues={initialValues ?? SurveyAdvancedFiltersInitialValues}
        onSubmit={handleSubmit}>
        <SearchFilters
          fields={[
            <CustomTextField name="keyword" label="Keyword" other={{ placeholder: 'Search by keyword' }} />,
            <SpeciesAutocompleteField
              formikFieldName="itis_tsns"
              label="Species"
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
            <SystemUserAutocompleteField
              label="Person"
              placeholder="Find Projects that a person has access to"
              formikFieldName="system_user_id"
              showSelectedValue={true}
            />
          ]}
        />
      </Formik>
    </Box>
  );
};

export default SurveysListFilterForm;
