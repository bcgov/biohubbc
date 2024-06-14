import CustomTextField from 'components/fields/CustomTextField';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';

export type IProjectAdvancedFilters = {
  keyword?: string;
  itis_tsn?: number;
  person?: string;
};

export const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
  keyword: undefined,
  itis_tsn: undefined,
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

  return (
    <Formik
      initialValues={initialValues ?? ProjectAdvancedFiltersInitialValues}
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
              key="project-keyword-filter"
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
              key="project-tsn-filter"
            />,
            <SystemUserAutocompleteField
              formikFieldName="system_user_id"
              label="Person"
              placeholder="Search by user"
              onSelect={(value) => {
                if (value?.system_user_id) {
                  formikProps.setFieldValue('system_user_id', value.system_user_id);
                }
              }}
              onClear={() => {
                formikProps.setFieldValue('system_user_id', undefined);
              }}
              key="project-person-filter"
            />
          ]}
        />
      )}
    </Formik>
  );
};

export default ProjectsListFilterForm;
