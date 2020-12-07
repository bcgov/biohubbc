import { AppBar, Toolbar, Typography } from '@material-ui/core';
import React from 'react';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h5" noWrap>
          BioHub
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
