import { Container, makeStyles, Theme, Toolbar } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  appFooter: {
    backgroundColor: theme.palette.primary.main
  },
  appFooterContainer: {
    paddingLeft: 0,
    paddingRight: 0
  },
  appFooterToolbar: {
    '& ul': {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      margin: 0,
      padding: 0,
      minHeight: '46px',
      listStyleType: 'none'
    },
    '& li + li ': {
      marginLeft: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      borderLeft: '1px solid #4b5e7e'
    },
    '& a': {
      color: '#ffffff',
      textDecoration: 'none'
    },
    '& a:hover': {
      textDecoration: 'underline'
    }
  }
}));

const Footer: React.FC = () => {
  const classes = useStyles();

  return (
    <footer className={classes.appFooter}>
      <Container maxWidth="xl" className={classes.appFooterContainer}>
        <Toolbar className={classes.appFooterToolbar} role="navigation" aria-label="Footer">
          <ul>
            <li>
              <a href="https://www.gov.bc.ca/gov/content/home/disclaimer">Disclaimer</a>
            </li>
            <li>
              <a href="https://www.gov.bc.ca/gov/content/home/privacy">Privacy</a>
            </li>
            <li>
              <a href="https://www.gov.bc.ca/gov/content/home/accessible-government">Accessibility</a>
            </li>
            <li>
              <a href="https://www.gov.bc.ca/gov/content/home/copyright">Copyright</a>
            </li>
          </ul>
        </Toolbar>
      </Container>
    </footer>
  );
};

export default Footer;
