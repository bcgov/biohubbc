import {
  mdiCardAccountMailOutline,
  mdiDatabaseRefreshOutline,
  mdiEye,
  mdiLifebuoy,
  mdiOfficeBuildingCogOutline,
  mdiPaw,
  mdiWall,
  mdiWifiMarker
} from '@mdi/js';
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
import { StandardsToolbar } from '../standards/components/StandardsToolbar';

export enum SupportPageView {
  GENERAL = 'GENERAL',
  STRUCTURE = 'STRUCTURE',
  FOUNDATION = 'FOUNDATION',
  DATA_STANDARDS = 'DATA STANDARDS',
  ANIMALS = 'ANIMALS',
  TELEMETRY = 'TELEMETRY',
  OBSERVATIONS = 'OBSERVATIONS',
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

// Text variables to make editing easier 
const generalText = 
  'Placeholder for the general text';

const structureText =
  'Learn about the SIMS framework: a comprehensive system for managing fish and wildlife data. Collaborate across organizations to standardize data collection and analysis.';

const foundationText = 
  'Place holder where we will store the static text for the foundational data section';

const standardsText =
  'Place holder where we will store the static text for the data standards section sdfkn ldkfn sdlkn fsldkn flskd fnlskdnf klsndf klsdnflkn slkn flskd nlsk fnsldk fnsld';

const observationText =
  'Place holder where we will store the static text for the observations section sdfkn ldkfn sdlkn fsldkn flskd fnlskdnf klsndf klsdnflkn slkn flskd nlsk fnsldk fnsld';

const animalText =
  'Place holder where we will store the static text for the observations section sdfkn ldkfn sdlkn fsldkn flskd fnlskdnf klsndf klsdnflkn slkn flskd nlsk fnsldk fnsld';

const telemetryText =
  'Place holder where we will store the static text for the observations section sdfkn ldkfn sdlkn fsldkn flskd fnlskdnf klsndf klsdnflkn slkn flskd nlsk fnsldk fnsld';

  const contactText =
  'Place holder where we will store the static text for the Contact section sdfkn ldkfn sdlkn fsldkn flskd fnlskdnf klsndf klsdnflkn slkn flskd nggfgfgfgfgflsk fnsldk fnsld';

// mapping the above text variables to the page view
const textMap: Record<SupportPageView, string> = {
  [SupportPageView.GENERAL]: generalText,
  [SupportPageView.STRUCTURE]: structureText,
  [SupportPageView.FOUNDATION]: foundationText,
  [SupportPageView.DATA_STANDARDS]: standardsText,
  [SupportPageView.OBSERVATIONS]: observationText,
  [SupportPageView.ANIMALS]: animalText,
  [SupportPageView.TELEMETRY]: telemetryText,
  [SupportPageView.CONTACT]: contactText
};

const SupportPage = () => {
  const [currentView, setCurrentView] = useState<SupportPageView>(SupportPageView.GENERAL);

  const views: ISupportPageView[] = [
    { label: 'General', value: SupportPageView.GENERAL, icon: mdiLifebuoy },
    { label: 'SIMS Structure', value: SupportPageView.STRUCTURE, icon: mdiOfficeBuildingCogOutline },
    { label: 'Foundational Data', value: SupportPageView.FOUNDATION, icon: mdiWall },
    { label: 'Data Standards', value: SupportPageView.DATA_STANDARDS, icon: mdiDatabaseRefreshOutline },
    { label: 'Observations', value: SupportPageView.OBSERVATIONS, icon: mdiEye },
    { label: 'ANIMAL', value: SupportPageView.ANIMALS, icon: mdiPaw },
    { label: 'TELEMETRY', value: SupportPageView.TELEMETRY, icon: mdiWifiMarker },
    { label: 'CONTACT', value: SupportPageView.CONTACT, icon: mdiCardAccountMailOutline }
  ];

  const dataMap: DataMap = {
    [SupportPageView.GENERAL]: [
      { label: 'SIMS objectives', description: 'Step-by-step guide to begin using SIMS' },
      { label: 'Appropriate Use of SIMS', description: 'Step-by-step guide to begin using SIMS' },
      { label: 'Who should use SIMS', description: 'Step-by-step guide to begin using SIMS' },
      { label: 'User roles in SIMS', description: 'Step-by-step guide to begin using SIMS' },
      { label: 'Data Structure in SIMS', description: 'Step-by-step guide to begin using SIMS.' },
      { label: 'FAQ', description: 'Step-by-step guide to begin using SIMS' }
    ],
    [SupportPageView.STRUCTURE]: [
      { label: 'Projects', description: 'How to create and manage projects.' },
      { label: 'Surveys', description: 'How to create and manage projects.' },
      { label: 'Observations', description: 'How to create and manage projects.' },
      { label: 'When to use projects and surveys', description: 'How to create and manage projects.' },
      { label: 'Creating Projects', description: 'How to create and manage projects.' },
      { label: 'FAQ', description: 'How to create and manage projects.' }
    ],
    [SupportPageView.FOUNDATION]: [
      { label: 'Sites', description: 'Details about creating and managing projects.' },
      { label: 'Techniques', description: 'Learn how to invite and manage team members.' },
      { label: 'Attachments', description: 'Learn how to invite and manage team members.' },
      { label: 'Blocks', description: 'How to create and manage projects.' },
      { label: 'Strata', description: 'How to create and manage projects.' },
      { label: 'FAQ', description: 'How to create and manage projects.' }
    ],
    [SupportPageView.DATA_STANDARDS]: [
      { label: 'Standards', description: 'Details about creating and managing projects.' },
      { label: 'How to add team members?', description: 'Learn how to invite and manage team members.' },
      { label: 'ITIS', description: 'Learn how to invite and manage team members.' },
      { label: 'Security', description: 'Learn how to invite and manage team members.' },
      { label: 'FAQ', description: 'Learn how to invite and manage team members.' }
    ],
    [SupportPageView.OBSERVATIONS]: [
      { label: 'How to create a project?', description: 'Details about creating and managing projects.' },
      { label: 'How to add team members?', description: 'Learn how to invite and manage team members.' },
      { label: 'FAQ', description: 'Learn how to invite and manage team members.' }
    ],
    [SupportPageView.ANIMALS]: [
      { label: 'Survey Management', description: 'How to design and use surveys.', unit: 'Surveys' }
    ],
    [SupportPageView.TELEMETRY]: [
      { label: 'Survey Management', description: 'How to design and use surveys.', unit: 'Surveys' }
    ],
    [SupportPageView.CONTACT]: [
      {
        label: 'Contact Support',
        description: 'For technical support or questions about this application, please email ‌spi_mail@gov.bc.ca',
        unit: 'Contact'
      }
    ]
  };

  return (
    <>
      <PageHeader title="Support" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction="row" gap={3} component={Paper} sx={{ p: 3 }}>
          {/* Sidebar with StandardsToolbar */}
          <Box width="300px" flexShrink={0}>
            <StandardsToolbar
              views={views}
              currentView={currentView}
              setCurrentView={setCurrentView}
              legend="Support Section"
            />
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* Main Content Area */}
          <Box flex="1 1 auto">
            <Typography variant="h2" gutterBottom>
              {views.find((view) => view.value === currentView)?.label}
            </Typography>

            {/* Descriptive text rendered dynamically */}

            <Box
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: grey[300],
                borderRadius: '8px',
                bgcolor: grey[50]
              }}>
              <Typography variant="body1" gutterBottom>
                {textMap[currentView] || 'No additional information available for this section.'}
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
          </Box>
        </Stack>
      </Container>
    </>
  );
};

export default SupportPage;
