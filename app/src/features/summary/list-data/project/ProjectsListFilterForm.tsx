import CustomTextField from 'components/fields/CustomTextField';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import { SystemRoleGuard } from 'components/security/Guards';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { SYSTEM_ROLE } from 'constants/roles';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';
import { useTaxonomyContext } from 'hooks/useContext';

export type IProjectAdvancedFilters = {
  keyword?: string;
  itis_tsn?: number;
  system_user_id?: string;
};

export const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
  keyword: undefined,
  itis_tsn: undefined,
  system_user_id: undefined
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

  const taxonomyContext = useTaxonomyContext();

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
              key="project-tsn-filter"
            />,
            <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <SystemUserAutocompleteField
                formikFieldName="system_user_id"
                label="User"
                placeholder="Search by user"
                onSelect={(value) => {
                  if (value?.system_user_id) {
                    formikProps.setFieldValue('system_user_id', value.system_user_id);
                  }
                }}
                onClear={() => {
                  formikProps.setFieldValue('system_user_id', undefined);
                }}
                key="project-user-filter"
              />
            </SystemRoleGuard>
          ]}
        />
      )}
    </Formik>
  );
};

export default ProjectsListFilterForm;
