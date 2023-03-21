import Chip, { ChipProps } from '@material-ui/core/Chip';
import { makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { BioHubSubmittedStatusType } from 'constants/misc';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    color: 'white'
  },
  chipUnSubmitted: {
    backgroundColor: theme.palette.error.main
  },
  chipSubmitted: {
    backgroundColor: theme.palette.success.main
  },
  chipRejected: {
    backgroundColor: theme.palette.error.main
  }
}));

export const SubmitStatusChip: React.FC<{ status: string; chipProps?: Partial<ChipProps> }> = (props) => {
  const classes = useStyles();

  let chipLabel;
  let chipStatusClass;

  if (props.status === BioHubSubmittedStatusType.REJECTED) {
    chipLabel = 'Rejected';
    chipStatusClass = classes.chipRejected;
  } else if (props.status === BioHubSubmittedStatusType.SUBMITTED) {
    chipLabel = 'Submitted';
    chipStatusClass = classes.chipSubmitted;
  } else {
    chipLabel = 'Unsubmitted';
    chipStatusClass = classes.chipUnSubmitted;
  }

  return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} {...props.chipProps} />;
};
