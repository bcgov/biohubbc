import { Box, Paper, Stack, Toolbar } from '@mui/material';
import grey from '@mui/material/colors/grey';
import { ReactNode } from 'react';

interface SidebarLayoutProps {
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}

export const SidebarLayout = ({ sidebar, header, children }: SidebarLayoutProps) => {
  return (
    <Stack direction="row" gap={2} alignItems="flex-start">
      {/* Sidebar */}
      <Paper
        sx={{
          minWidth: '400px',
          maxHeight: '100vh',
          overflowY: 'auto',
          p: 2,
          flexShrink: 0
        }}>
        {sidebar}
      </Paper>

      {/* Main Content */}
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          height: '100%'
        }}>
        {/* Optional Header */}
        {header && (
          <Toolbar
            disableGutters
            sx={{
              px: 2,
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${grey[300]}`,
              flexShrink: 0
            }}>
            {header}
          </Toolbar>
        )}

        {/* Main Scrollable Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>{children}</Box>
      </Paper>
    </Stack>
  );
};
