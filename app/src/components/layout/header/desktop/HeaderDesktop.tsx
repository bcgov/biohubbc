import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import { AuthGuard, UnAuthGuard } from 'components/security/Guards';
import { SetStateAction } from 'react';
import HeaderAuthenticated from '../components/HeaderAuthenticated';
import HeaderBrand from '../components/HeaderBrand';
import HeaderPublic from '../components/HeaderPublic';

interface IHeaderDesktopProps {
  setIsSupportDialogOpen: React.Dispatch<SetStateAction<boolean>>;
  setIsAdminHeaderOpen: React.Dispatch<SetStateAction<boolean>>;
  setIsHeaderMenuOpen: React.Dispatch<SetStateAction<boolean>>;
}

/**
 * Header for desktop (large screens) view
 *
 * @returns
 */
const HeaderDesktop = (props: IHeaderDesktopProps) => {
  const { setIsAdminHeaderOpen, setIsHeaderMenuOpen } = props;

  const theme = useTheme();

  return (
    <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" flex="1 1 auto">
      <Box
        sx={{
          '& a': {
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.primary.main,
            fontSize: '18px',
            fontWeight: 400,
            textDecoration: 'none'
          }
        }}>
        <HeaderBrand />
      </Box>
      <Box>
        <UnAuthGuard>
          <HeaderPublic />
        </UnAuthGuard>
        <AuthGuard>
          <HeaderAuthenticated setIsAdminHeaderOpen={setIsAdminHeaderOpen} setIsHeaderMenuOpen={setIsHeaderMenuOpen}/>
        </AuthGuard>
      </Box>
    </Box>
  );
};

export default HeaderDesktop;
