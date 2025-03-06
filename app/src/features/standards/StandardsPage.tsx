import { mdiLeaf, mdiPaw, mdiTag, mdiToolbox } from '@mdi/js';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import PageHeader from 'components/layout/PageHeader';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { SystemAlertBanner } from 'features/alert/banner/SystemAlertBanner';
import { SystemAlertBannerEnum } from 'interfaces/useAlertApi.interface';
import { useState } from 'react';
import { EnvironmentStandards } from './view/environment/EnvironmentStandards';
import { MarkingStandards } from './view/markings/MarkingStandards';
import { MethodStandards } from './view/methods/MethodStandards';
import { SpeciesStandards } from './view/species/SpeciesStandards';

export enum StandardsPageView {
  SPECIES = 'SPECIES',
  METHODS = 'METHODS',
  ENVIRONMENT = 'ENVIRONMENT',
  MARKINGS = 'MARKINGS'
}

const StandardsPage = () => {
  const [activeView, setActiveView] = useState(StandardsPageView.SPECIES);

  const views = [
    { value: StandardsPageView.SPECIES, label: 'Species', icon: mdiPaw },
    { value: StandardsPageView.METHODS, label: 'Sampling Methods', icon: mdiToolbox },
    { value: StandardsPageView.ENVIRONMENT, label: 'Environment variables', icon: mdiLeaf },
    { value: StandardsPageView.MARKINGS, label: 'Markings', icon: mdiTag }
  ];

  return (
    <>
      <PageHeader title="Standards" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SystemAlertBanner alertTypes={[SystemAlertBannerEnum.STANDARDS]} />
        <Stack direction="row" gap={3} component={Paper} sx={{ p: 3 }}>
          {/* TOOLBAR FOR SWITCHING VIEWS */}
          <Box width="300px" flexShrink={0}>
            <CustomToggleButtonGroup
              views={views}
              activeView={activeView}
              onViewChange={(view) => setActiveView(view)}
              orientation="vertical"
            />
          </Box>

          <Divider orientation="vertical" color={grey[500]} flexItem />

          <Box flex=" 1 1 auto">
            {/* SPECIES STANDARDS */}
            {activeView === StandardsPageView.SPECIES && <SpeciesStandards />}

            {/* METHOD STANDARDS */}
            {activeView === StandardsPageView.METHODS && <MethodStandards />}

            {/* ENVIRONMENT STANDARDS */}
            {activeView === StandardsPageView.ENVIRONMENT && <EnvironmentStandards />}

            {/* MARKING TYPE STANDARDS */}
            {activeView === StandardsPageView.MARKINGS && <MarkingStandards />}
          </Box>
        </Stack>
      </Container>
    </>
  );
};

export default StandardsPage;
