import { Box, Stack, Toolbar } from '@mui/material';
import grey from '@mui/material/colors/grey';
import { ReactNode } from 'react';

interface SidebarLayoutProps {
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}

export const SidebarLayout = ({ sidebar, header, children }: SidebarLayoutProps) => {
  return (
    <Stack direction="row">
      <Box p={2} minWidth="300px" sx={{ overflowY: 'auto' }}>
        {sidebar}
      </Box>
      {/* Main Content */}
      <Box
        borderLeft={`1px solid ${grey[300]}`}
        boxSizing="border-box"
        flex="1 1 auto"
        display="flex"
        flexDirection="column"
        sx={{
          overflow: 'hidden'
        }}>
        {/* Optional Header Toolbar */}
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

        {/* Main Content Area */}
        <Box flex="1 1 auto" overflow="auto">
          {children}
        </Box>
      </Box>
    </Stack>
  );
};
