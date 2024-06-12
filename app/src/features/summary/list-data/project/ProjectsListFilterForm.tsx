import CustomTextField from 'components/fields/CustomTextField';

import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { Formik, FormikProps } from 'formik';
import { useRef } from 'react';
import SearchFilters from '../../components/SearchFilters';

export type IProjectAdvancedFilters = {
  keyword?: string;
  start_date?: string;
  end_date?: string;
  person?: string;
};

export const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
  keyword: undefined,
  start_date: undefined,
  end_date: undefined,
  person: undefined
};

export interface IProjectsListFilterFormProps {
  handleSubmit: (filterValues: IProjectAdvancedFilters) => void;
  initialValues?: IProjectAdvancedFilters;
}

/**
 * Project advanced filters
 *
 * @param {IProjectsListFilterFormProps} props
 * @return {*}
 */
const ProjectsListFilterForm = (props: IProjectsListFilterFormProps) => {
  const { handleSubmit, initialValues } = props;

  const formikRef = useRef<FormikProps<IProjectAdvancedFilters>>(null);

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialValues ?? ProjectAdvancedFiltersInitialValues}
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
              formikRef.current?.submitForm();
            }}
            handleClear={() => {
              formikRef.current?.setFieldValue('itis_tsns', '');
              formikRef.current?.submitForm();
            }}
            clearOnSelect={true}
            showSelectedValue={true}
          />,
          <SystemUserAutocompleteField
            label="Person"
            placeholder="Search by user"
            formikFieldName="system_user_id"
            required={false}
            showSelectedValue={true}
          />
        ]}
      />
    </Formik>
  );
};

export default ProjectsListFilterForm;
