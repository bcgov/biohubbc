import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { useFormikContext } from 'formik';
import { ICodeWithDescription } from 'interfaces/useCodesApi.interface';
import { ICollectionParticipant, ICreateCollectionRequest } from 'interfaces/useCollectionApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { TransitionGroup } from 'react-transition-group';

interface IParticipantsCollectionFormProps {
  roles: ICodeWithDescription[];
  description?: string;
}

export const CollectionParticipantsFormInitialValues = {
  participants: []
};

const ParticipantsCollectionForm = (props: IParticipantsCollectionFormProps): JSX.Element => {
  const { handleSubmit, values, setFieldValue, errors, setErrors } = useFormikContext<ICreateCollectionRequest>();

  const handleAddUser = (user: ISystemUser) => {
    setFieldValue(`participants[${values.participants.length}]`, {
      system_user_id: user.system_user_id,
      display_name: user.display_name,
      email: user.email,
      agency: user.agency,
      identity_source: user.identity_source,
      collection_role_names: []
    });
    clearErrors();
  };

  const handleAddUserRole = (role: string, index: number) => {
    setFieldValue(`participants[${index}].collection_role_name`, role);
    clearErrors();
  };

  const handleRemoveUser = (systemUserId: number) => {
    const filteredUsers = values.participants.filter((item) => item.system_user_id !== systemUserId);

    setFieldValue(`participants`, filteredUsers);
    clearErrors();
  };

  const clearErrors = () => {
    const newErrors = { ...errors };
    delete errors.participants;

    setErrors(newErrors);
  };

  const alertBarText = (): { title: string; text: string } => {
    let title = '';
    let text = '';
    if (errors?.participants) {
      if (Array.isArray(errors.participants)) {
        title = 'Missing Roles';
        text = 'All team members must be assigned a role.';
      } else {
        if (values.participants.length > 0) {
          title = 'A coordinator role is required';
        } else {
          title = 'Missing Team Member';
        }
        text = errors.participants;
      }
    }

    return { title, text };
  };

  const rowItemError = (index: number): JSX.Element | undefined => {
    if (errors?.participants && Array.isArray(errors.participants)) {
      const errorAtIndex = errors.participants[index];
      if (errorAtIndex) {
        return (
          <Typography style={{ fontSize: '12px', color: '#f44336' }}>
            {errorAtIndex ? 'Select a role for this team member.' : ''}
          </Typography>
        );
      }
    }
  };

  const getSelectedRole = (index: number): string => {
    // users should only ever have a single role on a project so index: 0 is a safe selection
    return values.participants?.[index]?.collection_role_name || '';
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box component="fieldset">
        <Typography component="legend">Invite</Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          sx={{
            maxWidth: '72ch'
          }}>
          There must be at least one person with the Coordinator role.
        </Typography>
        {errors?.['participants'] && !values.participants.length && (
          <Box mt={3}>
            <AlertBar
              severity="error"
              variant="standard"
              title={'No team members added'}
              text={'At least one team member needs to be added to this project.'}
            />
          </Box>
        )}
        {errors?.['participants'] && values.participants.length > 0 && (
          <Box mt={3}>
            <AlertBar severity="error" variant="standard" title={alertBarText().title} text={alertBarText().text} />
          </Box>
        )}
        <Box mt={3}>
          <SystemUserAutocompleteField
            formikFieldName="system_user_id"
            label="Team Member"
            placeholder="Search by user"
            helpText={`Only active users who have requested access to the Species Inventory Management System before can be invited`}
            selectedUsers={values.participants.map((participant) => participant.system_user_id)}
            clearOnSelect
            onSelect={(value) => {
              if (value) {
                handleAddUser(value);
              }
            }}
            key="project-user-filter"
          />
        </Box>
        <Box>
          <Box
            sx={{
              '& .userRoleItemContainer + .userRoleItemContainer': {
                mt: 1
              }
            }}>
            <TransitionGroup>
              {values.participants.map((user, index: number) => {
                const error = rowItemError(index);
                return (
                  <Collapse
                    key={
                      'project_participation_id' in user
                        ? `${user.project_participation_id}-${user.system_user_id}`
                        : user.system_user_id
                    }>
                    <UserRoleSelector
                      index={index}
                      user={user as ICollectionParticipant}
                      roles={props.roles}
                      description={props.description}
                      error={error}
                      selectedRole={getSelectedRole(index)}
                      handleAdd={handleAddUserRole}
                      handleRemove={handleRemoveUser}
                      key={user.system_user_id}
                      label={'Select a Role'}
                    />
                  </Collapse>
                );
              })}
            </TransitionGroup>
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default ParticipantsCollectionForm;
