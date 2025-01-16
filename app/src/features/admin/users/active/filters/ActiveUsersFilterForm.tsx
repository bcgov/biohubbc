import AutocompleteField from 'components/fields/AutocompleteField';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { useEffect, useMemo } from 'react';

export type IActiveUserFilters = {
  name?: string;
  system_user_id?: string;
  system_role?: string;
};

export const SurveyAdvancedFiltersInitialValues: IActiveUserFilters = {
  name: undefined,
  system_user_id: undefined,
  system_role: undefined
};

export interface IActiveUsersFilterFormProps {
  handleSubmit: (filterValues: IActiveUserFilters) => void;
}

/**
 * Filters for finding specific active users
 *
 * @param {IActiveUsersFilterFormProps} props
 * @return {*}
 */
const ActiveUsersFilterForm = (props: IActiveUsersFilterFormProps) => {
  const { handleSubmit } = props;

  const codesContext = useCodesContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, []);

  const roleOptions = useMemo(() => {
    return (
      codesContext.codesDataLoader.data?.system_roles.map((role) => ({
        label: role.name,
        value: role.id
      })) ?? []
    );
  }, [codesContext.codesDataLoader]);

  return (
    <Formik
      initialValues={SurveyAdvancedFiltersInitialValues}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
      validateOnMount={false}>
      {(formikProps) => (
        <FilterFieldsContainer
          fields={[
            <SystemUserAutocompleteField
              formikFieldName="system_user_id"
              label="User"
              onSelect={(value) => {
                if (value?.system_user_id) {
                  formikProps.setFieldValue('system_user_id', value.system_user_id);
                }
              }}
              onClear={() => {
                formikProps.setFieldValue('system_user_id', undefined);
              }}
              key="survey-user-filter"
            />,
            <AutocompleteField options={roleOptions} name="system_role" id="system_role" label="Role" />
          ]}
        />
      )}
    </Formik>
  );
};

export default ActiveUsersFilterForm;
