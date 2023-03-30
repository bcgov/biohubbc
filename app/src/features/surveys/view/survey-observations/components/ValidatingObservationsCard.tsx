import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiInformationOutline } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { IGetObservationSubmissionResponse } from 'interfaces/useObservationApi.interface';
import React from 'react';
import BorderLinearProgress from './BorderLinearProgress';

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
      <Box flex="1 1 auto" style={{ overflow: 'hidden' }}>
        <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
          <Box className="importFile-icon" flex="0 0 auto" mr={2}>
            <Icon path={mdiInformationOutline} size={1} />
          </Box>
          <Box flex="1 1 auto" style={{ overflow: 'hidden' }}>
            <Typography
              className={classes.observationFileName}
              variant="body2"
              component="div"
              onClick={props.onDownload}>
              <strong>{props.observationRecord.surveyObservationData.inputFileName}</strong>
            </Typography>
          </Box>
        </Box>

        <Box ml={5} mr={1}>
          <Typography variant="body2" color="textSecondary" component="div">
            {props.observationRecord.surveyObservationData.isValidating
              ? 'Importing file. Please wait...'
              : props.observationRecord.surveyObservationData.status}
          </Typography>
          <Box mt={1.5}>
            <BorderLinearProgress />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ValidatingObservationsCard;
