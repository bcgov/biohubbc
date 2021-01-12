import { AppBar, Toolbar, Typography } from '@material-ui/core';
import TabsComponent from 'components/tabs/TabsComponent';
import React from 'react';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <Typography variant="h5" noWrap>
          BioHub
        </Typography>
      </Toolbar>
      <Toolbar variant="dense">
        <TabsComponent />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
