import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, MenuItem, Select } from '@mui/material';
import { ICode } from 'interfaces/useCodesApi.interface';
import { IGetProjectParticipant } from 'interfaces/useProjectApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import UserCard from './UserCard';

interface IUserRoleSelectorProps {
  index: number;
  user: ISystemUser | IGetProjectParticipant;
  selectedRole: string | undefined;
  roles: ICode[];
  error: JSX.Element | undefined;
  handleAdd: (role: string, index: number) => void;
  handleRemove: (id: number) => void;
}

const UserRoleSelector: React.FC<IUserRoleSelectorProps> = (props) => {
  const { index, selectedRole, user, roles, error, handleAdd, handleRemove } = props;

  return (
    <Box key={`${user.system_user_id}-${index}`}>
      <Box
        sx={{
          border: 1,
          borderRadius: 1,
          borderColor: error ? 'error.main' : 'grey.500'
        }}
        display={'flex'}
        mt={2}>
        <Box padding={2} flex={3}>
          <UserCard name={user.display_name} email={user.email} agency={user.agency} type={user.identity_source} />
        </Box>
        <Box padding={2} flex={1}>
          <Select
            sx={{ width: '100%' }}
            displayEmpty
            value={selectedRole}
            onChange={(event) => {
              handleAdd(String(event.target.value), index);
            }}>
            {roles.map((item) => (
              <MenuItem key={item.id} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box display={'flex'} padding={2}>
          <IconButton
            aria-label="remove user"
            onClick={() => {
              handleRemove(user.system_user_id);
            }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      {error}
    </Box>
  );
};

export default UserRoleSelector;
