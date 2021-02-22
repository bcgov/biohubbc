import { Toolbar } from '@material-ui/core';
import React from 'react';
import 'styles/Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className={'app-footer'}>
      <Toolbar className={'app-footer-toolbar'} role="navigation" aria-label="Footer">
        <ul>
          <li>
            <a href="http://www.gov.bc.ca/gov/content/home/disclaimer">
              Disclaimer
            </a>
          </li>
          <li>
            <a href="http://www.gov.bc.ca/gov/content/home/privacy">
              Privacy
            </a>
          </li>
          <li>
            <a href="http://www.gov.bc.ca/gov/content/home/accessible-government">
              Accessibility
            </a>
          </li>
          <li>
            <a href="http://www.gov.bc.ca/gov/content/home/copyright">
              Copyright
            </a>
          </li>
        </ul>
      </Toolbar>
    </footer>
  );
};

export default Footer;
