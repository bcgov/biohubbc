import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import PageHeader from 'components/layout/PageHeader';
import { useState } from 'react';
import { StandardsToolbar } from './components/StandardsToolbar';
import { EnvironmentStandards } from './view/environment/EnvironmentStandards';
import { MethodStandards } from './view/methods/MethodStandards';
import { SpeciesStandards } from './view/species/SpeciesStandards';

export enum StandardsPageView {
  SPECIES = 'SPECIES',
  METHODS = 'METHODS',
  ENVIRONMENT = 'ENVIRONMENT'
}

export interface IStandardsPageView {
  label: string;
  value: StandardsPageView;
}

const StandardsPage = () => {
  const [currentView, setCurrentView] = useState(StandardsPageView.SPECIES);

  const views: IStandardsPageView[] = [
    { label: 'Species', value: StandardsPageView.SPECIES },
    { label: 'Sampling Methods', value: StandardsPageView.METHODS },
    { label: 'Environment variables', value: StandardsPageView.ENVIRONMENT }
  ];

  return (
    <>
      <PageHeader title="Standards" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction="row" gap={3} component={Paper} sx={{ p: 3 }}>
          {/* TOOLBAR FOR SWITCHING VIEWS */}
          <StandardsToolbar views={views} currentView={currentView} setCurrentView={setCurrentView} />

          {/* SPECIES STANDARDS */}
          {currentView === StandardsPageView.SPECIES && <SpeciesStandards />}

          {/* METHOD STANDARDS */}
          {currentView === StandardsPageView.METHODS && <MethodStandards />}

          {/* ENVIRONMENT STANDARDS */}
          {currentView === StandardsPageView.ENVIRONMENT && <EnvironmentStandards />}
        </Stack>
      </Container>
    </>
  );
};

export default StandardsPage;
