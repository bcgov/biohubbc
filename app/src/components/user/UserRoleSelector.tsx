import { mdiAccountEdit, mdiClose, mdiCrown } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import { ICode } from 'interfaces/useCodesApi.interface';
import { IGetProjectParticipant } from 'interfaces/useProjectApi.interface';
import { IGetSurveyParticipant } from 'interfaces/useSurveyApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import UserCard from './UserCard';

interface IUserRoleSelectorProps {
  index: number;
  user: ISystemUser | IGetProjectParticipant | IGetSurveyParticipant;
  selectedRole: string;
  roles: ICode[];
  error: JSX.Element | undefined;
  handleAdd: (role: string, index: number) => void;
  handleRemove: (id: number) => void;
  label: string;
}

const UserRoleSelector: React.FC<IUserRoleSelectorProps> = (props) => {
  const { index, selectedRole, user, roles, error, handleAdd, handleRemove } = props;

  return (
    <Box mt={1} className="userRoleItemContainer">
      <Paper
        variant="outlined"
        sx={{
          background: grey[100],
          ...(error
            ? {
                '& + p': {
                  pt: 0.75,
                  pb: 0.75,
                  pl: 2
                }
              }
            : undefined)
        }}>
        <Box display="flex" alignItems="center" px={2} py={1.5}>
          <Box flex="1 1 auto">
            <UserCard name={user.display_name} email={user.email} agency={user.agency} type={user.identity_source} />
          </Box>
          <Box flex="0 0 auto">
            <Select
              size="small"
              inputProps={{
                'aria-label': 'Select a role'
              }}
              error={Boolean(props.error)}
              data-testid={`select-user-role-button-${index}`}
              sx={{ width: '200px', backgroundColor: '#fff' }}
              displayEmpty
              value={selectedRole}
              onChange={(event) => {
                handleAdd(String(event.target.value), index);
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return props.label;
                }
                return selected;
              }}>
              {roles.map((item) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                  {item.name == 'Coordinator' && (
                    <>
                      &nbsp;
                      <Icon path={mdiCrown} size={0.75} color={grey[600]} />
                    </>
                  )}
                  {item.name == 'Collaborator' && (
                    <>
                      &nbsp;
                      <Icon path={mdiAccountEdit} size={0.75} color={grey[600]} />
                    </>
                  )}
                </MenuItem>
              ))}
            </Select>
            <IconButton
              data-testid={`remove-user-role-button-${index}`}
              sx={{
                ml: 2
              }}
              aria-label="remove user from project team"
              onClick={() => {
                handleRemove(user.system_user_id);
              }}>
              <Icon path={mdiClose} size={1}></Icon>
            </IconButton>
          </Box>
        </Box>
      </Paper>
      {error}
    </Box>
  );
};

export default UserRoleSelector;
