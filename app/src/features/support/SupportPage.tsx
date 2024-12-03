import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { useState } from 'react';

export enum SupportPageView {
  GENERAL = 'GENERAL',
  PROJECTS = 'PROJECTS',
  SURVEYS = 'SURVEYS',
  TECHNIQUES = 'TECHNIQUES',
  SITES = 'SITES',
  ANIMALS = 'ANIMALS',
  TELEMETRY = 'TELEMETRY',
  OBSERVATIONS = 'OBSERVATIONS',
  ATTACHMENTS = 'ATTACHMENTS',
  STANDARDS = 'STANDARDS',
  FAQ = 'FAQ',
  PUBLISHING = 'PUBLISHING',
  CONTACT = 'CONTACT'
}

export interface ISupportPageView {
  label: string;
  value: SupportPageView;
}

interface IDataItem {
  label: string;
  description: string;
  unit?: string; // Optional
}

type DataMap = Partial<Record<SupportPageView, IDataItem[]>>;

const SupportPage = () => {
  const [currentView, setCurrentView] = useState(SupportPageView.GENERAL);

  const views: ISupportPageView[] = [
    { label: 'General', value: SupportPageView.GENERAL },
    { label: 'Projects', value: SupportPageView.PROJECTS },
    { label: 'Surveys', value: SupportPageView.SURVEYS },
    { label: 'Techniques', value: SupportPageView.TECHNIQUES },
    { label: 'Sites', value: SupportPageView.SITES },
    { label: 'Animals', value: SupportPageView.ANIMALS },
    { label: 'Telemetry', value: SupportPageView.TELEMETRY },
    { label: 'Observations', value: SupportPageView.OBSERVATIONS },
    { label: 'Attachments', value: SupportPageView.ATTACHMENTS },
    { label: 'Standards', value: SupportPageView.STANDARDS },
    { label: 'FAQ', value: SupportPageView.FAQ },
    { label: 'Publishing', value: SupportPageView.PUBLISHING },
    { label: 'Contact', value: SupportPageView.CONTACT }
  ];

  const dataMap: DataMap = {
    [SupportPageView.GENERAL]: [
      { label: 'Introduction', description: 'Learn the basics of using this system.', unit: 'Info' },
      { label: 'Getting Started', description: 'Step-by-step guide to begin using SIMS.', unit: 'Guide' }
    ],
    [SupportPageView.FAQ]: [
      { label: 'How to create a project?', description: 'Details about creating and managing projects.' },
      { label: 'How to add team members?', description: 'Learn how to invite and manage team members.' }
    ],
    [SupportPageView.PROJECTS]: [
      { label: 'Creating Projects', description: 'How to create and manage projects.', unit: 'Projects' }
    ],
    [SupportPageView.SURVEYS]: [
      { label: 'Survey Management', description: 'How to design and use surveys.', unit: 'Surveys' }
    ]

  };

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
            <Typography variant="h5" gutterBottom>
              {views.find((view) => view.value === currentView)?.label}
            </Typography>
            <Stack gap={2}>
              {dataMap[currentView]?.map((item: IDataItem, index: number) => (
                <AccordionStandardCard
                  key={index}
                  label={item.label}
                  subtitle={item.description}
                  ornament={item.unit ? <Box>{item.unit}</Box> : undefined}
                  colour={grey[100]}
                />

              )) || <Typography>No content available for this section.</Typography>}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </>
  );
};

export default SupportPage;
