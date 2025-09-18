import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { SURVEY_ROLE } from 'constants/roles';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ICodeWithDescription } from 'interfaces/useCodesApi.interface';
import { IPostSurveyMember } from 'interfaces/useSurveyApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { useEffect, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';

export const InviteSurveyMembersMemberForm = () => {
  const { values, setFieldValue } = useFormikContext<{ selectedMembers: IPostSurveyMember[] }>();
  const biohubApi = useBiohubApi();
  const codesLoader = useDataLoader(() => biohubApi.codes.getAllCodeSets());
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    codesLoader.load();
  }, [codesLoader]);

  const surveyRoles = codesLoader.data?.survey_roles || [];

  const clearErrors = () => {
    setErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors.participants;
      return newErrors;
    });
  };

  const handleAddUser = (user?: ISystemUser) => {
    if (!user) {
      return;
    }

    const newUserObject: IPostSurveyMember = {
      system_user_id: user.system_user_id,
      survey_role_name: SURVEY_ROLE.VIEWER,
      display_name: user.display_name,
      email: user.email,
      agency: user.agency,
      identity_source: user.identity_source,
      user_identifier: user.user_identifier,
      user_guid: user.user_guid,
      role_ids: [],
      record_end_date: null,
      role_names: []
    };

    setFieldValue('selectedMembers', [...values.selectedMembers, newUserObject]);
    clearErrors();
  };

  const handleAddUserRole = (roleLabel: string, index: number) => {
    const matchedRole = surveyRoles.find((r: ICodeWithDescription) => r.name === roleLabel)?.name;

    if (matchedRole && Object.values(SURVEY_ROLE).includes(matchedRole as SURVEY_ROLE)) {
      const updated = [...values.selectedMembers];
      updated[index] = {
        ...updated[index],
        survey_role_name: matchedRole as SURVEY_ROLE
      };
      setFieldValue('selectedMembers', updated);
      clearErrors();
    } else {
      // Set an error for the participant at this index
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        // Ensure participants is an array
        const participants = Array.isArray(newErrors.participants) ? [...newErrors.participants] : [];
        participants[index] = true;
        newErrors.participants = participants;
        return newErrors;
      });
    }
  };

  const handleRemoveUser = (systemUserId: number) => {
    const updated = values.selectedMembers.filter((user) => user.system_user_id !== systemUserId);
    setFieldValue('selectedMembers', updated);
    clearErrors();
  };

  const rowItemError = (index: number): string | undefined => {
    if (errors?.participants && Array.isArray(errors.participants)) {
      const errorAtIndex = errors.participants[index];
      if (errorAtIndex) {
        return 'Select a role for this team member.';
      }
    }
  };

  const getSelectedRole = (index: number): string => {
    return values.selectedMembers?.[index]?.survey_role_name || '';
  };

  return (
    <Box>
      <SystemUserAutocompleteField
        formikFieldName="system_user_id"
        label="Member"
        placeholder="Search by user"
        helpText="Only active users who have requested access to the Species Inventory Management System before can be invited"
        selectedUsers={values.selectedMembers.map((member) => member.system_user_id)}
        clearOnSelect
        onSelect={handleAddUser}
        key="project-user-filter"
      />

      <Box sx={{ '& .userRoleItemContainer + .userRoleItemContainer': { mt: 1 } }}>
        <TransitionGroup>
          {values.selectedMembers.map((user, index) => {
            const error = rowItemError(index);
            return (
              <Collapse key={user.system_user_id}>
                <UserRoleSelector
                  index={index}
                  user={user}
                  roles={surveyRoles}
                  error={
                    error ? <Typography style={{ fontSize: '12px', color: '#f44336' }}>{error}</Typography> : undefined
                  }
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
  );
};
