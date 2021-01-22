import { AppBar, Divider, Toolbar, Typography } from '@material-ui/core';
//import TabsComponent from 'components/tabs/TabsComponent';
import React from 'react';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar style={{backgroundColor: '#003366'}}>
        <Typography variant="h5" noWrap>
          <b>BioHub</b>
        </Typography>
      </Toolbar>
      <Divider style={{backgroundColor: '#fcba19', height: '2px', width:'100%'}}>
      </Divider>
      <Toolbar variant="dense" style={{backgroundColor: '#38598A'}}>
        {/* <TabsComponent /> */}
        <Typography variant="h6" noWrap>
          Projects
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
