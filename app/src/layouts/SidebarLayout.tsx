import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Paper, { PaperProps } from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import { ReactNode } from 'react';

interface SidebarLayoutProps extends PaperProps {
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}

export const SidebarLayout = ({ sidebar, header, children, ...paperProps }: SidebarLayoutProps) => {
  return (
    <Box component={Paper} display="flex" minHeight="70vh" {...paperProps} sx={{ ...paperProps.sx }}>
      {sidebar}

      <Divider flexItem orientation="vertical" />

      {/* Main content area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0 // ✅ this is crucial
        }}>
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

        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0 // ✅ ensures children like DataGrid can shrink
          }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
