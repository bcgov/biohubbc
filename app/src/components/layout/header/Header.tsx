import { Collapse, Divider } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import HeaderAdmin from './components/HeaderAdmin';
import HeaderMenu from './components/HeaderMenu';
import HeaderDesktop from './desktop/HeaderDesktop';
import HeaderResponsive from './responsive/HeaderResponsive';

const Header = () => {
  // Support dialog that appears when Support button is clicked
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);

  // Admin-only collapsible menu for admin-only routes
  const [isAdminHeaderOpen, setIsAdminHeaderOpen] = useState(false);

  // Collapsible menu for authenticated users
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

  return (
    <>
      <AppBar
        position="relative"
        elevation={0}
        sx={{
          fontFamily: 'BCSans, Verdana, Arial, sans-serif',
          backgroundColor: '#fff',
          borderBottom: '3px solid #fcba19'
        }}>
        <Container maxWidth={'xl'} sx={{ py: 0.5 }}>
          {/* RESPONSIVE VIEW FOR SMALL SCREENS */}
          <Box display={{ xs: 'flex', md: 'none' }}>
            <HeaderResponsive
              isSupportDialogOpen={isSupportDialogOpen}
              setIsAdminHeaderOpen={setIsAdminHeaderOpen}
              setIsSupportDialogOpen={setIsSupportDialogOpen}
              setIsHeaderMenuOpen={setIsHeaderMenuOpen}
            />
          </Box>

          {/* DESKTOP VIEW FOR LARGE SCREENS */}
          <Box flex="1 1 auto" display={{ xs: 'none', md: 'flex', justifyContent: 'space-between' }}>
            <HeaderDesktop
              setIsSupportDialogOpen={setIsSupportDialogOpen}
              setIsAdminHeaderOpen={setIsAdminHeaderOpen}
              setIsHeaderMenuOpen={setIsHeaderMenuOpen}
            />
          </Box>

          {/* SUPPORT DIALOG */}
          <Dialog open={isSupportDialogOpen}>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogContent>
              <Typography variant="body1" component="div" color="textSecondary">
                For technical support or questions about this application, please email &zwnj;
                <a href="mailto:biohub@gov.bc.ca?subject=Support Request - Species Inventory Management System">
                  biohub@gov.bc.ca
                </a>
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsSupportDialogOpen(false);
                }}>
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </Container>

        {/* EXPANDED ADMIN HEADER FOR ADMIN ROUTES */}
        <TransitionGroup>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Collapse in={isAdminHeaderOpen}>
              <Divider />
              <HeaderAdmin setIsAdminHeaderOpen={setIsAdminHeaderOpen} />
            </Collapse>
          </SystemRoleGuard>
        </TransitionGroup>

        {/* EXPANDED MENU VIEW FOR AUTHENTICATED USERS (NON-ADMIN) */}
        <TransitionGroup>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Collapse in={isHeaderMenuOpen}>
              <Divider />
              <HeaderMenu setIsHeaderMenuOpen={setIsHeaderMenuOpen} />
            </Collapse>
          </SystemRoleGuard>
        </TransitionGroup>
      </AppBar>
    </>
  );
};

export default Header;
