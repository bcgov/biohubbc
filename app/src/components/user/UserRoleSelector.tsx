import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, MenuItem, Paper, Select } from '@mui/material';
import { ICode } from 'interfaces/useCodesApi.interface';
import { IGetProjectParticipant } from 'interfaces/useProjectApi.interface';
import { IGetSurveyParticipant } from 'interfaces/useSurveyApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import UserCard from './UserCard';

interface IUserRoleSelectorProps {
  index: number;
  user: ISystemUser | IGetProjectParticipant | IGetSurveyParticipant;
  selectedRole: string | undefined;
  roles: ICode[];
  error: JSX.Element | undefined;
  handleAdd: (role: string, index: number) => void;
  handleRemove: (id: number) => void;
}

const UserRoleSelector: React.FC<IUserRoleSelectorProps> = (props) => {
  const { index, selectedRole, user, roles, error, handleAdd, handleRemove } = props;

  return (
    <Box
      className="userRoleItemContainer"
      sx={{
        '& .userRoleItem + p': {
          pt: 1,
          pl: 2
        }
      }}>
      <Paper
        variant="outlined"
        className="userRoleItem"
        sx={{
          borderColor: error ? 'error.main' : 'grey.400'
        }}>
        <Box display="flex" alignItems="center" px={2} py={1.5}>
          <Box flex="1 1 auto">
            <UserCard name={user.display_name} email={user.email} agency={user.agency} type={user.identity_source} />
          </Box>
          <Box flex="0 0 auto">
            <Select
              size="small"
              sx={{ width: '200px' }}
              displayEmpty
              value={selectedRole}
              onChange={(event) => {
                handleAdd(String(event.target.value), index);
              }}
              renderValue={(selected) => {
                if (!selected) {
                  return 'Select a Role';
                }
                return selected;
              }}>
              {roles.map((item) => (
                <MenuItem key={item.id} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
            <IconButton
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
