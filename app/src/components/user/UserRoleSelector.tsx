import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, MenuItem, Select } from '@mui/material';
import { ICode } from 'interfaces/useCodesApi.interface';
import { ISearchUserResponse } from 'interfaces/useUserApi.interface';
import { useState } from 'react';
import UserCard from './UserCard';

interface IUserRoleSelectorProps {
  index: number;
  systemUser: ISearchUserResponse;
  roles: ICode[];
  error: JSX.Element | undefined;
  handleAdd: (id: number, role: string, index: number) => void;
  handleRemove: (id: number) => void;
}

const UserRoleSelector: React.FC<IUserRoleSelectorProps> = (props) => {
  const { index, systemUser, roles, error, handleAdd, handleRemove } = props;
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
  return (
    <>
      <Box display={'flex'} mt={2}>
        <Box flex={3}>
          <UserCard
            name={systemUser.display_name}
            email={systemUser.email}
            agency={systemUser.agency}
            type={systemUser.identity_source}
          />
        </Box>
        <Box flex={1}>
          <Select
            sx={{ width: '100%' }}
            displayEmpty
            value={selectedRole}
            onChange={(event) => {
              setSelectedRole(String(event.target.value));
              handleAdd(systemUser.system_user_id, String(event.target.value), index);
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
              handleRemove(systemUser.system_user_id);
            }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      {error}
    </>
  );
};

export default UserRoleSelector;
