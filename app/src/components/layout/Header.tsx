import { AppBar, Button, Divider, Toolbar, Typography } from '@material-ui/core';
import React from 'react';
import { useHistory } from 'react-router-dom';

const Header: React.FC = () => {
  const history = useHistory();

  const navigateToProjectsPage = () => {
    history.push('/projects');
  };

  return (
    <AppBar position="static">
      <Toolbar style={{ backgroundColor: '#003366' }}>
        <Typography variant="h5" noWrap>
          <b>BioHub</b>
        </Typography>
      </Toolbar>
      <Divider style={{ backgroundColor: '#fcba19', height: '2px', width: '100%' }}></Divider>
      <Toolbar variant="dense" style={{ backgroundColor: '#38598A' }}>
        <Button onClick={navigateToProjectsPage} style={{ color: '#ECFFFB' }}>
          <Typography variant="h6">Projects</Typography>
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
