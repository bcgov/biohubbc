import { Box, createStyles, Link, makeStyles, Theme, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    box: {
      backgroundColor: theme.palette.primary.main
    },
    typography: {
      color: theme.palette.primary.contrastText
    },
    link: {
      color: 'inherit',
      padding: theme.spacing(0, 2, 0)
    }
  })
);

const Footer: React.FC = () => {
  const classes = useStyles();

  return (
    <Box p={2} className={classes.box}>
      <Typography className={classes.typography}>
        <Link className={classes.link} href="http://www.gov.bc.ca/gov/content/home/disclaimer">
          Disclaimer
        </Link>
        <Link className={classes.link} href="http://www.gov.bc.ca/gov/content/home/privacy">
          Privacy
        </Link>
        <Link className={classes.link} href="http://www.gov.bc.ca/gov/content/home/accessible-government">
          Accessibility
        </Link>
        <Link className={classes.link} href="http://www.gov.bc.ca/gov/content/home/copyright">
          Copyright
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
