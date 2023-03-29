import Chip, { ChipProps } from '@material-ui/core/Chip';
import { makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { BioHubSubmittedStatusType } from 'constants/misc';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    fontSize: '12px'
  },
  chipUnSubmitted: {
    color: '#003366',
    backgroundColor: '#DCEBFB',
    textTransform: 'uppercase'
  },
  chipSubmitted: {
    color: '#2D4821',
    backgroundColor: '#DFF0D8'
  },
  chipRejected: {
    backgroundColor: theme.palette.error.main
  }
}));

export const SubmitStatusChip: React.FC<{ status: BioHubSubmittedStatusType; chipProps?: Partial<ChipProps> }> = (
  props
) => {
  const classes = useStyles();

  let chipLabel;
  let chipStatusClass;

  if (props.status === BioHubSubmittedStatusType.REJECTED) {
    chipLabel = 'Rejected';
    chipStatusClass = classes.chipRejected;
  } else if (props.status === BioHubSubmittedStatusType.SUBMITTED) {
    chipLabel = 'Submitted';
    chipStatusClass = 'colorSuccess';
  } else {
    chipLabel = 'Unsubmitted';
    chipStatusClass = classes.chipUnSubmitted;
  }

  return <Chip className={clsx(classes.chip, chipStatusClass)} label={chipLabel} {...props.chipProps} />;
};
