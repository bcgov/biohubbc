import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useTheme from '@mui/material/styles/useTheme';
import { AuthGuard, SystemRoleGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { SetStateAction } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import HeaderAuthenticated from '../components/HeaderAuthenticated';
import HeaderBrand from '../components/HeaderBrand';
import HeaderPublic from '../components/HeaderPublic';

interface IHeaderDesktopProps {
  setIsSupportDialogOpen: React.Dispatch<SetStateAction<boolean>>;
}

/**
 * Header for desktop (large screens) view
 *
 * @returns
 */
const HeaderDesktop = (props: IHeaderDesktopProps) => {
  const { setIsSupportDialogOpen } = props;
  const theme = useTheme();

  return (
    <Box display="flex" flexDirection="row" alignItems="center" justifyContent='space-between' flex='1 1 auto'>
      <Box
        sx={{
          '& a': {
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.primary.dark,
            fontSize: '18px',
            fontWeight: '400',
            textDecoration: 'none'
          }
        }}>
        <HeaderBrand />
      </Box>
      <Box
        display="flex"
        alignItems="center"
        sx={{
          '& a': {
            p: 1,
            color: theme.palette.text.primary,
            fontWeight: 700,
            lineHeight: 1.75,
            textDecoration: 'none'
          },
          '& a + a': {
            ml: 1
          },
          '& button': {
            fontSize: '16px',
            fontWeight: 400,
            textTransform: 'none'
          }
        }}>
        <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <RouterLink to="/admin/users" id="menu_admin_users">
            Manage Users
          </RouterLink>
        </SystemRoleGuard>
        <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <RouterLink to="/admin/funding-sources" id="menu_admin_funding_sources">
            Funding Sources
          </RouterLink>
        </SystemRoleGuard>
        <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <RouterLink to="/standards" id="menu_standards">
            Standards
          </RouterLink>
        </SystemRoleGuard>
        <Button
          color="inherit"
          variant="text"
          disableElevation
          onClick={() => {
            setIsSupportDialogOpen(true);
          }}
          sx={{
            m: '8px',
            p: 1
          }}>
          Support
        </Button>
      </Box>
      <Box>
        <UnAuthGuard>
          <HeaderPublic />
        </UnAuthGuard>
        <AuthGuard>
          <HeaderAuthenticated />
        </AuthGuard>
      </Box>
    </Box>
  );
};

export default HeaderDesktop;
