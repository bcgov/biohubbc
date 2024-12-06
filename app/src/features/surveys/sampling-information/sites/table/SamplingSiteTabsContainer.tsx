import { Box, Divider, Toolbar } from '@mui/material';
import { useState } from 'react';
import { SurveyBlocksTableContainer } from './tabs/blocks/SurveyBlocksTableContainer';
import { SamplingSiteTableContainer } from './tabs/sites/SamplingSiteTableContainer';
import { SamplingSiteManageTableView, SamplingSiteTableView } from './view/SamplingSiteTableView';

export const SamplingSiteTabsContainer = () => {
  const [activeView, setActiveView] = useState<SamplingSiteManageTableView>(SamplingSiteManageTableView.SITES);

  return (
    <>
      <Toolbar
        disableGutters
        sx={{
          flex: '1 1 auto',
          pl: 2,
          pr: 5.5,
          width: '100%'
        }}>
        {/* Tab toggles for switching views */}
        <SamplingSiteTableView activeView={activeView} setActiveView={setActiveView} />
      </Toolbar>

      <Divider flexItem />

      <Box height="400px">
        {/* Render child components based on the active view */}
        {activeView === SamplingSiteManageTableView.SITES && <SamplingSiteTableContainer />}
        {activeView === SamplingSiteManageTableView.CLUSTER && <SurveyBlocksTableContainer />}
      </Box>
    </>
  );
};
