import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { useFormikContext } from 'formik';
import { ICodeWithDescription } from 'interfaces/useCodesApi.interface';
import { ICreateSurveyRequest, ISurveyMember } from 'interfaces/useSurveyApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

export const SurveyMembersYupSchema = yup.object().shape({
  members: yup.array().of(
    yup.object().shape({
      system_user_id: yup.string().required('Username is required'),
      survey_role_name: yup.string().required('Select a survey role for this team member')
    })
  )
});

interface ISurveyMembersFormProps {
  roles: ICodeWithDescription[];
}

export const SurveyMembersFormInitialValues = {
  members: []
};

/**
 * Form for adding members to a survey, granting them permissions to view the survey
 *
 * @param {ISurveyMembersFormProps} props
 */
export const SurveyMembersForm = (props: ISurveyMembersFormProps) => {
  const { handleSubmit, values, setFieldValue, errors, setErrors } = useFormikContext<ICreateSurveyRequest>();

  const handleAddUser = (user: ISystemUser | ISurveyMember) => {
    setFieldValue(`members[${values.members.length}]`, {
      system_user_id: user.system_user_id,
      display_name: user.display_name,
      email: user.email,
      agency: user.agency,
      identity_source: user.identity_source,
      survey_role_name: ''
    });
    clearErrors();
  };

  const handleAddUserRole = (survey_role_name: string, index: number) => {
    setFieldValue(`members[${index}].survey_role_name`, survey_role_name);
    clearErrors();
  };

  const handleRemoveUser = (systemUserId: number) => {
    const filteredUsers = values.members.filter(
      (item: ISystemUser | ISurveyMember) => item.system_user_id !== systemUserId
    );

    setFieldValue(`members`, filteredUsers);
    clearErrors();
  };

  const clearErrors = () => {
    setErrors({ ...errors, members: undefined });
  };

  const rowItemError = (index: number): JSX.Element | undefined => {
    if (errors?.members && Array.isArray(errors.members)) {
      const errorAtIndex = errors.members[index];
      if (errorAtIndex) {
        return (
          <Typography style={{ fontSize: '12px', color: '#f44336' }}>
            {errorAtIndex ? 'Select a survey role for this team member.' : ''}
          </Typography>
        );
      }
    }
  };

  const getSelectedRole = (index: number): string => {
    // users should only ever have a single role on a project so index: 0 is a safe selection
    return values.members?.[index]?.survey_role_name || '';
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors?.['members'] && !Array.isArray(errors['members']) && (
        <Box my={3}>
          <AlertBar severity="error" variant="outlined" title="Missing Invites" text={errors['members']} />
        </Box>
      )}
      <SystemUserAutocompleteField
        formikFieldName="members"
        label="Members"
        helpText="Only active users who have requested access to the Species Inventory Management System before can be invited"
        selectedUsers={values.members.map((member) => member.system_user_id)}
        clearOnSelect
        onSelect={(value) => {
          if (value) {
            handleAddUser(value);
          }
        }}
      />
      <Box>
        <Box
          sx={{
            '& .userRoleItemContainer + .userRoleItemContainer': {
              mt: 1
            }
          }}>
          <TransitionGroup>
            {values.members.map((user: ISystemUser | ISurveyMember, index: number) => {
              const error = rowItemError(index);
              return (
                <Collapse key={user.system_user_id}>
                  <UserRoleSelector
                    index={index}
                    user={user}
                    roles={props.roles}
                    error={error}
                    selectedRole={getSelectedRole(index)}
                    handleAdd={handleAddUserRole}
                    handleRemove={handleRemoveUser}
                    label="Select a Role"
                  />
                </Collapse>
              );
            })}
          </TransitionGroup>
        </Box>
      </Box>
    </form>
  );
};
