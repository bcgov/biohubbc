import { Box, Chip, Paper, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { mdiFileOutline } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { PublishStatus } from 'constants/attachments';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  importFile: {
    display: 'flex',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingRight: theme.spacing(2),
    paddingLeft: '20px',
    overflow: 'hidden',
    '& .importFile-icon': {
      color: '#1a5a96'
    },
    '&.error': {
      borderColor: '#ebccd1',
      '& .importFile-icon': {
        color: theme.palette.error.main
      },
      '& .MuiLink-root': {
        color: theme.palette.error.main
      },
      '& .MuiChip-root': {
        display: 'none'
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
  },
  chip: {
    minWidth: '7rem',
    fontSize: '11px',
    textTransform: 'uppercase'
  },
  chipUnSubmitted: {
    borderColor: '#afd3ee',
    backgroundColor: 'rgb(232, 244, 253)'
  },
  chipSubmitted: {
    color: '#2D4821',
    backgroundColor: '#DFF0D8'
  }
}));

export interface IAttachmentsFileCardProps {
  fileName: string;
  status: PublishStatus;
  size: number;
  submittedDate?: string;
}

const AttachmentsFileCard = (props: IAttachmentsFileCardProps) => {
  const classes = useStyles();

  let submittedDate = 'YYYY-MM-DD';

  if (props.submittedDate) {
    submittedDate = new Date(props.submittedDate).toISOString().split('T')[0];
  }
  return (
    <Paper variant="outlined" className={classes.importFile}>
      <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
        <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
          <Box display="flex" alignItems="center" flex="0 0 auto" mr={2} className="importFile-icon">
            <Icon path={mdiFileOutline} size={1} />
          </Box>
          <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden' }}>
            <strong>{props.fileName}</strong>
            <Typography data-testid="observations-nodata" variant="body2" color="textSecondary">
              {props.size} KB
            </Typography>
          </Box>
        </Box>

        <Box flex="0 0 auto" display="flex" alignItems="center">
          <Chip
            title={props.status === PublishStatus.SUBMITTED ? 'SUBMITTED' : 'UNSUBMITTED'}
            variant="outlined"
            className={
              props.status === PublishStatus.SUBMITTED
                ? clsx(classes.chip, classes.chipSubmitted)
                : clsx(classes.chip, classes.chipUnSubmitted)
            }
            label={props.status === PublishStatus.SUBMITTED ? `SUBMITTED: ${submittedDate}` : 'UNSUBMITTED'}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default AttachmentsFileCard;
