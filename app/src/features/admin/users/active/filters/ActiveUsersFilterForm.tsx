import AutocompleteField from 'components/fields/AutocompleteField';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import { FilterFieldsContainer } from 'features/summary/components/FilterFieldsContainer';
import { Formik } from 'formik';
import { useCodesContext } from 'hooks/useContext';
import { useEffect, useMemo } from 'react';

export type IActiveUserFilters = {
  system_user_ids?: string[];
  system_roles?: string[];
};

export const ActiveUserFiltersInitialValues: IActiveUserFilters = {
  system_user_ids: [],
  system_roles: []
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
  }, [codesContext.codesDataLoader]);

  const roleOptions = useMemo(() => {
    return (
      codesContext.codesDataLoader.data?.system_roles.map((role) => ({
        label: role.name,
        // Name is intentionally used as both value and label
        value: role.name
      })) ?? []
    );
  }, [codesContext.codesDataLoader]);

  return (
    <Formik
      initialValues={ActiveUserFiltersInitialValues}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
      validateOnMount={false}>
      {(formikProps) => (
        <FilterFieldsContainer
          fields={[
            <SystemUserAutocompleteField
              key="system-user-filter"
              formikFieldName="system_user_id"
              label="User"
              onSelect={(value) => {
                if (!value?.system_user_id) {
                  // No change if value is undefined
                  formikProps.setFieldValue('system_user_ids', []);
                  return;
                }

                formikProps.setFieldValue('system_user_ids', [
                  ...(formikProps.values.system_user_ids ?? []),
                  value.system_user_id
                ]);
              }}
              onClear={() => {
                formikProps.setFieldValue('system_user_ids', []);
              }}
            />,
            <AutocompleteField
              options={roleOptions}
              key="system-role-filter"
              name="system_roles"
              id="system_roles"
              label="Role"
              onInputChange={(event) => {
                formikProps.setFieldValue('system_roles', [
                  ...(formikProps.values.system_roles ?? []),
                  event.currentTarget
                ]);
              }}
            />
          ]}
        />
      )}
    </Formik>
  );
};

export default ActiveUsersFilterForm;
