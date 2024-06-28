import { mdiAutoFix, mdiMapMarker } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { SurveySitesTable } from 'features/surveys/view/components/sampling-data/SurveySitesTable';
import { SurveyTechniquesTable } from 'features/surveys/view/components/sampling-data/SurveyTechniquesTable';
import { IGetSampleSiteResponse } from 'interfaces/useSamplingSiteApi.interface';
import { IGetTechniquesResponse } from 'interfaces/useTechniqueApi.interface';
import { useState } from 'react';

export enum SurveySamplingView {
  TECHNIQUES = 'TECHNIQUES',
  SITES = 'SITES'
}

interface ISurveySamplingTabsProps {
  techniques?: IGetTechniquesResponse;
  sites?: IGetSampleSiteResponse;
}

export const SurveySamplingTabs = (props: ISurveySamplingTabsProps) => {
  const { techniques, sites } = props;

  const [activeView, setActiveView] = useState<SurveySamplingView>(SurveySamplingView.TECHNIQUES);

  return (
    <>
      <Box p={2} display="flex" flexDirection="row" justifyContent="space-between">
        <ToggleButtonGroup
          value={activeView}
          onChange={(_, view) => {
            if (!view) {
              // An active view must be selected at all times
              return;
            }

            setActiveView(view);
          }}
          exclusive
          sx={{
            display: 'flex',
            gap: 1,
            '& Button': {
              py: 0.25,
              px: 1.5,
              border: 'none',
              borderRadius: '4px !important',
              fontSize: '0.875rem',
              fontWeight: 700,
              letterSpacing: '0.02rem'
            }
          }}>
          <ToggleButton
            key="sampling-techniques-view"
            component={Button}
            color="primary"
            startIcon={<Icon path={mdiAutoFix} size={0.75} />}
            value={SurveySamplingView.TECHNIQUES}>
            {`Techniques (${techniques?.count ?? 0})`}
          </ToggleButton>
          <ToggleButton
            key="sampling-sites-view"
            component={Button}
            color="primary"
            startIcon={<Icon path={mdiMapMarker} size={0.75} />}
            value={SurveySamplingView.SITES}>
            {`Sites (${sites?.sampleSites.length ?? 0})`}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Divider />

      <Box p={2}>
        <Box>
          {activeView === SurveySamplingView.TECHNIQUES && (
            <Box position="relative">
              <SurveyTechniquesTable techniques={techniques} />
            </Box>
          )}

          {activeView === SurveySamplingView.SITES && (
            <Box position="relative">
              <SurveySitesTable sites={sites} />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
