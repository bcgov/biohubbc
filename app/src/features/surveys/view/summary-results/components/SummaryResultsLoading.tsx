import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiFileOutline } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(2),
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
  },
  fileLoading: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}));

interface ILoadingProps {
  fileLoading: string;
}

const SummaryResultsLoading = (props: ILoadingProps) => {
  const { fileLoading } = props;
  const BorderLinearProgress = withStyles((theme: Theme) =>
    createStyles({
      root: {
        height: 6,
        borderRadius: 3
      },
      colorPrimary: {
        backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 300 : 700]
      },
      bar: {
        borderRadius: 3,
        backgroundColor: '#1976D2'
      }
    })
  )(LinearProgress);
  const classes = useStyles();

  return (
    <>
      <Paper variant="outlined" className={clsx(classes.importFile, 'info')}>
        <Box flex="1 1 auto" style={{ overflow: 'hidden' }}>
          <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
            <Box className="importFile-icon" flex="0 0 auto" mr={2}>
              <Icon path={mdiFileOutline} size={1} />
            </Box>
            <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
              <Typography className={classes.fileLoading} variant="body2" component="div">
                <strong>{fileLoading}</strong>
              </Typography>
            </Box>
          </Box>

          <Box mt={-1} mr={1} mb={1.75} ml={5}>
            <Typography variant="body2" color="textSecondary">
              Importing file. Please wait...
            </Typography>
            <Box mt={1.5}>
              <BorderLinearProgress />
            </Box>
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default SummaryResultsLoading;
