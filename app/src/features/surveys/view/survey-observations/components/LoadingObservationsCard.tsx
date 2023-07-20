import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    minHeight: '82px',
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

const LoadingObservationsCard = () => {
  const classes = useStyles();

  return (
    <Paper variant="outlined" className={classes.importFile}>
      <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center">
        <Typography data-testid="observations-nodata" variant="body2" color="textSecondary">
          Loading...
        </Typography>
      </Box>
    </Paper>
  );
};

export default LoadingObservationsCard;
