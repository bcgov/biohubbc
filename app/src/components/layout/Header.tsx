import { AppBar, Toolbar, Typography } from '@material-ui/core';
import TabsComponent from 'components/tabs/TabsComponent';
import React from 'react';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <Typography variant="h5" noWrap>
          BioHub1
        </Typography>
      </Toolbar>
      <Toolbar variant="dense" style={{color: '#add8e6'}}>
        <TabsComponent />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
