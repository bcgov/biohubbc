import Chip, { ChipProps } from '@material-ui/core/Chip';
import { makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { AdministrativeActivityStatusType } from 'constants/misc';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    color: 'white'
  },
  chipPending: {
    backgroundColor: theme.palette.primary.main
  },
  chipActioned: {
    backgroundColor: theme.palette.success.main
  },
  chipRejected: {
    backgroundColor: theme.palette.error.main
  }
}));

export const AccessStatusChip: React.FC<{ status: string; chipProps?: Partial<ChipProps> }> = (props) => {
  const classes = useStyles();

  let chipLabel;
  let chipStatusClass;

  if (props.status === AdministrativeActivityStatusType.REJECTED) {
    chipLabel = 'Denied';
    chipStatusClass = classes.chipRejected;
  } else if (props.status === AdministrativeActivityStatusType.ACTIONED) {
    chipLabel = 'Approved';
    chipStatusClass = classes.chipActioned;
  } else {
    chipLabel = 'Pending';
    chipStatusClass = classes.chipPending;
  }

  return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} {...props.chipProps} />;
};
