import { Theme } from '@mui/material';
import Chip, { ChipProps } from '@mui/material/Chip';
import { makeStyles } from '@mui/styles';
import { AdministrativeActivityStatusType } from 'constants/misc';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  chipPending: {
    color: '#fff',
    backgroundColor: theme.palette.error.main
  },
  chipActioned: {
    color: '#fff',
    backgroundColor: theme.palette.success.main
  },
  chipRejected: {
    color: '#fff',
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

  return <Chip variant="filled" className={chipStatusClass} label={chipLabel} {...props.chipProps} />;
};
