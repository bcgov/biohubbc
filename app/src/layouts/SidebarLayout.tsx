// components/layout/SidebarLayout.tsx
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
    <Stack direction="row" height="100%">
      {/* Sidebar */}
      <Box p={2} minWidth="300px">
        {sidebar}
      </Box>

      {/* Main Content */}
      <Box
        borderLeft={`1px solid ${grey[300]}`}
        boxSizing="border-box"
        flex="1 1 auto"
        display="flex"
        flexDirection="column">
        {/* Optional Header Toolbar */}
        {header && (
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${grey[300]}` }}>
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
