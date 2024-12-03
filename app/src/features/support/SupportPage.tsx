import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader'; // Ensure this import is correct
import { useState } from 'react';

export enum SupportPageView {
  GENERAL = 'GENERAL',
  FAQ = 'FAQ',
  CONTACT = 'CONTACT'
}

export interface ISupportPageView {
  label: string;
  value: SupportPageView;
}

const SupportPage = () => {
  const [currentView, setCurrentView] = useState(SupportPageView.GENERAL);

  const views: ISupportPageView[] = [
    { label: 'General', value: SupportPageView.GENERAL },
    { label: 'FAQ', value: SupportPageView.FAQ },
    { label: 'Contact', value: SupportPageView.CONTACT }
  ];

  return (
    <>
      {/* Add the PageHeader */}
      <PageHeader title="Support" />

      {/* Main Container */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction="row" gap={3} component={Paper} sx={{ p: 3 }}>
          {/* Sidebar for Navigation */}
          <Box width="300px" flexShrink={0}>
            <Stack gap={2}>
              {views.map((view) => (
                <Box
                  key={view.value}
                  onClick={() => setCurrentView(view.value)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: currentView === view.value ? 'primary.main' : 'grey.100',
                    color: currentView === view.value ? 'white' : 'black',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                  {view.label}
                </Box>
              ))}
            </Stack>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Main Content Area */}
          <Box flex="1 1 auto">
            {currentView === SupportPageView.GENERAL && (
              <Typography>Welcome to the General Information section. Start adding your content here.</Typography>
            )}
            {currentView === SupportPageView.FAQ && <Typography>Frequently Asked Questions will go here.</Typography>}
            {currentView === SupportPageView.CONTACT && (
              <Typography>Contact information and details go here.</Typography>
            )}
          </Box>
        </Stack>
      </Container>
    </>
  );
};

export default SupportPage;
