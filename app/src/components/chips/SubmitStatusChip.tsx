import Chip, { ChipProps } from '@material-ui/core/Chip';
import { makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { PublishStatus } from 'constants/attachments';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
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
  },
  chipNoData: {
    backgroundColor: theme.palette.grey[300]
  }
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
    <Chip title={chipTitle} variant="outlined" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} {...props.chipProps} />
  );
};
