import { Theme } from '@mui/material';
import Chip, { ChipProps } from '@mui/material/Chip';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { PublishStatus } from 'constants/attachments';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  chipUnSubmitted: {
    color: '#fff',
    backgroundColor: theme.palette.error.main
  },
  chipSubmitted: {
    color: '#fff',
    backgroundColor: theme.palette.success.main
  },
  chipNoData: {}
}));

export const SubmitStatusChip: React.FC<{ status: PublishStatus; chipProps?: Partial<ChipProps> }> = (props) => {
  const classes = useStyles();

  let chipLabel;
  let chipTitle;
  let chipStatusClass;

  if (props.status === PublishStatus.NO_DATA) {
    chipLabel = 'No Data';
    chipTitle = 'No data to submit';
    chipStatusClass = classes.chipNoData;
  } else if (props.status === PublishStatus.SUBMITTED) {
    chipLabel = 'Submitted';
    chipTitle = 'All data has been submitted';
    chipStatusClass = classes.chipSubmitted;
  } else {
    chipLabel = 'Unsubmitted';
    chipTitle = 'Data has not been submitted';
    chipStatusClass = classes.chipUnSubmitted;
  }

  return (
    <Chip title={chipTitle} variant="filled" className={clsx(chipStatusClass)} label={chipLabel} {...props.chipProps} />
  );
};
