import { mdiFileOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { IGetObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import BorderLinearProgress from './BorderLinearProgress';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(2),
    paddingLeft: '20px',
    overflow: 'hidden',
    '& .importFile-icon': {
      color: '#1a5a96'
    },
    '&.error': {
      borderColor: theme.palette.error.main,
      '& .importFile-icon': {
        color: theme.palette.error.main
      }
    }
  },
  observationFileName: {
    marginTop: '2px',
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textDecoration: 'underline',
    cursor: 'pointer'
  }
}));

export interface IValidatingObservationsCardProps {
  observationRecord: IGetObservationSubmissionResponse;
  onDownload: () => void;
}

const ValidatingObservationsCard = (props: IValidatingObservationsCardProps) => {
  const classes = useStyles();

  return (
    <Paper variant="outlined" className={clsx(classes.importFile, 'info')}>
      <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden', minHeight: '48px' }}>
        <Box display="flex" alignItems="center" flex="0 0 auto" mr={2} className="importFile-icon">
          <Icon path={mdiFileOutline} size={1} />
        </Box>
        <Box flex="1 1 auto" style={{ overflow: 'hidden' }}>
          <Link className={classes.observationFileName} variant="body2" onClick={props.onDownload}>
            <strong>{props.observationRecord.surveyObservationData.inputFileName}</strong>
          </Link>
        </Box>
      </Box>
      <Box mt={-1} mr={1} mb={1.75} ml={5}>
        <Typography variant="body2" color="textSecondary" component="div">
          {props.observationRecord.surveyObservationData.isValidating
            ? 'Importing file. Please wait...'
            : props.observationRecord.surveyObservationData.status}
        </Typography>
        <Box mt={1.5}>
          <BorderLinearProgress />
        </Box>
      </Box>
    </Paper>
  );
};

export default ValidatingObservationsCard;
