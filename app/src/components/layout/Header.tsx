import { AppBar, Toolbar } from '@material-ui/core';
import React from 'react';
import { Link } from "react-router-dom";

import 'styles/Header.scss';
import headerImageLarge from 'assets/images/gov-bc-logo-horiz.png';
import headerImageSmall from 'assets/images/gov-bc-logo-vert.png';

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar className={'app-header'}>
        <Link to="/projects" className={'brand'} color={'inherit'} aria-label="Go to BioHub Home">
          <picture>
            <source srcSet={headerImageLarge} media="(min-width: 1200px)"></source>
            <source srcSet={headerImageSmall} media="(min-width: 600px)"></source>
            <img src={headerImageSmall} alt={'Government of British Columbia'} />
          </picture>
          BioHub
        </Link>
      </Toolbar>
      <Toolbar variant="dense" className={'main-nav'} role="navigation" aria-label="Main Navigation">
        <Link to="/projects" color={'inherit'}>
          Projects
        </Link>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
