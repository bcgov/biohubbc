import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    minHeight: '66px',
    fontWeight: 700,
    color: theme.palette.text.secondary
  }
}));

const NoSummaryResults = () => {
  const classes = useStyles();
  return (
    <>
      <Paper variant="outlined" className={classes.importFile}>
        <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center" p={2}>
          <span data-testid="summaries-nodata">No Summary Results</span>
        </Box>
      </Paper>
    </>
  );
};

export default NoSummaryResults;
