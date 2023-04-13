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
  },
  browseLink: {
    cursor: 'pointer'
  }
}));
interface INoSummaryResultsProps {
  clickToImport: () => void;
}
const NoSummaryResults = (props: INoSummaryResultsProps) => {
  const { clickToImport } = props;
  const classes = useStyles();
  return (
    <>
      <Paper variant="outlined" className={classes.importFile}>
        <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center">
          <Typography data-testid="summaries-nodata" variant="body2" color="textSecondary" component="div">
            No Summary Results. &nbsp;
            <Link onClick={() => clickToImport()} className={classes.browseLink}>
              Click Here to Import
            </Link>
          </Typography>
        </Box>
      </Paper>
    </>
  );
};

export default NoSummaryResults;
