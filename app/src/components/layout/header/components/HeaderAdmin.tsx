import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { SetStateAction } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface IHeaderAdminProps {
  setIsAdminHeaderOpen: React.Dispatch<SetStateAction<boolean>>;
}

/**
 * Admin header for desktop (large screens) view
 *
 * @returns
 */
const HeaderAdmin = (props: IHeaderAdminProps) => {
  const theme = useTheme();

  return (
    <Box display="flex" justifyContent="space-between" bgcolor={grey[50]}>
      <Box
        py={1}
        display="flex"
        alignItems="center"
        mx={3}
        sx={{
          '& a': {
            padding: 1,
            color: theme.palette.text.primary,
            fontWeight: 700,
            lineHeight: 1.75,
            textDecoration: 'none',
            marginLeft: 1
          },
          '& a:first-of-type': {
            marginLeft: 0
          },
          '& button': {
            fontSize: '16px',
            fontWeight: 400,
            textTransform: 'none'
          }
        }}>
        <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <RouterLink
            to="/admin/users"
            id="menu_admin_users"
            onClick={() => {
              props.setIsAdminHeaderOpen(false);
            }}>
            Manage Users
          </RouterLink>
        </SystemRoleGuard>
        <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <RouterLink
            to="/admin/funding-sources"
            id="menu_admin_funding_sources"
            onClick={() => {
              props.setIsAdminHeaderOpen(false);
            }}>
            Funding Sources
          </RouterLink>
        </SystemRoleGuard>
        <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <RouterLink
            to="/standards"
            id="menu_standards"
            onClick={() => {
              props.setIsAdminHeaderOpen(false);
            }}>
            Standards
          </RouterLink>
        </SystemRoleGuard>
      </Box>
      <Box p={2}>
        <IconButton
          onClick={() => {
            props.setIsAdminHeaderOpen(false);
          }}
          color="primary"
          aria-label="close admin navigation bar">
          <Icon path={mdiClose} size={1} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default HeaderAdmin;
