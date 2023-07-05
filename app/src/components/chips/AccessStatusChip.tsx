import Chip, { ChipProps } from '@mui/material/Chip';
import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { AdministrativeActivityStatusType } from 'constants/misc';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    color: 'white'
  },
  chipPending: {
    backgroundColor: theme.palette.error.main
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
    chipLabel = 'Pending Review';
    chipStatusClass = classes.chipPending;
  }

  return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} {...props.chipProps} />;
};
