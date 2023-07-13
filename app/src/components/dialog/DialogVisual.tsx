import { mdiAlert, mdiCheck, mdiExclamation, mdiFileCheckOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
  dialogVisual: {
    padding: 24,
    boxSizing: 'content-box',
    margin: '48px auto 0'
  },
  error: {
    color: '#a12622',
    backgroundColor: '#F5E9E8'
  },
  warning: {
    color: '#a12622',
    backgroundColor: '#a12622 10%'
  },
  info: {
    color: '#0972d3',
    backgroundColor: '#F2F8FD'
  },
  success: {
    color: '#2d4821',
    backgroundColor: '#dff0d8'
  }
}));

type Severity = 'error' | 'info' | 'success' | 'warning';

const defaultIcons: Record<Severity, string> = {
  error: mdiExclamation,
  info: mdiFileCheckOutline,
  success: mdiCheck,
  warning: mdiAlert
};

interface IDialogVisualProps {
  severity?: Severity;
  icon?: string;
}

const DialogVisual = (props: IDialogVisualProps) => {
  const classes = useStyles();

  const severity: Severity = props.severity || 'info';

  return (
    <Avatar className={clsx(classes.dialogVisual, classes[severity])} color="error">
      <Icon path={props.icon || defaultIcons[severity]} size={2} />
    </Avatar>
  );
};

export default DialogVisual;
