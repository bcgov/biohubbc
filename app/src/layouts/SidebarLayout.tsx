import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import { ReactNode } from 'react';

interface SidebarLayoutProps {
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}

export const SidebarLayout = ({ sidebar, header, children }: SidebarLayoutProps) => {
  return (
    <Stack
      component={Paper}
      direction="row"
      alignItems="stretch"
      sx={{
        minHeight: '70vh'
      }}>
      {/* Sidebar */}
      <Box
        sx={{
          minWidth: '300px',
          overflowY: 'auto',
          height: '100%'
        }}>
        {sidebar}
      </Box>

      <Divider flexItem orientation="vertical" />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
        {/* Optional Header */}
        {header && (
          <Toolbar
            disableGutters
            sx={{
              py: 0,
              px: 2,
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${grey[300]}`,
              flexShrink: 0
            }}>
            {header}
          </Toolbar>
        )}

        {/* Scrollable Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
          {children}
        </Box>
      </Box>
    </Stack>
  );
};
