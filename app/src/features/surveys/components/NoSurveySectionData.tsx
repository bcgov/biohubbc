import Box from '@mui/material/Box';
import Paper, { PaperProps } from '@mui/material/Paper';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    minHeight: '66px',
    fontWeight: 700,
    color: theme.palette.text.secondary
  }
}));

interface NoSurveySectionDataProps {
  text: string;
  paperVariant?: PaperProps['variant'];
}

const NoSurveySectionData = ({ text, paperVariant }: NoSurveySectionDataProps) => {
  const classes = useStyles();
  return (
    <>
      <Paper variant={paperVariant} elevation={0} className={classes.importFile}>
        <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center" p={2}>
          <span data-testid="no-summary-section-data">{text}</span>
        </Box>
      </Paper>
    </>
  );
};

export default NoSurveySectionData;
