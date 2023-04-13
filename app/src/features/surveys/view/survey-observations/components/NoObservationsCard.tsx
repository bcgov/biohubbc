import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    minHeight: '66px',
    padding: theme.spacing(2),
    paddingLeft: '20px',
    overflow: 'hidden',
    '& .importFile-icon': {
      color: theme.palette.text.secondary
    },
    '&.error': {
      borderColor: theme.palette.error.main,
      '& .importFile-icon': {
        color: theme.palette.error.main
      }
    }
  }
}));

export interface INoObservationsCardProps {
  onImport: () => void;
}

const NoObservationsCard: React.FC<INoObservationsCardProps> = (props) => {
  const classes = useStyles();

  return (
    <Paper variant="outlined" className={classes.importFile}>
      <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center">
        <Typography data-testid="observations-nodata" variant="body2" color="textSecondary">
          No Observation Data. &nbsp;
          <Link onClick={props.onImport}>Click Here to Import</Link>
        </Typography>
      </Box>
    </Paper>
  );
};

export default NoObservationsCard;
