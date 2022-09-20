import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import React from 'react';

export interface IHorizontalSplitFormComponentProps {
  title: string;
  summary: string;
  component: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  projectFormSection: {
    flexDirection: 'column',
    [theme.breakpoints.up('lg')]: {
      flexDirection: 'row'
    }
  },
  sectionDetails: {
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.up('lg')]: {
      paddingBottom: 0,
      paddingRight: theme.spacing(4),
      width: '400px'
    }
  }
}));

/**
 * Shared component for various survey sections
 *
 * @return {*}
 */
const HorizontalSplitFormComponent: React.FC<IHorizontalSplitFormComponentProps> = (props) => {
  const classes = useStyles();
  const { title, summary, component } = props;

  return (
    <>
      <Box className={classes.projectFormSection} width="100%" display="flex" flexWrap="nowrap">
        <Box flex="0 0 auto" className={classes.sectionDetails}>
          <Typography variant="h2">{title}</Typography>
          <Box pt={2} maxWidth="72ch">
            <Typography variant="body1" color="textSecondary">
              {summary}
            </Typography>
          </Box>
        </Box>
        <Box flex="1 1 auto">{component}</Box>
      </Box>
    </>
  );
};

export default HorizontalSplitFormComponent;
