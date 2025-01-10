import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Stack } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ThemeProvider } from '@mui/material/styles';
import appTheme from 'themes/appTheme';

export const ChecklistDialog = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  return (
    <ThemeProvider theme={appTheme}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        disableScrollLock
        sx={{
          '& .MuiDialog-paper': {
            position: 'fixed',
            bottom: 15,
            right: 15,
            margin: 0,
            width: '300px',
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h3" sx={{ textDecoration: 'underline' }}>
            Survey Checklist
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box>
            <Stack spacing={1}>
              <Typography>- Code in Variable checklists</Typography>
              <Typography>- Change formatting to match others</Typography>
              <Typography>- Open dialog as opposed to popup?</Typography>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            onClick={onClose}
            color="primary"
            variant="contained"
            sx={{ margin: '0 auto' }}
          >
            OK
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};
