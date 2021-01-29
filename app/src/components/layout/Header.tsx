
import {Link, Typography, AppBar, Divider, Toolbar } from '@material-ui/core';
import React from 'react';
//import appTheme from './../../themes/appTheme';


const Header: React.FC = () => {

  //const classes = appTheme;
  return (
    <AppBar position="static">
      <Toolbar style={{ backgroundColor: '#003366' }}>
        <Typography variant="h5" noWrap>
          <b>BioHub</b>
        </Typography>
      </Toolbar>
      <Divider style={{ backgroundColor: '#fcba19', height: '2px', width: '100%' }}></Divider>
      <Toolbar variant="dense" style={{ backgroundColor: '#38598A' }}>
        <Link href="#" variant="h5" style={{ color: '#ECFFFB'}}>
          Projects
        </Link>
      </Toolbar>
    </AppBar>

  );
};


export default Header;
