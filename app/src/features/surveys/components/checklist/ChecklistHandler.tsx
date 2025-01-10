import ReactDOM from 'react-dom';
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { Typography, Box, Stack } from '@mui/material';
import appTheme from 'themes/appTheme';

export const openChecklist = () => {
  let popup = document.getElementById('checklistPopup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'checklistPopup';
    popup.style.cssText = `
      position: fixed;
      bottom: 50px;
      right: 5px;
      transform: translate(-10%, -10%);
      width: 300px;
      z-index: 1000;
    `;

    const PopupContent = () => {
      const handleClose = () => {
        if (popup) {
          document.body.removeChild(popup);
        }
      };

      return (
        <ThemeProvider theme={appTheme}>
          <Box
            sx={{
              background: 'white',
              padding: 2,
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h3" gutterBottom sx={{ textDecoration: 'underline' }}>
              Survey Checklist
            </Typography>
            <Stack spacing={1} component="div">
              <Typography>- Code in Variable checklists</Typography>
              <Typography>- Change formatting to match others</Typography>
              <Typography>- Open dialog as opposed to popup?</Typography>
            </Stack>
            <LoadingButton
              loading={false}
              onClick={handleClose}
              sx={{
                display: 'block',
                margin: '10px auto',
              }}
              color="primary"
              variant="contained"
            >
              <strong>OK</strong>
            </LoadingButton>
          </Box>
        </ThemeProvider>
      );
    };

    ReactDOM.render(<PopupContent />, popup);

    document.body.appendChild(popup);
  }
};
