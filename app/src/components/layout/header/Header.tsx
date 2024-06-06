import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import HeaderDesktop from './desktop/HeaderDesktop';
import HeaderResponsive from './responsive/HeaderResponsive';

const Header = () => {
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);

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
          <Box display={{ xs: 'flex', lg: 'none' }}>
            <HeaderResponsive
              isSupportDialogOpen={isSupportDialogOpen}
              setIsSupportDialogOpen={setIsSupportDialogOpen}
            />
          </Box>

          {/* DESKTOP VIEW FOR LARGE SCREENS */}
          <Box flex="1 1 auto" display={{ xs: 'none', lg: 'flex', justifyContent: 'space-between' }}>
            <HeaderDesktop setIsSupportDialogOpen={setIsSupportDialogOpen} />
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
      </AppBar>
    </>
  );
};

export default Header;
