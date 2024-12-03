import { mdiAccountBox, mdiFormatListBulleted, mdiHelpCircle } from '@mdi/js';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { useState } from 'react';
import { StandardsToolbar } from '../standards/components/StandardsToolbar'; // Import StandardsToolbar

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
  icon: string;
}

interface IDataItem {
  label: string;
  description: string;
  unit?: string;
}

type DataMap = Partial<Record<SupportPageView, IDataItem[]>>;

const SupportPage = () => {
  const [currentView, setCurrentView] = useState<SupportPageView>(SupportPageView.GENERAL);

  const views: ISupportPageView[] = [
    { label: 'General', value: SupportPageView.GENERAL, icon: mdiHelpCircle },
    { label: 'Projects', value: SupportPageView.PROJECTS, icon: mdiHelpCircle },
    { label: 'Surveys', value: SupportPageView.SURVEYS, icon: mdiHelpCircle },
    { label: 'Techniques', value: SupportPageView.TECHNIQUES, icon: mdiHelpCircle },
    { label: 'Sites', value: SupportPageView.SITES, icon: mdiHelpCircle },
    { label: 'Animals', value: SupportPageView.ANIMALS, icon: mdiHelpCircle },
    { label: 'Telemetry', value: SupportPageView.TELEMETRY, icon: mdiHelpCircle },
    { label: 'Observations', value: SupportPageView.OBSERVATIONS, icon: mdiHelpCircle },
    { label: 'Attachments', value: SupportPageView.ATTACHMENTS, icon: mdiHelpCircle },
    { label: 'Standards', value: SupportPageView.STANDARDS, icon: mdiHelpCircle },
    { label: 'FAQ', value: SupportPageView.FAQ, icon: mdiFormatListBulleted },
    { label: 'Publishing', value: SupportPageView.PUBLISHING, icon: mdiHelpCircle },
    { label: 'Contact', value: SupportPageView.CONTACT, icon: mdiAccountBox }
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
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack direction="row" gap={3} component={Paper} sx={{ p: 3 }}>
        {/* Sidebar with StandardsToolbar */}
        <Box width="300px" flexShrink={0}>
          <StandardsToolbar views={views} currentView={currentView} setCurrentView={setCurrentView} />
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* Main Content Area */}
        <Box flex="1 1 auto">
          <Typography variant="h5" gutterBottom>
            {views.find((view) => view.value === currentView)?.label}
          </Typography>
          <Box
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: grey[300],
              borderRadius: '8px',
              bgcolor: grey[50]
            }}>
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
        </Box>
      </Stack>
    </Container>
  );
};

export default SupportPage;
