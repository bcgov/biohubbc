import { mdiFileOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import BorderLinearProgress from '../../components/BorderLinearProgress';

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
