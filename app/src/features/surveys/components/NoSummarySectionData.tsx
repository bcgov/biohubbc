import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    minHeight: '66px',
    fontWeight: 700,
    color: theme.palette.text.secondary
  }
}));

interface NoSummarySectionDataProps {
  text: string;
}

const NoSummarySectionData = ({ text }: NoSummarySectionDataProps) => {
  const classes = useStyles();
  return (
    <>
      <Paper variant="outlined" className={classes.importFile}>
        <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center" p={2}>
          <span data-testid="no-summary-section-data">{text}</span>
        </Box>
      </Paper>
    </>
  );
};

export default NoSummarySectionData;
